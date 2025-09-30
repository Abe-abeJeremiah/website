// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Firebase config
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
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
auth.languageCode = "en";

// ---------------- GOOGLE LOGIN ----------------
const provider = new GoogleAuthProvider();
const googleLogin = document.getElementById("google-login-btn");

googleLogin.addEventListener("click", function () {
  signInWithPopup(auth, provider)
    .then(async (result) => {
      const user = result.user;

      // ✅ Check if user already exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        // 🚫 Prevent login if not signed up
        alert("This Google account is not registered. Please sign up first.");
        await auth.signOut();
        return;
      }

      console.log("Google login success:", user.displayName || user.email);
      window.location.href = "news.html";
    })
    .catch((error) => {
      console.error("Google login error:", error.message);
      alert(error.message);
    });
});

// ---------------- FACEBOOK LOGIN ----------------
const provider1 = new FacebookAuthProvider();
document.addEventListener("DOMContentLoaded", function () {
  const facebookLogin = document.getElementById("facebook-btn");
  facebookLogin.addEventListener("click", function (event) {
    event.preventDefault();
    signInWithPopup(auth, provider1)
      .then((result) => {
        const user = result.user;
        console.log("Facebook login success:", user.displayName || user.email);
        window.location.href = "news.html";
      })
      .catch((error) => {
        console.error("Facebook login error:", error.message);
        alert(error.message);
      });
  });
});

// ---------------- EMAIL + PASSWORD LOGIN ----------------
const loginForm = document.querySelector(".form-box");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("Iemail").value;
  const password = document.getElementById("Ppassword").value;

  const persistence = browserSessionPersistence;

  setPersistence(auth, persistence)
    .then(() => {
      return signInWithEmailAndPassword(auth, email, password);
    })
    .then((userCredential) => {
      const user = userCredential.user;
      alert("Sign In Successful");
      window.location.href = "news.html";
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
});

// ---------------- PASSWORD TOGGLE ----------------
window.togglePassword = function () {
  const passwordInput = document.getElementById("Ppassword");
  const eyeIcon = document.querySelector(".eye-icon svg");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeIcon.setAttribute("class", "lucide lucide-eye-off");
    eyeIcon.style.stroke = "#3a853e"; // ✅ green when visible
    eyeIcon.innerHTML = `
      <path d="M17.94 17.94A10.77 10.77 0 0 1 12 20
               a10.75 10.75 0 0 1-9.88-7.65 
               1 1 0 0 1 0-.7
               A10.77 10.77 0 0 1 6.06 6.06"/>
      <path d="M9.88 9.88A3 3 0 0 1 12 9
               c.66 0 1.26.21 1.74.56"/>
      <path d="M15 15a3 3 0 0 1-3 3
               c-.66 0-1.26-.21-1.74-.56"/>
      <line x1="2" y1="2" x2="22" y2="22"/>
    `;
  } else {
    passwordInput.type = "password";
    eyeIcon.setAttribute("class", "lucide lucide-eye");
    eyeIcon.style.stroke = "currentColor"; // ✅ default color
    eyeIcon.innerHTML = `
      <path d="M2.062 12.348a1 1 0 0 1 0-.696
               10.75 10.75 0 0 1 19.876 0 
               1 1 0 0 1 0 .696 
               10.75 10.75 0 0 1-19.876 0"/>
      <circle cx="12" cy="12" r="3"/>
    `;
  }
};
