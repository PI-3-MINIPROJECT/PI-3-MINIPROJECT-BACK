import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

let firebaseApp: admin.app.App | null = null;

/**
 * Initialize Firebase Admin SDK
 */
export const initializeFirebase = (): admin.app.App => {
  if (firebaseApp) return firebaseApp!;

  if (admin.apps.length > 0) {
    firebaseApp = admin.apps[0];
    return firebaseApp!;
  }

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
    throw new Error('Missing Firebase configuration. Please check your .env file.');
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  console.log("Bucket: " + process.env.FIREBASE_STORAGE_BUCKET);
  console.log("Client Email: " + process.env.FIREBASE_CLIENT_EMAIL);
  console.log("Project ID: " + process.env.FIREBASE_PROJECT_ID);
  console.log("Private Key: " + process.env.FIREBASE_PRIVATE_KEY);

  return firebaseApp!;
};

/**
 * Always return auth instance from the initialized app
 */
export const getAuthInstance = (): admin.auth.Auth => {
  const app = initializeFirebase();
  return admin.auth(app);
};

/**
 * Always return Firestore instance from the initialized app
 */
export const getFirestoreInstance = (): FirebaseFirestore.Firestore => {
  const app = initializeFirebase();
  return getFirestore(app);
};