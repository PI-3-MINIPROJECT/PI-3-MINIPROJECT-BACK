import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Initialize Firebase Admin SDK
 * @returns {admin.app.App} Firebase Admin app instance
 */
export const initializeFirebase = (): admin.app.App => {
  // Check if Firebase is already initialized
  if (admin.apps.length > 0) {
    return admin.apps[0] as admin.app.App;
  }

  // Initialize Firebase Admin SDK
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
    throw new Error('Missing Firebase configuration. Please check your .env file.');
  }

  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });

  return app;
};

/**
 * Get Firestore database instance
 * @returns {FirebaseFirestore.Firestore} Firestore instance
 */
export const getFirestoreInstance = (): FirebaseFirestore.Firestore => {
  return getFirestore();
};

/**
 * Get Firebase Auth instance
 * @returns {admin.auth.Auth} Firebase Auth instance
 */
export const getAuthInstance = (): admin.auth.Auth => {
  return admin.auth();
};

