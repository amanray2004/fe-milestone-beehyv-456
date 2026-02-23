import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {

  apiKey: "AIzaSyCqXTjsSCO97g5b87Q1Jh2zdzacEqfYrFc",

  authDomain: "trello-clone-bbb77.firebaseapp.com",

  projectId: "trello-clone-bbb77",

  storageBucket: "trello-clone-bbb77.firebasestorage.app",

  messagingSenderId: "437754370687",

  appId: "1:437754370687:web:3e97345433b557b84b7d4a"

};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore Database
export const db = getFirestore(app);