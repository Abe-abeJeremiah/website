import { 
    initializeApp 
  } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
  import { 
    getAuth, onAuthStateChanged, updateProfile, signOut 
  } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
  
  // 🔥 Firebase Config
  const firebaseConfig = {
    apiKey: "AIzaSyAcjbUD8sY7nUN_FuQSJDEszBl1EvjRzoM",
    authDomain: "knee-gears.firebaseapp.com",
    projectId: "knee-gears",
    storageBucket: "knee-gears.appspot.com",
    messagingSenderId: "640549414918",
    appId: "1:640549414918:web:ac8f5b8ae40c92ee9a3b87",
    measurementId: "G-X9DW3QH8DV"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  
  // 🧩 Check logged-in admin
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "admin_login.html";
      return;
    }
  
    // Display admin info
    document.getElementById("admin-name").textContent = user.displayName || "Admin";
    document.getElementById("admin-email").textContent = user.email;
    document.getElementById("admin-photo").src = user.photoURL || "https://via.placeholder.com/150";
    document.getElementById("nav-photo").src = user.photoURL || "assets/profile1.png";
  
    // Save Profile Changes
    document.getElementById("saveProfileBtn").addEventListener("click", async () => {
      const newName = document.getElementById("newAdminName").value.trim();
      const newPhoto = document.getElementById("newAdminPhoto").value.trim();
  
      try {
        await updateProfile(user, {
          displayName: newName || user.displayName,
          photoURL: newPhoto || user.photoURL,
        });
  
        alert("✅ Profile updated successfully!");
        location.reload();
      } catch (error) {
        alert("❌ Error updating profile: " + error.message);
      }
    });
  });
  
  // 🚪 Logout
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "admin_login.html";
  });
  