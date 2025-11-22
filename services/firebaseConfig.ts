
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, Firestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA75zy4K9eHgk7tWlIAg_CM4a24GQRqlsw",
  authDomain: "studio-4353293918-a9f81.firebaseapp.com",
  databaseURL: "https://studio-4353293918-a9f81-default-rtdb.firebaseio.com",
  projectId: "studio-4353293918-a9f81",
  storageBucket: "studio-4353293918-a9f81.firebasestorage.app",
  messagingSenderId: "108687545840",
  appId: "1:108687545840:web:07824a77d0e4801793f935"
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

try {
  if (firebaseConfig.apiKey) {
      // Initialize app only if it hasn't been initialized already
      app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      auth = getAuth(app);
      
      // Initialize Firestore with offline persistence enabled
      // This prevents "client is offline" errors when network is flaky or initial load is slow
      try {
          db = initializeFirestore(app, { localCache: persistentLocalCache() });
      } catch (e: any) {
          // If firestore is already initialized (e.g. hot reload), fallback to getting the existing instance
          if (e.code === 'failed-precondition') {
              db = getFirestore(app);
          } else {
              console.error("Error initializing Firestore with persistence:", e);
              // Fallback to default (memory cache) if persistence fails
              db = getFirestore(app);
          }
      }
  } else {
      console.error("Firebase API Key is missing. Authentication will not work.");
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export const isFirebaseConfigured = !!app;
export { app, auth, db };
