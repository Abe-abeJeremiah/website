// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
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

// ✅ GOOGLE LOGIN
const provider = new GoogleAuthProvider();
const googleLogin = document.getElementById("google-login-btn");

if (googleLogin) {
  googleLogin.addEventListener("click", function () {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;

        // Check if user already exists in Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
          // Save Google account info in Firestore
          await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            username: user.displayName || user.email.split("@")[0], // fallback username
            createdAt: new Date(),
          });
        }

        window.location.href = "news.html";
      })
      .catch((error) => {
        alert(error.message);
      });
  });
}

// ✅ SIGN UP WITH EMAIL + PASSWORD (and unique username)
const signupBtn = document.getElementById("signup");
if (signupBtn) {
  signupBtn.addEventListener("click", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const username = document.getElementById("Username").value.trim();
    const password = document.getElementById("Ppassword").value;
    const cpassword = document.getElementById("Cpassword").value;

    if (password !== cpassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      // 🔎 Check if username already exists
      const q = query(collection(db, "users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert("Username already taken! Please choose another one.");
        return;
      }

      // ✅ Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Save user info in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: email,
        username: username,
        createdAt: new Date(),
      });

      alert("Sign Up Successful!");
      window.location.href = "news.html";
    } catch (error) {
      console.error(error.message);
      alert("Error: " + error.message);
    }
  });
}

// ✅ LOGIN WITH EMAIL + PASSWORD
const loginForm = document.getElementById("loginForm"); // form id in login.html
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("Iemail").value;
    const password = document.getElementById("Ppassword").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login Successful!");
      window.location.href = "news.html";
    } catch (error) {
      alert("Error: " + error.message);
    }
  });
}

// ✅ FETCH USERNAME ON NEWS/PROFILE PAGE
const userNameElement = document.getElementById("userName"); // placeholder span in HTML

onAuthStateChanged(auth, async (user) => {
  if (user && userNameElement) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      userNameElement.textContent = userDoc.data().username;
    } else {
      userNameElement.textContent = "Guest";
    }
  }
});
