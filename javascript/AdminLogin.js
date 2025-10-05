// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcjbUD8sY7nUN_FuQSJDEszBl1EvjRzoM",
  authDomain: "knee-gears.firebaseapp.com",
  projectId: "knee-gears",
  storageBucket: "knee-gears.firebasestorage.app",
  messagingSenderId: "640549414918",
  appId: "1:640549414918:web:ac8f5b8ae40c92ee9a3b87",
  measurementId: "G-X9DW3QH8DV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Form submit listener
document
  .getElementById("adminLoginForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value.trim();
    
    await setPersistence(auth, browserLocalPersistence);

    try {
      // Sign in admin
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check role in Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().role === "admin") {
        // ✅ Redirect to Admin Dashboard
        window.location.href = "admin_dashboard.html";
      } else {
        alert("Access denied. You are not an admin.");
        await auth.signOut();
      }
    } catch (error) {
      console.error("Login error:", error.message);
      alert("Invalid credentials. Please try again.");
    }
  });

// Toggle password visibility
window.toggleAdminPassword = function () {
  const passwordField = document.getElementById("adminPassword");
  passwordField.type =
    passwordField.type === "password" ? "text" : "password";
};
