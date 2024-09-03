// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VUE_FIREBASE_API_KEY,
  authDomain: process.env.VUE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
