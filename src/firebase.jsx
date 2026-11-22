
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APP_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: "ah2026-ff8aa.firebasestorage.app",
  messagingSenderId: "797978372341",
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};


console.log("API KEY:", import.meta.env.VITE_FIREBASE_APP_KEY);
console.log("AUTH DOMAIN:", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
console.log("PROJECT ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
console.log("APP ID:", import.meta.env.VITE_FIREBASE_APP_ID);

// Initialize Firebase
console.log("Variable del .env:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
const app = initializeApp(firebaseConfig);
console.log("Firebase conectado:", app.options.projectId);
export const db = getFirestore(app);
export const auth = getAuth(app);