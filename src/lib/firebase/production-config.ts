/**
 * Production-safe Firebase configuration that handles missing environment variables gracefully
 * This prevents build failures during static generation when env vars are not available
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

// Check if we're in a build environment (static generation)
const isBuildTime = typeof window === 'undefined' && process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

// Production Firebase configuration with fallbacks
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBYxQcYpSq5fy4IV2TS2JdvzWj0xeQryds",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "trollslots.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "trollslots",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "trollslots.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "46153943068",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:46153943068:web:f6892744df289165f437d9",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-0000000000"
};

// Log configuration status (without exposing sensitive values)
if (!isBuildTime) {
  console.log('Firebase Configuration Check:', {
    apiKeyPresent: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomainPresent: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectIdPresent: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucketPresent: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderIdPresent: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appIdPresent: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementIdPresent: !!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    environment: process.env.NODE_ENV,
    isBuildTime
  });
}

// Initialize Firebase with error handling
let app: any;
let db: any;
let storage: any;
let functions: any;
let auth: any;

try {
  if (isBuildTime) {
    // During build time, create mock implementations to prevent errors
    console.log('Build-time detected: Using mock Firebase implementations');
    
    app = {
      name: '[DEFAULT]',
      options: firebaseConfig
    };
    
    db = {
      app,
      type: 'firestore'
    };
    
    storage = {
      app,
      type: 'storage'
    };
    
    functions = {
      app,
      type: 'functions'
    };
    
    auth = {
      app,
      currentUser: null,
      onAuthStateChanged: () => () => {},
      signInWithCustomToken: async () => ({ user: null }),
      signOut: async () => {}
    };
    
  } else {
    // Runtime initialization
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    functions = getFunctions(app);
    auth = getAuth(app);
    
    console.log('Firebase initialized successfully');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  
  // Fallback implementations to prevent app crashes
  app = {
    name: '[DEFAULT]',
    options: firebaseConfig
  };
  
  db = {
    app,
    type: 'firestore-fallback'
  };
  
  storage = {
    app,
    type: 'storage-fallback'
  };
  
  functions = {
    app,
    type: 'functions-fallback'
  };
  
  auth = {
    app,
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signInWithCustomToken: async () => ({ user: null }),
    signOut: async () => {}
  };
  
  console.log('Using fallback Firebase implementation');
}

export { app, db, storage, functions, auth };
export { firebaseConfig };