import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Default project Firebase configuration for gd-web-tracker
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAj-6BYSuRs5QpxkKB0MKrDL-3pK2xWgGY",
  authDomain: "gd-web-tracker.firebaseapp.com",
  projectId: "gd-web-tracker",
  storageBucket: "gd-web-tracker.firebasestorage.app",
  messagingSenderId: "815933422124",
  appId: "1:815933422124:web:5751198651d49ab5096f89",
  measurementId: "G-7QLTGT53KT",
};

const getFirebaseConfig = () => {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId,
  };
};

export const isFirebaseConfigured = (): boolean => {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.projectId);
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export const getFirebaseApp = (): FirebaseApp | null => {
  if (!isFirebaseConfigured()) return null;

  if (!app) {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      app = existingApps[0];
    } else {
      app = initializeApp(getFirebaseConfig());
    }
  }
  return app;
};

export const getFirestoreDb = (): Firestore | null => {
  if (!db) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) {
      db = getFirestore(firebaseApp);
    }
  }
  return db;
};
