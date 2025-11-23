import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

/**
 * Server-side Firebase configuration for API routes
 * This config doesn't use 'use client' directive and is safe for server-side use
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBYxQcYpSq5fy4IV2TS2JdvzWj0xeQryds",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "trollslots.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://trollslots-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "trollslots",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "trollslots.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "46153943068",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:46153943068:web:f6892744df289165f437d9"
};

// Initialize Firebase for server-side use
let serverFirebaseApp: FirebaseApp;
let serverFirestoreDB: Firestore;
let serverFirebaseStorage: FirebaseStorage;

// Initialize Firebase immediately
try {
  // Check if we already have a Firebase app initialized
  const existingApps = getApps();
  
  if (existingApps.length === 0) {
    console.log('Initializing server-side Firebase app...');
    serverFirebaseApp = initializeApp(firebaseConfig, 'server-app');
  } else {
    // Try to find existing server app or use the first one
    const serverApp = existingApps.find(app => app.name === 'server-app');
    if (serverApp) {
      console.log('Using existing server-side Firebase app...');
      serverFirebaseApp = serverApp;
    } else {
      console.log('Creating new server-side Firebase app...');
      serverFirebaseApp = initializeApp(firebaseConfig, 'server-app');
    }
  }

  serverFirestoreDB = getFirestore(serverFirebaseApp);
  serverFirebaseStorage = getStorage(serverFirebaseApp);
  
  console.log('Server-side Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing server-side Firebase:', error);
  
  // Fallback: try to use default app if it exists
  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      console.log('Falling back to existing Firebase app...');
      serverFirebaseApp = existingApps[0];
      serverFirestoreDB = getFirestore(serverFirebaseApp);
      serverFirebaseStorage = getStorage(serverFirebaseApp);
    } else {
      throw error;
    }
  } catch (fallbackError) {
    console.error('Fallback Firebase initialization failed:', fallbackError);
    throw fallbackError;
  }
}

export { serverFirebaseApp, serverFirestoreDB, serverFirebaseStorage };
