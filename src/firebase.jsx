import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG)
const firebase = initializeApp(firebaseConfig);

export const database = getDatabase(firebase);
export const auth = getAuth(firebase)