// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Prefer .env variables; fallback to pasted config for quick start
const firebaseConfig = {
  apiKey: "AIzaSyA2ghU-G6SsGtXgs7ocjqUr4egel0emvS0",
  authDomain: "cbmc-ee56e.firebaseapp.com",
  projectId: "cbmc-ee56e",
  storageBucket: "cbmc-ee56e.firebasestorage.app",
  messagingSenderId: "479434319883",
  appId: "1:479434319883:web:3da47de6d36355380bbf0e",
  measurementId: "G-8JYY7R3200"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
