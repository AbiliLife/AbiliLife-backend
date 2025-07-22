import admin from 'firebase-admin';

let isFirebaseInitialized = false;

export const initializeFirebase = () => {
  try {
    // Check if Firebase has already been initialized
    if (admin.apps.length === 0) {
      // You'll need to replace this with your actual Firebase service account key
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      
      if (!serviceAccountPath) {
        console.warn('⚠️  Firebase service account path not found in environment variables');
        console.warn('⚠️  Please set FIREBASE_SERVICE_ACCOUNT_PATH in your .env file');
        console.warn('⚠️  Running in development mode without Firebase');
        isFirebaseInitialized = false;
        return;
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

      console.log('✅ Firebase Admin SDK initialized successfully');
      isFirebaseInitialized = true;
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    isFirebaseInitialized = false;
  }
};

export const getAuth = () => {
  if (!isFirebaseInitialized) {
    throw new Error('Firebase is not initialized. Please configure Firebase first.');
  }
  return admin.auth();
};

export const getFirestore = () => {
  if (!isFirebaseInitialized) {
    throw new Error('Firebase is not initialized. Please configure Firebase first.');
  }
  return admin.firestore();
};

export const isFirebaseReady = () => isFirebaseInitialized;
