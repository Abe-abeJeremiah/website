import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAcjbUD8sY7nUN_FuQSJDEszBl1EvjRzoM",
  authDomain: "knee-gears.firebaseapp.com",
  projectId: "knee-gears",
  storageBucket: "knee-gears.appspot.com",
  messagingSenderId: "640549414918",
  appId: "1:640549414918:web:ac8f5b8ae40c92ee9a3b87",
  measurementId: "G-X9DW3QH8DV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Load user info
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const data = userDoc.data();
        document.getElementById("user-name").innerText = data.username || "No username set";
      } else {
        document.getElementById("user-name").innerText = user.displayName || "No name set";
      }

      document.getElementById("user-email").innerText = user.email;
      document.getElementById("user-photo").src = user.photoURL || "https://via.placeholder.com/120";
      document.getElementById("nav-photo").src = user.photoURL || "assets/profile1.png";

    } catch (err) {
      console.error("Error fetching Firestore user:", err);
    }
  } else {
    window.location.href = "index.html";
  }
});

// Update profile (Firestore + Auth displayName/photo)
window.updateUserProfile = async function () {
  const user = auth.currentUser;
  if (!user) return;

  const newName = document.getElementById("newName").value.trim();
  const newPhoto = document.getElementById("newPhoto").value.trim();

  try {
    // Update Auth profile
    await updateProfile(user, {
      displayName: newName || user.displayName,
      photoURL: newPhoto || user.photoURL
    });

    // Update Firestore username
    if (newName) {
      await updateDoc(doc(db, "users", user.uid), {
        username: newName
      });
    }

    alert("Profile updated!");
    document.getElementById("user-name").innerText = newName || user.displayName;
    document.getElementById("user-photo").src = newPhoto || user.photoURL;
    document.getElementById("nav-photo").src = newPhoto || user.photoURL;

  } catch (error) {
    console.error("Update error:", error);
    alert("Failed to update profile: " + error.message);
  }
};

// Logout
window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  }).catch((error) => {
    console.error("Logout Error:", error);
  });
};
