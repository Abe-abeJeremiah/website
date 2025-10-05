// ✅ categoryFeed.js — Dynamic Category-Based Article Loader
import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { 
  getFirestore, collection, query, where, onSnapshot, orderBy 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

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
const db = getFirestore(app);

// 🧩 Auto-detect category from page filename
const page = window.location.pathname.toLowerCase();
let category = "news"; // default

const categoryMap = {
  "sports.html": "sports",
  "culture-events.html": "events",
  "crime-safety.html": "crime-safety",
  "public-service.html": "public-service",
  "public-governance.html": "public-governance",
  "health-sanitation.html": "health-sanitation",
  "traffic-transport.html": "traffic-transport",
  "economy-business.html": "economy-business",
  "lifestyle-community.html": "lifestyle-community",
  "youth-education.html": "youth-education"
};

for (const [file, cat] of Object.entries(categoryMap)) {
  if (page.includes(file)) {
    category = cat;
    break;
  }
}

console.log("🗂️ Current category:", category);

// 📰 Get container
const container = document.querySelector(".grid-layout");
if (!container) {
  console.warn("⚠️ No .grid-layout container found on this page.");
} else {
  container.innerHTML = `<p style='text-align:center; color:gray;'>Loading ${category} articles...</p>`;

  // 🧠 Create query safely
  let q;
  try {
    q = query(
      collection(db, "articles"),
      where("category", "==", category),
      orderBy("timestamp", "desc")
    );
  } catch (error) {
    console.error("⚠️ Firestore index error:", error);
    q = query(collection(db, "articles"), where("category", "==", category));
  }

  // 🔄 Real-time updates
  try {
    onSnapshot(q, (snapshot) => {
      container.innerHTML = "";
      if (snapshot.empty) {
        container.innerHTML = `<p style='text-align:center; color:gray;'>No ${category} articles yet.</p>`;
        return;
      }

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.title || !data.image || !data.link) return;

        const articleLink = document.createElement("a");
        articleLink.href = data.link;
        articleLink.target = "_blank";
        articleLink.style.textDecoration = "none";

        articleLink.innerHTML = `
          <div class="box" style="
            background-image: url('${data.image}');
            background-size: cover;
            background-position: center;
            height: 250px;
            color: white;
            display: flex;
            align-items: flex-end;
            border-radius: 10px;
            overflow: hidden;
            position: relative;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            opacity: 0;
            transition: opacity 0.4s ease-in-out, transform 0.2s ease-in-out;
          ">
            <div style="
              width: 100%;
              padding: 15px;
              font-size: 1.2em;
              font-weight: bold;
              text-align: left;
              text-shadow: 1px 1px 3px black;
              background: rgba(0,0,0,0.4);
            ">
              ${data.title}
            </div>
          </div>
        `;
        container.appendChild(articleLink);
        requestAnimationFrame(() => articleLink.querySelector(".box").style.opacity = 1);
      });
    });
  } catch (error) {
    if (error.message.includes("requires an index")) {
      const match = error.message.match(/https:\/\/console\.firebase\.google\.com\/[^\s]+/);
      const link = match ? match[0] : "https://console.firebase.google.com/";
      container.innerHTML = `
        <p style="text-align:center; color:red;">
          ⚠️ This Firestore query requires an index.<br>
          <a href="${link}" target="_blank">👉 Click here to create it in Firebase Console.</a>
        </p>`;
    } else {
      container.innerHTML = `<p style="text-align:center; color:red;">❌ Error loading ${category} articles.</p>`;
      console.error("Firestore onSnapshot error:", error);
    }
  }
}