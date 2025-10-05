// ✅ AdminDashboard.js
import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";

import { 
  getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

import { 
  getAuth, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// 🧩 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAcjbUD8sY7nUN_FuQSJDEszBl1EvjRzoM",
  authDomain: "knee-gears.firebaseapp.com",
  projectId: "knee-gears",
  storageBucket: "knee-gears.appspot.com",
  messagingSenderId: "640549414918",
  appId: "1:640549414918:web:ac8f5b8ae40c92ee9a3b87",
  measurementId: "G-X9DW3QH8DV"
};

// 🔧 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 🧍 Admin Auth Check
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("adminName").textContent = user.displayName || user.email;
  } else {
    window.location.href = "admin_login.html";
  }
});

// 🚪 Logout Function
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "admin_login.html";
});

// 🎯 Firestore References
const articleContainer = document.getElementById("articleContainer");
let editId = null;

// 🧩 Check if redirected from Manage Articles page
const savedEdit = localStorage.getItem("editArticle");
if (savedEdit) {
  const article = JSON.parse(savedEdit);
  document.getElementById("titleInput").value = article.title;
  document.getElementById("imageInput").value = article.image;
  document.getElementById("linkInput").value = article.link;
  document.getElementById("categorySelect").value = article.category;
  editId = article.id;
  localStorage.removeItem("editArticle"); // Clear it after loading

  // ✅ Optional: Add a "Back to Manage Articles" button dynamically
  const backBtn = document.createElement("button");
  backBtn.textContent = "← Back to Manage Articles";
  backBtn.style.backgroundColor = "#555";
  backBtn.style.color = "white";
  backBtn.style.padding = "8px 15px";
  backBtn.style.border = "none";
  backBtn.style.borderRadius = "5px";
  backBtn.style.marginTop = "10px";
  backBtn.style.cursor = "pointer";
  backBtn.addEventListener("click", () => window.location.href = "admin_manage_articles.html");
  document.querySelector(".title-section").appendChild(backBtn);
}

// 🔄 Real-time Article List
onSnapshot(collection(db, "articles"), (snapshot) => {
  articleContainer.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const articleDiv = document.createElement("div");
    articleDiv.classList.add("box");
    articleDiv.style.backgroundImage = `url(${data.image})`;
    articleDiv.style.backgroundSize = "cover";
    articleDiv.style.backgroundPosition = "center";
    articleDiv.style.height = "250px";
    articleDiv.style.borderRadius = "10px";
    articleDiv.style.overflow = "hidden";
    articleDiv.style.position = "relative";

    articleDiv.innerHTML = `
      <div style="background: rgba(0, 0, 0, 0.6); padding: 10px; color: white;">
        <h3>${data.title}</h3>
        <p style="font-size: 0.9em;">Category: ${data.category}</p>
        <div style="margin-top: 5px;">
          <button class="editBtn" data-id="${docSnap.id}"
            style="background-color: orange; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; margin-right:5px;">
            Edit
          </button>
          <button class="deleteBtn" data-id="${docSnap.id}"
            style="background-color:red; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">
            Delete
          </button>
        </div>
      </div>
    `;
    articleContainer.appendChild(articleDiv);
  });
});

// 📝 Add / Update Article
document.getElementById("addArticleForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("titleInput").value.trim();
  const image = document.getElementById("imageInput").value.trim();
  const link = document.getElementById("linkInput").value.trim();
  const category = document.getElementById("categorySelect").value.toLowerCase().trim();

  if (!title || !image || !link || !category) {
    alert("⚠️ Please fill in all fields.");
    return;
  }

  console.log("📰 Saving article:", { title, image, link, category });

  try {
    if (editId) {
      // ✏️ Update existing article
      await updateDoc(doc(db, "articles", editId), { 
        title, image, link, category 
      });
      alert("✅ Article updated successfully!");
      editId = null;
    } else {
      // ➕ Add new article
      await addDoc(collection(db, "articles"), {
        title,
        image,
        link,
        category,
        timestamp: serverTimestamp()
      });
      alert("✅ Article added successfully!");
    }

    e.target.reset();
  } catch (error) {
    console.error("❌ Error saving article:", error);
    alert("Error: " + error.message);
  }
});

// ✏️ Edit + 🗑️ Delete Listeners
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("editBtn")) {
    const id = e.target.getAttribute("data-id");
    const snapshot = await getDoc(doc(db, "articles", id));
    if (snapshot.exists()) {
      const data = snapshot.data();
      document.getElementById("titleInput").value = data.title;
      document.getElementById("imageInput").value = data.image;
      document.getElementById("linkInput").value = data.link;
      document.getElementById("categorySelect").value = data.category;
      editId = id;
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      alert("⚠️ Article not found.");
    }
  }

  if (e.target.classList.contains("deleteBtn")) {
    const id = e.target.getAttribute("data-id");
    if (confirm("🗑️ Delete this article?")) {
      await deleteDoc(doc(db, "articles", id));
      alert("✅ Article deleted!");
    }
  }
});

