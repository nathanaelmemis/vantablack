import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

console.log(process.env.NODE_ENV, process.env.FIREBASE_CONFIG)
console.log(process.env)


async function initializeFirebase() {
    let firebaseConfig = null;

    if (process.env.NODE_ENV === 'production') {
        firebaseConfig = secrets.REACT_APP_FIREBASE_CONFIG;
    } else {
        const module = await import("./firebaseConfig");
        firebaseConfig = module.default;
    }

    return initializeApp(firebaseConfig);
}

const firebase = await initializeFirebase();
export const database = getDatabase(firebase);
export const auth = getAuth(firebase)