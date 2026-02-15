// Firebase v9 modular SDK configuration
// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyCcpMdxp7XTD9hCpJ3qLKF08ICZYNfNHWA",
    authDomain: "lawn-mower-pro-eac52.firebaseapp.com",
    databaseURL: "https://lawn-mower-pro-eac52-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "lawn-mower-pro-eac52",
    storageBucket: "lawn-mower-pro-eac52.appspot.com",
    messagingSenderId: "42899434967",
    appId: "1:42899434967:web:35c792c111d41560b52f92"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Get Firebase Auth instance
const auth = getAuth(app);

// Get Firebase Realtime Database instance
const db = getDatabase(app);

// Export Firebase services for use in other modules
export { app, auth, db };
