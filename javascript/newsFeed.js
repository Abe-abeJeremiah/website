// ✅ newsFeed.js — Dynamic Homepage Feed with Hotlines
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { 
  getFirestore, collection, onSnapshot, query, orderBy 
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

// Initialize Firebase + Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔎 Select main grid container
const container = document.querySelector(".grid-layout");
if (!container) {
  console.warn("⚠️ No .grid-layout container found on page.");
}

// 🔥 Real-time listener for articles
const articlesRef = query(collection(db, "articles"), orderBy("timestamp", "desc"));

onSnapshot(articlesRef, (snapshot) => {
  if (!container) return;

  // 🧹 Clear only article boxes (keep hotline box)
  Array.from(container.children).forEach((child) => {
    // Keep any box that has a hotline class OR ID
    const isHotline = child.classList.contains("hotline-box") || child.id === "hotline-section";
    if (!isHotline) child.remove();
  });

  // 🕳️ If no articles found
  if (snapshot.empty) {
    const emptyNote = document.createElement("p");
    emptyNote.style.textAlign = "center";
    emptyNote.style.color = "gray";
    emptyNote.innerText = "No news articles available yet.";
    container.appendChild(emptyNote);
    return;
  }

  // 📰 Render articles dynamically
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (!data.title || !data.link || !data.image) return; // skip incomplete entries

    const newsCard = document.createElement("a");
    newsCard.href = data.link;
    newsCard.target = "_blank";
    newsCard.style.textDecoration = "none";

    newsCard.innerHTML = `
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
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      ">
        <div style="
          width: 100%;
          padding: 15px;
          font-size: 1.2em;
          font-weight: bold;
          text-align: left;
          text-shadow: 1px 1px 3px black;
          background: rgba(0, 0, 0, 0.4);
        ">
          ${data.title}
        </div>
      </div>
    `;

    // Insert after hotline section if present, otherwise append normally
    const hotline = container.querySelector(".hotline-box") || container.querySelector("#hotline-section");
    if (hotline) {
      hotline.insertAdjacentElement("afterend", newsCard);
    } else {
      container.appendChild(newsCard);
    }
  });
});
