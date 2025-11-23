// Export all Firebase-related functionality from a single location

// Firebase configuration
export { firebaseApp, firestoreDB, firebaseAuth, firebaseStorage } from './config';

// Authentication
export * from './auth';

// VVS pairs
export * from './vvs-pairs';

// Projects
export * from './projects';

// Firebase Functions
export * from './functions-service';

// Firebase Storage
export * from './storage';

// Data initialization
export { useInitializeFirebaseData, FirebaseDataInitializer } from './init-data';
