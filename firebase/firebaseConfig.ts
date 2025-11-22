// firebase/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBocsOFziOJIdsKpmloPYnTY6fnfNhAQbY",
  authDomain: "itsmeluts.firebaseapp.com",
  projectId: "itsmeluts",
  storageBucket: "itsmeluts.firebasestorage.app",
  messagingSenderId: "201315346724",
  appId: "1:201315346724:web:e3c73c59703f627810ebb1",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
