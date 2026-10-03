// js/firebase-config.js
// If this site already has a firebase-config.js, keep yours and just make sure
// it exports: db, doc, collection, where, query, onSnapshot.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  where,
  query,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Paste the web config of the Firebase project that holds this site's "news" collection
// (Project settings → General → Your apps).
const firebaseConfig = {
  apiKey: "AIzaSyCMvNTCVQW-S6YiLTGXadojbllOustg-z8",
  authDomain: "marvini-digital-food-chain.firebaseapp.com",
  projectId: "marvini-digital-food-chain",
  storageBucket: "marvini-digital-food-chain.firebasestorage.app",
  messagingSenderId: "88510502919",
  appId: "1:88510502919:web:6bcde5519ed939838772a2",
  measurementId: "G-SE16FYTF4N"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export { collection, doc, where, query, onSnapshot };