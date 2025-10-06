// ---------------- IMPORTS ----------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


// ---------------- FIREBASE CONFIG ----------------
const firebaseConfig = {
  apiKey: "AIzaSyAcjbUD8sY7nUN_FuQSJDEszBl1EvjRzoM",
  authDomain: "knee-gears.firebaseapp.com",
  projectId: "knee-gears",
  storageBucket: "knee-gears.firebasestorage.app",
  messagingSenderId: "640549414918",
  appId: "1:640549414918:web:ac8f5b8ae40c92ee9a3b87",
  measurementId: "G-X9DW3QH8DV",
};

// ---------------- INITIALIZE FIREBASE ----------------
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


// ---------------- PHONE LOGIN ----------------
const phoneLoginBtn = document.getElementById("phone-login-btn");
const phoneModal = document.getElementById("phone-login-modal");
const closePhoneModal = document.getElementById("close-phone-modal");
const sendOtpBtn = document.getElementById("send-otp-btn");
const verifyOtpBtn = document.getElementById("verify-otp-btn");

let confirmationResult;
let recaptchaReady = false;

// ✅ Open popup and render reCAPTCHA
// ✅ Open popup and render reCAPTCHA only after showing modal
phoneLoginBtn.addEventListener("click", async () => {
  console.log("📱 Phone login modal opened");
  phoneModal.style.display = "flex";
  sendOtpBtn.disabled = true;

  // Wait a bit so modal becomes visible
  setTimeout(async () => {
    if (!window.recaptchaVerifier) {
      console.log("🧩 Initializing reCAPTCHA...");
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "normal",
          callback: () => {
            console.log("✅ reCAPTCHA verified by user");
            recaptchaReady = true;
            sendOtpBtn.disabled = false;
          },
          "expired-callback": () => {
            console.warn("⚠️ reCAPTCHA expired");
            recaptchaReady = false;
            sendOtpBtn.disabled = true;
          },
        },
        auth
      );

      try {
        const widgetId = await window.recaptchaVerifier.render();
        console.log("✅ reCAPTCHA rendered successfully. Widget ID:", widgetId);
        recaptchaReady = true;
        sendOtpBtn.disabled = false;
      } catch (err) {
        console.error("❌ Error rendering reCAPTCHA:", err);
      }
    } else {
      console.log("ℹ️ reCAPTCHA already exists");
      recaptchaReady = true;
      sendOtpBtn.disabled = false;
    }
  }, 400); // short delay ensures reCAPTCHA has a visible container
});

// ✅ Close popup
closePhoneModal.addEventListener("click", () => {
  phoneModal.style.display = "none";
});

// ✅ Send OTP
sendOtpBtn.addEventListener("click", async () => {
  console.log("🚀 Send OTP clicked");

  if (!recaptchaReady) {
    alert("reCAPTCHA not ready yet. Please complete the 'I'm not a robot' first.");
    return;
  }

  const phoneNumber = document.getElementById("phone-number").value.trim();
  if (!phoneNumber.startsWith("+")) {
    alert("Please include country code (e.g. +639171234567)");
    return;
  }

  try {
    sendOtpBtn.disabled = true;
    console.log("📞 Sending OTP to:", phoneNumber);
    const appVerifier = window.recaptchaVerifier;
    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    console.log("✅ OTP sent successfully");
    alert("OTP sent! Check your phone.");
    document.getElementById("otp-section").style.display = "block";
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    alert("Failed to send OTP: " + error.message);
    sendOtpBtn.disabled = false;
  }
});

// ✅ Verify OTP
verifyOtpBtn.addEventListener("click", async () => {
  console.log("🔍 Verify OTP clicked");
  const otpCode = document.getElementById("otp-code").value.trim();
  if (!otpCode) {
    alert("Please enter the OTP you received.");
    return;
  }

  try {
    const result = await confirmationResult.confirm(otpCode);
    const user = result.user;
    console.log("✅ Phone login success:", user.phoneNumber);
    alert("Phone verification successful!");
    window.location.href = "news.html";
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    alert("Invalid or expired OTP. Please try again.");
  }
});



// ---------------- EMAIL + PASSWORD LOGIN ----------------
const loginForm = document.querySelector(".form-box");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("Iemail").value;
  const password = document.getElementById("Ppassword").value;

  const persistence = browserSessionPersistence;

  setPersistence(auth, persistence)
    .then(() => signInWithEmailAndPassword(auth, email, password))
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
    eyeIcon.style.stroke = "#3a853e";
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
    eyeIcon.style.stroke = "currentColor";
    eyeIcon.innerHTML = `
      <path d="M2.062 12.348a1 1 0 0 1 0-.696
               10.75 10.75 0 0 1 19.876 0 
               1 1 0 0 1 0 .696 
               10.75 10.75 0 0 1-19.876 0"/>
      <circle cx="12" cy="12" r="3"/>
    `;
  }
};
