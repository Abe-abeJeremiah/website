// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";
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
const auth = getAuth();
auth.languageCode = "en";
const provider = new GoogleAuthProvider();

const googleLogin = document.getElementById("google-login-btn");
googleLogin.addEventListener("click", function () {
  signInWithPopup(auth, provider)
    .then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const user = result.user;
      console.log(user);
      window.location.href = "news.html";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
});

const submit = document.getElementById("signup");
submit.addEventListener("click", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const username = document.getElementById("Username").value;
  const password = document.getElementById("password").value;
  const cpassword = document.getElementById("Cpassword").value;

  if (password !== cpassword) {
    alert("Passwords do not match");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      alert("Sign Up Successful");
    })
    .catch((error) => {
      const errorCode = error.code;
      console.error(errormessage);
      alert(errormessage);
    });
});
const database = getDatabase(app);
