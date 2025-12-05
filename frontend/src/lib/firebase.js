import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgUs59TXYUQR4D0okAU0OsSypsThl5l0A",
  authDomain: "sih-25-temp.firebaseapp.com",
  databaseURL: "https://sih-25-temp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sih-25-temp",
  storageBucket: "sih-25-temp.firebasestorage.app",
  messagingSenderId: "343588408716",
  appId: "1:343588408716:web:5a8cecc634f2400a581aa9"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and export it
export const db = getDatabase(app);