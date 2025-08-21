// lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAzy8ymL2ptkmNnbhoQDxMRCh5F0WlcO5w",
  authDomain: "daily-digest-333e9.firebaseapp.com",
  projectId: "daily-digest-333e9",
  storageBucket: "daily-digest-333e9.firebasestorage.app",
  messagingSenderId: "746944694033",
  appId: "1:746944694033:web:4a4e292c27c9a3adeeaeb0",
  measurementId: "G-FL229NV189"
};

// Initialize Firebase app
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

// Initialize Firebase only on client side
const initializeFirebase = () => {
  if (typeof window === 'undefined') return;
  
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      console.log('Firebase app initialized successfully');
    } else {
      app = getApps()[0];
      console.log('Using existing Firebase app');
    }

    if (app) {
      // Initialize Firestore
      db = getFirestore(app);
      console.log('Firestore initialized successfully');

      // Initialize Auth
      auth = getAuth(app);
      console.log('Firebase Auth initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    // Don't throw error, let components handle undefined instances
  }
};

// Initialize Firebase when this module is imported
if (typeof window !== 'undefined') {
  // Use a longer delay to ensure DOM is fully ready and avoid hydration issues
  setTimeout(() => {
    initializeFirebase();
  }, 100);
}

// Export instances
export { db, auth };
