import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCcpMdxp7XTD9hCpJ3qLKF08ICZYNfNHWA",
    authDomain: "lawn-mower-pro-eac52.firebaseapp.com",
    databaseURL: "https://lawn-mower-pro-eac52-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "lawn-mower-pro-eac52",
    storageBucket: "lawn-mower-pro-eac52.appspot.com",
    messagingSenderId: "42899434967",
    appId: "1:42899434967:web:35c792c111d41560b52f92"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { auth, db };
