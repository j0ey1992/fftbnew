'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Firebase configuration object with API keys and project settings
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBYxQcYpSq5fy4IV2TS2JdvzWj0xeQryds",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "trollslots.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://trollslots-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "trollslots",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "trollslots.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "46153943068",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:46153943068:web:f6892744df289165f437d9"
};

// Initialize Firebase
let firebaseApp: FirebaseApp;
let firestoreDB: Firestore;
let firebaseAuth: Auth;
let firebaseStorage: FirebaseStorage;

// Initialize Firebase immediately
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
  throw error;
}

// Helper function to get Firestore instance
export const getFirestoreInstance = (): Firestore => {
  if (!firestoreDB) {
    throw new Error('Firestore not initialized');
  }
  return firestoreDB;
};

export { firebaseApp, firestoreDB, firebaseAuth, firebaseStorage };