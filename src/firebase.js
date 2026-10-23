import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ClubGators Firebase configuration (from firebase)
const firebaseConfig = {
  apiKey: "AIzaSyBm_NlIaANk8c2jhmKA0WOIyVkaCJ4p07I",
  authDomain: "clubgator-a6bdd.firebaseapp.com",
  projectId: "clubgator-a6bdd",
  storageBucket: "clubgator-a6bdd.firebasestorage.app",
  messagingSenderId: "420185485878",
  appId: "1:420185485878:web:b47152f3055193ce7a5e97",
  measurementId: "G-HMZTHJBLF4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);