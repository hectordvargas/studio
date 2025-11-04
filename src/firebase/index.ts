
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

// Helper function to check if the config is valid
function isConfigValid(config: any) {
    return config && config.apiKey && config.apiKey !== "AIzaSyCXXXXXXXXXXXXXXXXXXXXXXX";
}

interface FirebaseServices {
    firebaseApp: FirebaseApp | null;
    auth: Auth | null;
    firestore: Firestore | null;
}

export function initializeFirebase(): FirebaseServices {
  if (!isConfigValid(firebaseConfig)) {
      console.warn("Firebase configuration is invalid or missing. Firebase services will be unavailable.");
      return { firebaseApp: null, auth: null, firestore: null };
  }
  
  const isConfigured = getApps().length > 0;
  const firebaseApp = isConfigured ? getApp() : initializeApp(firebaseConfig);
  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp): FirebaseServices {
  try {
    const firestore = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);
    
    return {
      firebaseApp,
      auth,
      firestore
    };
  } catch (error) {
    console.error("Error initializing Firebase SDKs. This might be due to a malformed config even if it looks valid.", error);
    return { firebaseApp, auth: null, firestore: null };
  }
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
