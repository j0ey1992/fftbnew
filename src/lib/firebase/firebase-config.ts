'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Log Firebase configuration for debugging (without exposing sensitive values)
console.log('Firebase Configuration Check:', {
  apiKeyPresent: !!firebaseConfig.apiKey,
  apiKeyFirstChars: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 8)}...` : null,
  authDomainPresent: !!firebaseConfig.authDomain,
  projectIdPresent: !!firebaseConfig.projectId,
  storageBucketPresent: !!firebaseConfig.storageBucket,
  messagingSenderIdPresent: !!firebaseConfig.messagingSenderId,
  appIdPresent: !!firebaseConfig.appId,
  environment: process.env.NODE_ENV
});

// Log Firebase configuration for debugging (without exposing sensitive values)
console.log('Firebase Configuration Check:', {
  apiKeyPresent: !!firebaseConfig.apiKey,
  authDomainPresent: !!firebaseConfig.authDomain,
  projectIdPresent: !!firebaseConfig.projectId,
  storageBucketPresent: !!firebaseConfig.storageBucket,
  messagingSenderIdPresent: !!firebaseConfig.messagingSenderId,
  appIdPresent: !!firebaseConfig.appId,
  measurementIdPresent: !!firebaseConfig.measurementId,
  environment: process.env.NODE_ENV
});

// Initialize Firebase with fallback values for development if needed
const devConfig = {
  apiKey: firebaseConfig.apiKey || "dev-api-key",
  authDomain: firebaseConfig.authDomain || "dev-project.firebaseapp.com",
  projectId: firebaseConfig.projectId || "dev-project",
  storageBucket: firebaseConfig.storageBucket || "dev-project.appspot.com",
  messagingSenderId: firebaseConfig.messagingSenderId || "000000000000",
  appId: firebaseConfig.appId || "1:000000000000:web:0000000000000000000000",
  measurementId: firebaseConfig.measurementId || "G-0000000000"
};

// Use development config only in development mode and when env vars are missing
const configToUse = process.env.NODE_ENV === 'development' && !firebaseConfig.apiKey
  ? devConfig
  : firebaseConfig;

// Declare variables that will be initialized in try-catch
let app: any;
let db: any;
let storage: any;
let functions: any;
let auth: any;

try {
  // Initialize Firebase
  app = getApps().length > 0 ? getApp() : initializeApp(configToUse);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app);
  auth = getAuth(app);

  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  
  // Create dummy exports to prevent app from crashing
  app = {} as any;
  db = {} as any;
  storage = {} as any;
  functions = {} as any;
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signInWithCustomToken: async () => ({ user: null }),
    signOut: async () => {}
  } as any;
  
  console.log('Using fallback Firebase implementation');
}

export { app, db, storage, functions, auth };
