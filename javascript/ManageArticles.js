import { 
    initializeApp 
  } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
  import { 
    getFirestore, collection, onSnapshot, deleteDoc, doc 
  } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
  import { 
    getAuth, onAuthStateChanged, signOut 
  } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
  
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
  const db = getFirestore(app);
  const auth = getAuth(app);
  
  onAuthStateChanged(auth, (user) => {
    if (user) {
      document.getElementById("adminName").textContent = user.displayName || user.email;
    } else {
      window.location.href = "admin_login.html";
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "admin_login.html";
  });
  
  const articleContainer = document.getElementById("articleContainer");
  const searchInput = document.querySelector('.search-profile input[type="text"]');
  let allArticles = [];
  
  onSnapshot(collection(db, "articles"), (snapshot) => {
    allArticles = [];
    articleContainer.innerHTML = "";
  
    snapshot.forEach((docSnap) => {
      allArticles.push({ id: docSnap.id, ...docSnap.data() });
    });
  
    renderArticles(allArticles);
  });
  
  // 🔍 Search Filter
  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase().trim();
    const filtered = allArticles.filter(
      (a) => a.title.toLowerCase().includes(term) || a.category.toLowerCase().includes(term)
    );
    renderArticles(filtered);
  });
  
  // 🎨 Render Articles
  function renderArticles(articles) {
    articleContainer.innerHTML = "";
  
    if (articles.length === 0) {
      articleContainer.innerHTML = "<p style='text-align:center; color:gray;'>No articles found.</p>";
      return;
    }
  
    articles.forEach((a) => {
      const div = document.createElement("div");
      div.classList.add("box");
      div.style.backgroundImage = `url(${a.image})`;
      div.style.backgroundSize = "cover";
      div.style.backgroundPosition = "center";
      div.style.height = "250px";
      div.style.borderRadius = "10px";
      div.style.overflow = "hidden";
      div.style.position = "relative";
      div.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
  
      div.innerHTML = `
        <div style="background: rgba(0, 0, 0, 0.6); padding: 10px; color: white;">
          <h3>${a.title}</h3>
          <p style="font-size: 0.9em;">Category: ${a.category}</p>
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
  
  
  document.addEventListener("click", async (e) => {
   
    if (e.target.classList.contains("deleteBtn")) {
      const id = e.target.getAttribute("data-id");
      if (confirm("Delete this article?")) {
        await deleteDoc(doc(db, "articles", id));
        alert("Article deleted!");
      }
    }
  

    if (e.target.classList.contains("editBtn")) {
      const id = e.target.getAttribute("data-id");
      const article = allArticles.find((a) => a.id === id);
  
      if (article) {
        // Save article info to localStorage
        localStorage.setItem("editArticle", JSON.stringify(article));
        // Redirect to dashboard for editing
        window.location.href = "admin_dashboard.html";
      } else {
        alert("Article not found.");
      }
    }
  });
  