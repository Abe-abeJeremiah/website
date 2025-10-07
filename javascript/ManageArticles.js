// ✅ Import Firebase Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { 
  getFirestore, collection, onSnapshot, deleteDoc, doc, addDoc, serverTimestamp 
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

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 🔐 Check if Admin is Logged In
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "admin_login.html";
  }
});

// 🚪 Logout Button
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "admin_login.html";
});

// 📰 Article Management
const articleContainer = document.getElementById("articleContainer");
let allArticles = [];

// 🔄 Real-Time Fetch of Articles
onSnapshot(collection(db, "articles"), (snapshot) => {
  allArticles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderArticles(allArticles);
});

// 🔍 SEARCH BAR FUNCTIONALITY
const searchForm = document.querySelector(".search-profile");
const searchInput = document.getElementById("searchInput");

if (searchForm && searchInput) {
  // When user types
  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase().trim();
    filterArticles(term);
  });

  // When user presses Enter or clicks the search button
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const term = searchInput.value.toLowerCase().trim();
    filterArticles(term);
  });
}

function filterArticles(term) {
  if (term === "") {
    renderArticles(allArticles); // reset when empty
    return;
  }

  const filtered = allArticles.filter(article =>
    (article.title && article.title.toLowerCase().includes(term)) ||
    (article.category && article.category.toLowerCase().includes(term))
  );

  renderArticles(filtered);
}

// 🎨 Render Articles on Page
function renderArticles(articles) {
  articleContainer.innerHTML = "";

  if (articles.length === 0) {
    articleContainer.innerHTML = "<p style='text-align:center; color:gray;'>No articles found.</p>";
    return;
  }

  articles.forEach((a) => {
    const div = document.createElement("div");
    div.classList.add("box");
    div.style.backgroundImage = `url(${a.image || 'assets/default.jpg'})`;
    div.style.backgroundSize = "cover";
    div.style.backgroundPosition = "center";
    div.style.height = "250px";
    div.style.borderRadius = "10px";
    div.style.overflow = "hidden";
    div.style.position = "relative";
    div.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";

    div.innerHTML = `
      <div style="background: rgba(0, 0, 0, 0.6); padding: 10px; color: white;">
        <h3>${a.title || "Untitled Article"}</h3>
        <p style="font-size: 0.9em;">Category: ${a.category || "Uncategorized"}</p>
        <div style="margin-top: 5px;">
          <button class="editBtn" data-id="${a.id}"
            style="background-color: orange; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; margin-right:5px;">
            Edit
          </button>
          <button class="deleteBtn" data-id="${a.id}"
            style="background-color:red; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">
            Delete
          </button>
        </div>
      </div>
    `;
    articleContainer.appendChild(div);
  });
}

// 🗑️ DELETE or ✏️ EDIT Functionality
document.addEventListener("click", async (e) => {
  // DELETE ARTICLE
  if (e.target.classList.contains("deleteBtn")) {
    const id = e.target.getAttribute("data-id");
    const article = allArticles.find((a) => a.id === id);

    if (confirm("🗑️ Delete this article?")) {
      try {
        await deleteDoc(doc(db, "articles", id));
        alert("✅ Article deleted!");
        await logActivity("Deleted article", article?.title || "Untitled");
      } catch (error) {
        console.error("Error deleting article:", error);
      }
    }
  }

  // EDIT ARTICLE
  if (e.target.classList.contains("editBtn")) {
    const id = e.target.getAttribute("data-id");
    const article = allArticles.find((a) => a.id === id);

    if (article) {
      localStorage.setItem("editArticle", JSON.stringify(article));
      window.location.href = "admin_dashboard.html";
    } else {
      alert("⚠️ Article not found.");
    }
  }
});

// 🧾 LOG ADMIN ACTIVITY
async function logActivity(action, title) {
  try {
    await addDoc(collection(db, "admin_activities"), {
      action,
      title,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}
