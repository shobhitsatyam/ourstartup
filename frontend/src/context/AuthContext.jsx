import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import api, { API_BASE_URL } from '../services/api';
import { useToast } from './ToastContext';
import { auth, isFirebaseConfigured } from '../lib/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    // 0. Purge any stale legacy Supabase auth tokens from localStorage
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {}

    // 1. Initial load from localStorage
    const stored = localStorage.getItem('ocean_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        // Sync fresh profile from backend in background
        api
          .get(`${API_BASE_URL}/api/auth/me`)
          .then((res) => {
            if (res.data?.success) {
              const freshData = { ...res.data.data, token: parsed.token };
              setUser(freshData);
              localStorage.setItem('ocean_user', JSON.stringify(freshData));
            }
          })
          .catch(() => {
            console.warn('Session expired or offline profile load');
          });
      } catch (e) {
        localStorage.removeItem('ocean_user');
      }
    }
    setLoading(false);

    // 2. Firebase auth state listener
    let unsubscribe = null;
    if (isFirebaseConfigured && auth) {
      try {
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            // If Firebase user is authenticated but no local session exists, keep in sync
            const currentStored = localStorage.getItem('ocean_user');
            if (!currentStored) {
              try {
                const idToken = await firebaseUser.getIdToken();
                const res = await api.post(`${API_BASE_URL}/api/auth/google`, {
                  email: firebaseUser.email,
                  name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Valued Patron',
                  avatar: firebaseUser.photoURL || '',
                  googleId: firebaseUser.uid,
                  idToken,
                });
                if (res.data?.success) {
                  const userData = res.data.data;
                  setUser(userData);
                  localStorage.setItem('ocean_user', JSON.stringify(userData));
                }
              } catch (err) {
                console.warn('Silent Firebase state sync skipped:', err.message);
              }
            }
          }
        });
      } catch (err) {
        console.warn('Firebase onAuthStateChanged setup notice:', err.message);
      }
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      // Authenticate with application backend (supports both customers and admin)
      const res = await api.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      if (res.data?.success) {
        const userData = res.data.data;
        setUser(userData);
        localStorage.setItem('ocean_user', JSON.stringify(userData));

        // Sync with Firebase Authentication in background if configured
        if (isFirebaseConfigured && auth) {
          try {
            await signInWithEmailAndPassword(auth, email, password);
          } catch (fbErr) {
            // If user existed in MongoDB before Firebase, seamlessly register them in Firebase
            if (fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/invalid-credential') {
              try {
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                if (userData.name) {
                  await updateFirebaseProfile(cred.user, { displayName: userData.name });
                }
              } catch (createErr) {
                // Ignore background sync errors
              }
            }
          }
        }

        addToast(`Welcome back, ${userData.name}!`, 'success');
        return { success: true, user: userData };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      addToast(message, 'error');
      return { success: false, message };
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      // 1. Create in Firebase if configured
      if (isFirebaseConfigured && auth) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          if (name) {
            await updateFirebaseProfile(cred.user, { displayName: name });
          }
        } catch (fbErr) {
          if (fbErr.code === 'auth/email-already-in-use') {
            const message = 'An account with this email already exists. Please log in.';
            addToast(message, 'error');
            return { success: false, message };
          } else if (fbErr.code === 'auth/weak-password') {
            const message = 'Password must be at least 6 characters.';
            addToast(message, 'error');
            return { success: false, message };
          }
          console.warn('Firebase registration notice:', fbErr.message);
        }
      }

      // 2. Register in application backend (MongoDB)
      const res = await api.post(`${API_BASE_URL}/api/auth/register`, { name, email, phone, password });
      if (res.data?.success) {
        const userData = res.data.data;
        setUser(userData);
        localStorage.setItem('ocean_user', JSON.stringify(userData));
        addToast(`Welcome to Zivana Jewels, ${userData.name}! You earned 50 welcome points.`, 'success');
        return { success: true, user: userData };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      addToast(message, 'error');
      return { success: false, message };
    }
  };

  const loginWithGoogle = async (googleData) => {
    try {
      console.log('[Auth] Syncing Google user with backend...', {
        emailProvided: !!googleData.email,
        idTokenProvided: !!googleData.idToken,
      });
      const res = await api.post(`${API_BASE_URL}/api/auth/google`, googleData);
      if (res.data?.success) {
        console.log('[Auth] Backend Google authentication succeeded');
        const userData = res.data.data;
        setUser(userData);
        localStorage.setItem('ocean_user', JSON.stringify(userData));
        addToast(`Welcome to Zivana Jewels, ${userData.name}!`, 'success');
        return { success: true, user: userData };
      }
      console.warn('[Auth] Backend Google authentication returned error:', res.data?.message);
      return { success: false, message: res.data?.message || 'Google authentication sync failed.' };
    } catch (error) {
      console.error('[Auth] Backend Google authentication failed:', error.response?.data?.message || error.message);
      const message = error.response?.data?.message || 'Google authentication sync failed.';
      return { success: false, message };
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('ocean_user');
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {}
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn('Firebase signOut error:', e);
    }
    addToast('You have been signed out.', 'info');
  };

  const refreshUser = async () => {
    try {
      const res = await api.get(`${API_BASE_URL}/api/auth/me`);
      if (res.data?.success) {
        const updated = { ...res.data.data, token: user?.token };
        setUser(updated);
        localStorage.setItem('ocean_user', JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('Error refreshing user details:', e);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put(`${API_BASE_URL}/api/auth/profile`, profileData);
      if (res.data?.success) {
        const updated = { ...res.data.data, token: user?.token };
        setUser(updated);
        localStorage.setItem('ocean_user', JSON.stringify(updated));
        addToast('Profile updated successfully!', 'success');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile.';
      addToast(message, 'error');
      return { success: false, message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
