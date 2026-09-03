import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const loadStoredUser = async () => {
      const stored = localStorage.getItem('ocean_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          // Sync fresh profile in background
          try {
            const res = await api.get(`${API_BASE_URL}/api/auth/me`);
            if (res.data?.success) {
              const freshData = { ...res.data.data, token: parsed.token };
              setUser(freshData);
              localStorage.setItem('ocean_user', JSON.stringify(freshData));
            }
          } catch (e) {
            console.warn('Session expired or offline profile load');
          }
        } catch (e) {
          localStorage.removeItem('ocean_user');
        }
      }
      setLoading(false);
    };

    loadStoredUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      if (res.data?.success) {
        const userData = res.data.data;
        setUser(userData);
        localStorage.setItem('ocean_user', JSON.stringify(userData));
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
      const res = await api.post(`${API_BASE_URL}/api/auth/register`, { name, email, phone, password });
      if (res.data?.success) {
        const userData = res.data.data;
        setUser(userData);
        localStorage.setItem('ocean_user', JSON.stringify(userData));
        addToast(`Welcome to Ocean Jewel, ${userData.name}! You earned 50 welcome points.`, 'success');
        return { success: true, user: userData };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      addToast(message, 'error');
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ocean_user');
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
