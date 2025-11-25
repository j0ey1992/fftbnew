'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Firebase configuration object with API keys and project settings
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Check if Firebase credentials are available
const hasFirebaseCredentials = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

// Initialize Firebase
let firebaseApp: FirebaseApp | undefined;
let firestoreDB: Firestore | undefined;
let firebaseAuth: Auth | undefined;
let firebaseStorage: FirebaseStorage | undefined;

// Initialize Firebase immediately only if credentials are available
if (hasFirebaseCredentials) {
  try {
    // Prevent multiple initializations in development with React strict mode
    if (!getApps().length) {
      console.log('Initializing Firebase app...');
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      console.log('Using existing Firebase app...');
      firebaseApp = getApps()[0];
    }

    firebaseAuth = getAuth(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);

    // Initialize Firestore directly
    firestoreDB = getFirestore(firebaseApp);
    console.log('Firestore initialized successfully');

    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    // Don't throw - allow the app to build without Firebase
  }
} else {
  console.warn('Firebase credentials not configured - Firebase features will be disabled');
}

// Helper function to get Firestore instance
export const getFirestoreInstance = (): Firestore | undefined => {
  if (!firestoreDB) {
    console.warn('Firestore not initialized - Firebase credentials may be missing');
    return undefined;
  }
  return firestoreDB;
};

export { firebaseApp, firestoreDB, firebaseAuth, firebaseStorage, hasFirebaseCredentials };