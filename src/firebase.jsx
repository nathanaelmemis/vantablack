import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

function initializeFirebase() {
    let firebaseConfig = null;

    if (process.env.NODE_ENV === 'production') {
        firebaseConfig = process.env.FIREBASE_CONFIG;
    } else {
        const module = import("./firebaseConfig");
        firebaseConfig = module.default;
    }

    initializeApp(firebaseConfig);
}

const firebase = initializeFirebase();
export const database = getDatabase(firebase);
export const auth = getAuth(firebase)