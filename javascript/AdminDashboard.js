// ✅ Firebase Imports
import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";

import { 
  getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, query, orderBy 
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

// 🧍 Admin Authentication
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

// 🔗 Firestore References
const articleContainer = document.getElementById("articleContainer");
const totalArticlesEl = document.getElementById("totalArticles");
const totalCategoriesEl = document.getElementById("totalCategories");
const latestArticleDateEl = document.getElementById("latestArticleDate");
const activityList = document.getElementById("activityList");
const searchInput = document.getElementById("searchInput");

let allArticles = [];

const editArticleData = localStorage.getItem("editArticle");
if (editArticleData) {
  const article = JSON.parse(editArticleData);

  // Prefill form
  document.getElementById("titleInput").value = article.title;
  document.getElementById("imageInput").value = article.image;
  document.getElementById("linkInput").value = article.link;
  document.getElementById("categorySelect").value = article.category;

  // Change button label
  const submitBtn = document.querySelector("#addArticleForm button");
  submitBtn.textContent = "Update Article";

  // Add “Edit Mode” Notice
  const notice = document.createElement("div");
  notice.textContent = `You’re editing: ${article.title}`;
  notice.style.background = "#fff3cd";
  notice.style.color = "#856404";
  notice.style.padding = "10px";
  notice.style.marginBottom = "15px";
  notice.style.border = "1px solid #ffeeba";
  notice.style.borderRadius = "6px";
  document.querySelector(".title-section").after(notice);

  document.getElementById("addArticleForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const updatedTitle = document.getElementById("titleInput").value.trim();
    const updatedImage = document.getElementById("imageInput").value.trim();
    const updatedLink = document.getElementById("linkInput").value.trim();
    const updatedCategory = document.getElementById("categorySelect").value.toLowerCase().trim();

    if (!updatedTitle || !updatedImage || !updatedLink || !updatedCategory) {
      alert("Please fill in all fields.");
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

      alert("Article updated successfully!");
      logActivity("Updated article", updatedTitle);
      localStorage.removeItem("editArticle");
      window.location.href = "admin_manage_articles.html";
    } catch (error) {
      console.error("Error updating article:", error);
      alert("Error: " + error.message);
    }
  });
}

// 🔄 Real-time Article Overview
onSnapshot(collection(db, "articles"), (snapshot) => {
  articleContainer.innerHTML = "";
  allArticles = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    allArticles.push({ id: docSnap.id, ...data });

    const articleDiv = document.createElement("div");
    articleDiv.classList.add("box");
    articleDiv.style.backgroundImage = `url(${data.image})`;
    articleDiv.style.backgroundSize = "cover";
    articleDiv.style.backgroundPosition = "center";

    articleDiv.innerHTML = `
      <div class="box-content">
        <h3>${data.title}</h3>
        <p>Category: ${data.category}</p>
      </div>
    `;

    articleContainer.appendChild(articleDiv);
  });

  // 📊 Stats Update
  totalArticlesEl.textContent = allArticles.length;
  const uniqueCategories = new Set(allArticles.map(a => a.category));
  totalCategoriesEl.textContent = uniqueCategories.size;

  if (allArticles.length > 0) {
    const latest = allArticles.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds)[0];
    latestArticleDateEl.textContent = latest.timestamp
      ? new Date(latest.timestamp.seconds * 1000).toLocaleDateString()
      : "–";
  } else {
    latestArticleDateEl.textContent = "–";
  }
});

// 📝 Add New Article (Normal Mode)
document.getElementById("addArticleForm").addEventListener("submit", async (e) => {
  if (editArticleData) return; // prevent overwrite while editing
  e.preventDefault();

  const title = document.getElementById("titleInput").value.trim();
  const image = document.getElementById("imageInput").value.trim();
  const link = document.getElementById("linkInput").value.trim();
  const category = document.getElementById("categorySelect").value.toLowerCase().trim();

  if (!title || !image || !link || !category) {
    alert("Please fill in all fields.");
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
    alert("Article added successfully!");
    logActivity("Added new article", title);
    e.target.reset();
  } catch (error) {
    console.error("Error adding article:", error);
    alert("Error: " + error.message);
  }
});

// 🔍 Live Search (Header Search)
searchInput?.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const boxes = document.querySelectorAll(".box");
  boxes.forEach(box => {
    const title = box.querySelector("h3").textContent.toLowerCase();
    box.style.display = title.includes(query) ? "block" : "none";
  });
});

// 🧾 Real-time Activity List (Persistent)
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

  // Keep only latest 5
  while (activityList.children.length > 5) {
    activityList.removeChild(activityList.lastChild);
  }
}); 

// 🧾 Save Admin Activity to Firestore
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
