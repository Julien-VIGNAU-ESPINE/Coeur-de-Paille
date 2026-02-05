/**
 * Firebase Integration Configuration
 * 
 * Config updated with User's keys.
 * Adjusted to use Global variable 'firebase' from CDN scripts.
 */

const firebaseConfig = {
    apiKey: "AIzaSyADbeqW_xtEGo-A74u09zSE-ZMftSs7DpQ",
    authDomain: "coeur-de-paille.firebaseapp.com",
    projectId: "coeur-de-paille",
    storageBucket: "coeur-de-paille.firebasestorage.app",
    messagingSenderId: "928473876906",
    appId: "1:928473876906:web:743000c8f1e445ada343d3",
    measurementId: "G-MS31Y63Z0C"
};

// Initialize Firebase (Check if script is loaded via CDN)
let db = null;
let auth = null;

if (typeof firebase !== 'undefined') {
    try {
        // Use compat syntax
        const app = firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        console.log("Firebase initialized successfully");
    } catch (e) {
        console.error("Firebase initialization failed:", e);
    }
} else {
    console.warn("Firebase SDK not loaded. Using Mock Data mode.");
}

// Expose to window for access
window.firebaseDb = db;
window.firebaseAuth = auth;
window.firebaseConfig = firebaseConfig; // Also expose config for check in API
