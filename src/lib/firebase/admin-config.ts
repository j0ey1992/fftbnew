import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

/**
 * Firebase Admin SDK configuration for server-side operations
 * This bypasses Firestore security rules and is used for API routes
 */

let adminApp: any = null;
let adminFirestore: any = null;
let adminStorage: any = null;
let isInitialized = false;

function initializeAdmin() {
  if (isInitialized) return;

  try {
    // Check if admin app is already initialized
    const existingApps = getApps();
    const adminAppExists = existingApps.find(app => app.name === 'admin-app');

    if (!adminAppExists) {
      // Only initialize if we have the environment variable
      if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        console.warn('Firebase Admin SDK not initialized: FIREBASE_SERVICE_ACCOUNT_KEY not set');
        return;
      }

      console.log('Initializing Firebase Admin SDK...');
      const serviceAccount: ServiceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'trollslots',
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'trollslots.appspot.com'
      }, 'admin-app');

      console.log('Firebase Admin SDK initialized successfully');
    } else {
      console.log('Using existing Firebase Admin app...');
      adminApp = adminAppExists;
    }

    if (adminApp) {
      adminFirestore = getFirestore(adminApp);
      adminStorage = getStorage(adminApp);
    }

    isInitialized = true;
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
  }
}

// Initialize on import
initializeAdmin();

export { adminApp, adminFirestore, adminStorage };
