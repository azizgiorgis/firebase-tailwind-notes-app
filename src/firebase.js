import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {

    apiKey: "AIzaSyBkwLn2Jtnfwpe_UtoWDbTjq1bvL7ToBeo",

    authDomain: "notes-app-3762c.firebaseapp.com",

    projectId: "notes-app-3762c",

    storageBucket: "notes-app-3762c.firebasestorage.app",

    messagingSenderId: "482818601913",

    appId: "1:482818601913:web:7be0e688b273bd741b7c68"

};


const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
