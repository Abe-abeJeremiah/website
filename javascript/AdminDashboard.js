// ✅ Import Firebase Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { 
  getFirestore, collection, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, query, orderBy 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { 
  getAuth, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// ✅ Firebase Configuration
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
const totalArticlesEl = document.getElementById("totalArticles");
const totalCategoriesEl = document.getElementById("totalCategories");
const latestArticleDateEl = document.getElementById("latestArticleDate");
const activityList = document.getElementById("activityList");
const searchInput = document.getElementById("searchInput");

let allArticles = [];

/* 🟡 Handle Edit Mode (when redirected from Manage Articles) */
const editArticleData = localStorage.getItem("editArticle");
if (editArticleData) {
  const article = JSON.parse(editArticleData);

  // Prefill form fields
  document.getElementById("titleInput").value = article.title;
  document.getElementById("imageInput").value = article.image;
  document.getElementById("linkInput").value = article.link;
  document.getElementById("categorySelect").value = article.category;

  // Change button text
  const submitBtn = document.querySelector("#addArticleForm button");
  submitBtn.textContent = "Update Article";

  // Add an edit mode notice
  const notice = document.createElement("div");
  notice.textContent = `✏️ You’re editing: ${article.title}`;
  notice.style.background = "#fff3cd";
  notice.style.color = "#856404";
  notice.style.padding = "10px";
  notice.style.marginBottom = "15px";
  notice.style.border = "1px solid #ffeeba";
  notice.style.borderRadius = "6px";
  document.querySelector(".title-section").after(notice);

  // Replace default submit behavior with UPDATE
  document.getElementById("addArticleForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const updatedTitle = document.getElementById("titleInput").value.trim();
    const updatedImage = document.getElementById("imageInput").value.trim();
    const updatedLink = document.getElementById("linkInput").value.trim();
    const updatedCategory = document.getElementById("categorySelect").value.toLowerCase().trim();

    if (!updatedTitle || !updatedImage || !updatedLink || !updatedCategory) {
      alert("⚠️ Please fill in all fields.");
      return;
    }

    try {
      const articleRef = doc(db, "articles", article.id);
      await updateDoc(articleRef, {
        title: updatedTitle,
        image: updatedImage,
        link: updatedLink,
        category: updatedCategory,
        timestamp: serverTimestamp(),
      });

      alert("✅ Article updated successfully!");
      await logActivity("Updated article", updatedTitle);
      localStorage.removeItem("editArticle");
      window.location.href = "admin_manage_articles.html"; // Go back to list
    } catch (error) {
      console.error("❌ Error updating article:", error);
      alert("Error: " + error.message);
    }
  });
}

/* 🟢 Normal Mode: Add Article */
document.getElementById("addArticleForm").addEventListener("submit", async (e) => {
  // Prevent duplicate behavior if editing
  if (editArticleData) return;
  
  e.preventDefault();

  const title = document.getElementById("titleInput").value.trim();
  const image = document.getElementById("imageInput").value.trim();
  const link = document.getElementById("linkInput").value.trim();
  const category = document.getElementById("categorySelect").value.toLowerCase().trim();

  if (!title || !image || !link || !category) {
    alert("⚠️ Please fill in all fields.");
    return;
  }

  try {
    await addDoc(collection(db, "articles"), {
      title,
      image,
      link,
      category,
      timestamp: serverTimestamp(),
    });
    alert("✅ Article added successfully!");
    await logActivity("Added new article", title);
    e.target.reset();
  } catch (error) {
    console.error("❌ Error adding article:", error);
    alert("Error: " + error.message);
  }
});

/* 📊 Real-Time Article Stats */
onSnapshot(collection(db, "articles"), (snapshot) => {
  allArticles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  totalArticlesEl.textContent = allArticles.length;
  totalCategoriesEl.textContent = new Set(allArticles.map(a => a.category)).size;

  if (allArticles.length > 0) {
    const latest = allArticles.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds)[0];
    latestArticleDateEl.textContent = latest.timestamp
      ? new Date(latest.timestamp.seconds * 1000).toLocaleDateString()
      : "–";
  } else {
    latestArticleDateEl.textContent = "–";
  }
});

/* 🕒 Real-Time Admin Activities */
const activityQuery = query(collection(db, "admin_activities"), orderBy("timestamp", "desc"));
onSnapshot(activityQuery, (snapshot) => {
  activityList.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");
    const time = data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleTimeString() : "";
    li.textContent = `${data.action}: "${data.title}" – ${time}`;
    activityList.appendChild(li);
  });
  while (activityList.children.length > 5) {
    activityList.removeChild(activityList.lastChild);
  }
});

/* 🧾 Log Activity Function */
async function logActivity(action, title) {
  try {
    await addDoc(collection(db, "admin_activities"), {
      action,
      title,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving activity:", error);
  }
}
