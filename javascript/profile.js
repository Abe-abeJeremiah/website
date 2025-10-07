// profile.js
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

console.log("=== PROFILE.JS LOADED ===");

// Load user info
onAuthStateChanged(auth, async (user) => {
  console.log("🔐 AUTH STATE CHANGED:", user ? "USER LOGGED IN" : "NO USER");
  
  if (user) {
    console.log("👤 User Info:", {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    });
    
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      console.log("📄 Firestore Document Exists:", userDoc.exists());

      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log("📊 Firestore Data:", data);
        
        // Update profile picture
        const photoURL = data.photoURL || user.photoURL;
        console.log("🖼️ Setting photo URL:", photoURL);
        
        const navPhoto = document.getElementById("nav-photo");
        const userPhoto = document.getElementById("user-photo");
        
        if (navPhoto) {
          navPhoto.src = photoURL || "https://via.placeholder.com/150";
          console.log("✅ Updated nav-photo");
        }
        if (userPhoto) {
          userPhoto.src = photoURL || "https://via.placeholder.com/150";
          console.log("✅ Updated user-photo");
        }
        
        // Update username
        const username = data.username || user.displayName;
        console.log("📝 Setting username:", username);
        
        const userNameElement = document.getElementById("user-name");
        const userNameWelcome = document.getElementById("userName");
        
        if (userNameElement) {
          userNameElement.innerText = username || "No username set";
        }
        if (userNameWelcome) {
          userNameWelcome.innerText = username || "User";
        }
        
      } else {
        console.log("❌ No Firestore document found");
        updateUIFromAuth(user);
      }

      // Update email
      const userEmail = document.getElementById("user-email");
      if (userEmail) {
        userEmail.innerText = user.email;
      }

    } catch (err) {
      console.error("❌ Error fetching Firestore user:", err);
      updateUIFromAuth(user);
    }
  } else {
    console.log("🚫 No user, redirecting to index.html");
    window.location.href = "index.html";
  }
});

function updateUIFromAuth(user) {
  console.log("🔄 Using Auth data only");
  const navPhoto = document.getElementById("nav-photo");
  const userPhoto = document.getElementById("user-photo");
  
  if (navPhoto) navPhoto.src = user.photoURL || "https://via.placeholder.com/150";
  if (userPhoto) userPhoto.src = user.photoURL || "https://via.placeholder.com/150";
  
  const userNameElement = document.getElementById("user-name");
  const userNameWelcome = document.getElementById("userName");
  
  if (userNameElement) userNameElement.innerText = user.displayName || "No name set";
  if (userNameWelcome) userNameWelcome.innerText = user.displayName || "User";
}

// Update profile
window.updateUserProfile = async function () {
  console.log("🔄 UPDATE PROFILE TRIGGERED");
  
  const user = auth.currentUser;
  if (!user) {
    alert("No user logged in!");
    return;
  }

  const newName = document.getElementById("newName").value.trim();
  const newPhoto = document.getElementById("newPhoto").value.trim();

  console.log("📝 Update Data:", { newName, newPhoto });

  if (!newName && !newPhoto) {
    alert("Please enter either a new name or photo URL");
    return;
  }

  try {
    console.log("🚀 Starting profile update...");
    
    // Update Auth profile
    await updateProfile(user, {
      displayName: newName || user.displayName,
      photoURL: newPhoto || user.photoURL
    });
    console.log("✅ Auth profile updated");

    // Update Firestore
    await updateDoc(doc(db, "users", user.uid), {
      username: newName || user.displayName,
      photoURL: newPhoto || user.photoURL,
      lastUpdated: new Date()
    });
    console.log("✅ Firestore updated");

    alert("Profile updated successfully!");
    
    // Clear input fields
    if (document.getElementById("newName")) document.getElementById("newName").value = "";
    if (document.getElementById("newPhoto")) document.getElementById("newPhoto").value = "";
    
    // Force refresh and update UI
    await user.reload();
    
    const updatedUser = auth.currentUser;
    console.log("🆕 Updated User Data:", {
      displayName: updatedUser.displayName,
      photoURL: updatedUser.photoURL
    });
    
    // Update UI immediately
    updateUIFromAuth(updatedUser);
    
    console.log("🎉 Profile update complete!");

  } catch (error) {
    console.error("❌ Update error:", error);
    alert("Failed to update profile: " + error.message);
  }
};

// Logout
window.logout = function () {
  if (confirm("Are you sure you want to logout?")) {
    signOut(auth).then(() => {
      console.log("👋 User logged out");
      window.location.href = "index.html";
    }).catch((error) => {
      console.error("❌ Logout Error:", error);
      alert("Logout failed: " + error.message);
    });
  }
};
