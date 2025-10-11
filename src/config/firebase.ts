import admin from 'firebase-admin';

let isFirebaseInitialized = false;

export const initializeFirebase = () => {
  try {
    // Check if Firebase has already been initialized
    if (admin.apps.length === 0) {
      let credential;
      
      // Try BASE64 encoded service account first (for production)
      const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
      if (serviceAccountBase64) {
        try {
          const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
          const serviceAccount = JSON.parse(serviceAccountJson);
          credential = admin.credential.cert(serviceAccount);
          console.log('✅ Using BASE64 encoded Firebase service account');
        } catch (error) {
          console.error('❌ Error parsing BASE64 service account:', error);
          isFirebaseInitialized = false;
          return;
        }
      } else {
        // Fallback to file-based service account (for local development)
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        
        if (!serviceAccountPath) {
          console.warn('⚠️  Neither FIREBASE_SERVICE_ACCOUNT_BASE64 nor FIREBASE_SERVICE_ACCOUNT_PATH found');
          console.warn('⚠️  Please set one of these in your .env file');
          console.warn('⚠️  Running in development mode without Firebase');
          isFirebaseInitialized = false;
          return;
        }

        try {
          credential = admin.credential.cert(serviceAccountPath);
          console.log('✅ Using file-based Firebase service account');
        } catch (error) {
          console.error('❌ Error loading service account file:', error);
          isFirebaseInitialized = false;
          return;
        }
      }

      admin.initializeApp({
        credential,
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


export const getFirebaseAdmin = () => {
  if (!isFirebaseInitialized) {
    throw new Error('Firebase is not initialized. Please configure Firebase first.');
  }
  return admin;
};

export const getAuth = (): admin.auth.Auth => {
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

export const getFirebaseMessaging = (): admin.messaging.Messaging => {
  if (!isFirebaseInitialized) {
    throw new Error('Firebase is not initialized. Please configure Firebase first.');
  }
  return admin.messaging();
};

export const isFirebaseReady = () => isFirebaseInitialized;
