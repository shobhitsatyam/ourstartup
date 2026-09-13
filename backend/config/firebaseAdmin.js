import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let firebaseAdminApp = null;

/**
 * Initialize Firebase Admin SDK using server-side credentials
 * Checks for:
 * 1. FIREBASE_SERVICE_ACCOUNT (JSON string or Base64 encoded JSON in environment)
 * 2. GOOGLE_APPLICATION_CREDENTIALS (file path)
 * 3. FIREBASE_PROJECT_ID (defaults to zivanajewels-a44bd)
 */
export const initFirebaseAdmin = () => {
  if (getApps().length > 0) {
    firebaseAdminApp = getApps()[0];
    return firebaseAdminApp;
  }

  try {
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
    const projectId = process.env.FIREBASE_PROJECT_ID || 'zivanajewels-a44bd';

    if (serviceAccountEnv) {
      let credentials = null;
      try {
        let raw = serviceAccountEnv.trim();
        // Strip wrapping single or double quotes if added by shell or env files
        if (raw.startsWith("'") || raw.startsWith('"')) {
          raw = raw.slice(1).trim();
        }
        if (raw.endsWith("'") || raw.endsWith('"')) {
          raw = raw.slice(0, -1).trim();
        }

        // Attempt direct JSON parse first
        try {
          credentials = JSON.parse(raw);
        } catch (directJsonErr) {
          // Attempt Base64 decode then JSON parse
          try {
            const decodedFromBase64 = Buffer.from(raw, 'base64').toString('utf8');
            credentials = JSON.parse(decodedFromBase64);
          } catch (base64Err) {
            throw new Error(`Neither direct JSON nor Base64 JSON could be parsed: ${directJsonErr.message}`);
          }
        }
      } catch (parseError) {
        console.error('[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', parseError.message);
      }

      if (credentials) {
        if (credentials.private_key && typeof credentials.private_key === 'string') {
          credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
        }
        firebaseAdminApp = initializeApp({
          credential: cert(credentials),
          projectId: credentials.project_id || projectId,
        });
        console.log('[Firebase Admin] Initialized with service account certificate');
        return firebaseAdminApp;
      }
    }

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      firebaseAdminApp = initializeApp({
        credential: applicationDefault(),
        projectId,
      });
      console.log('[Firebase Admin] Initialized with application default credentials');
      return firebaseAdminApp;
    }

    // Default project initialization
    if (projectId) {
      firebaseAdminApp = initializeApp({
        projectId,
      });
      console.log(`[Firebase Admin] Initialized with project ID: ${projectId}`);
      return firebaseAdminApp;
    }
  } catch (err) {
    console.warn('[Firebase Admin] Initialization notice:', err.message);
  }

  return firebaseAdminApp;
};

/**
 * Verify a Firebase ID token cryptographically
 * @param {string} idToken
 * @returns {Promise<import('firebase-admin/auth').DecodedIdToken>}
 */
export const verifyFirebaseToken = async (idToken) => {
  if (!idToken) {
    throw new Error('No Firebase ID token provided');
  }

  initFirebaseAdmin();

  if (!getApps().length) {
    throw new Error('Firebase Admin SDK is not initialized. Please configure FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID.');
  }

  const auth = getAuth(getApps()[0]);
  return await auth.verifyIdToken(idToken);
};
