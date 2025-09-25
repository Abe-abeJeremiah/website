import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.forgot-container form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = form.querySelector('#email');
        const email = emailInput.value.trim();

        if (!email) {
            alert('Please enter your email address.');
            return;
        }

        try {
            const firebaseConfig = {
                apiKey: "AIzaSyAcjbUD8sY7nUN_FuQSJDEszBl1EvjRzoM",
                authDomain: "knee-gears.firebaseapp.com",
                projectId: "knee-gears",
                storageBucket: "knee-gears.firebasestorage.app",
                messagingSenderId: "640549414918",
                appId: "1:640549414918:web:ac8f5b8ae40c92ee9a3b87",
                measurementId: "G-X9DW3QH8DV"
            };

            if (!window._firebaseApp) {
                window._firebaseApp = initializeApp(firebaseConfig);
            }
            const auth = getAuth();

            await sendPasswordResetEmail(auth, email);

            alert('If this email is registered, a password reset link has been sent.');
            form.reset();
        } catch (error) {
            alert('An error occurred. Please try again later.');
        }
    });
});
