import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from 'firebase/auth';

const apiKey = (import.meta.env.VITE_FIREBASE_API_KEY || '').trim();
const projectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID || 'zivanajewels-a44bd').trim();
const authDomain = (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`).trim();
const storageBucket = (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`).trim();
const messagingSenderId = (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim();
const appId = (import.meta.env.VITE_FIREBASE_APP_ID || '').trim();

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

// Check whether Firebase environment variables are actively populated
export const isFirebaseConfigured = Boolean(
  apiKey &&
  apiKey !== 'your-firebase-api-key' &&
  !apiKey.includes('placeholder')
);

// Initialize Firebase App instance safely (singleton pattern)
export const app = !getApps().length
  ? initializeApp(
      isFirebaseConfigured
        ? firebaseConfig
        : {
            apiKey: 'AIzaSyDemoPlaceholderKey1234567890',
            authDomain: `${projectId}.firebaseapp.com`,
            projectId: projectId || 'zivanajewels-a44bd',
            appId: '1:1234567890:web:abcdef',
          }
    )
  : getApp();

export const auth = getAuth(app);

// Enable local persistence so sessions remain authenticated across page reloads
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Firebase setPersistence notice:', err?.message || err);
  });
}

// Google Auth Provider setup with account selection prompt
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});
