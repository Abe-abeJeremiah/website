import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

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

// Add Article: simple URL, title, cover photo
document.addEventListener("DOMContentLoaded", () => {
  const publishBtn = document.getElementById("publishArticleBtn");
  const saveEditsBtn = document.getElementById("saveArticleEditsBtn");
  if (!publishBtn) return;

  async function refreshArticles() {
    const list = document.getElementById("articlesList");
    if (!list) return;
    list.innerHTML = "Loading...";
    try {
      const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const rows = [];
      snap.forEach((d) => {
        const a = d.data();
        rows.push(`
          <div class="article-row" data-id="${d.id}" style="display:flex;align-items:center;gap:10px;justify-content:space-between;border:1px solid #eee;padding:8px;border-radius:8px">
            <div style="display:flex;align-items:center;gap:10px;overflow:hidden">
              <img src="${a.coverUrl || ''}" alt="" style="width:56px;height:40px;object-fit:cover;border-radius:6px" />
              <div style="max-width:260px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden">${a.title || ''}</div>
            </div>
            <div style="display:flex;gap:8px">
              <a href="${a.url || '#'}" target="_blank" class="btn-view" style="background:#2563eb;color:#fff;padding:6px 10px;border-radius:6px;text-decoration:none">Open</a>
              <button class="btn-delete" style="background:#dc2626;color:#fff;padding:6px 10px;border:none;border-radius:6px">Delete</button>
            </div>
          </div>`);
      });
      list.innerHTML = rows.join("\n");

      // bind delete
      list.querySelectorAll('.btn-delete').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const row = e.currentTarget.closest('.article-row');
          const id = row?.getAttribute('data-id');
          if (!id) return;
          if (!confirm('Delete this article?')) return;
          try {
            await deleteDoc(doc(db, 'articles', id));
            row.remove();
          } catch (err) {
            alert('Delete failed: ' + err.message);
          }
        });
      });
    } catch (err) {
      console.error(err);
      list.innerHTML = 'Failed to load articles';
    }
  }

  publishBtn.addEventListener("click", async () => {
    const status = document.getElementById("status");
    const url = (document.getElementById("articleUrl")?.value || "").trim();
    const title = (document.getElementById("articleTitleSimple")?.value || "").trim();
    const coverUrl = (document.getElementById("articleCoverUrl")?.value || "").trim();

    if (!url || !title || !coverUrl) {
      status.textContent = "Please fill in all fields.";
      status.classList.add("status-error");
      return;
    }

    try {
      publishBtn.disabled = true;
      status.textContent = "Publishing...";
      status.classList.remove("status-error");

      await addDoc(collection(db, "articles"), {
        url,
        title,
        coverUrl,
        createdAt: serverTimestamp(),
        authorUid: auth.currentUser ? auth.currentUser.uid : null
      });

      status.textContent = "Article published.";
      (document.getElementById("articleUrl")).value = "";
      (document.getElementById("articleTitleSimple")).value = "";
      (document.getElementById("articleCoverUrl")).value = "";
      await refreshArticles();
    } catch (err) {
      console.error("Publish error:", err);
      status.textContent = `Failed: ${err.message}`;
      status.classList.add("status-error");
    } finally {
      publishBtn.disabled = false;
    }
  });

  refreshArticles();

  // Save edits (title/cover)
  if (saveEditsBtn) {
    saveEditsBtn.addEventListener('click', async () => {
      const id = (document.getElementById('editArticleId')?.value || '').trim();
      const title = (document.getElementById('editArticleTitle')?.value || '').trim();
      const coverUrl = (document.getElementById('editArticleCover')?.value || '').trim();
      const status = document.getElementById('editStatus');
      if (!id || (!title && !coverUrl)) {
        status.textContent = 'Provide article ID and at least one field to update.';
        status.classList.add('status-error');
        return;
      }
      try {
        status.textContent = 'Saving...';
        status.classList.remove('status-error');
        const payload = {};
        if (title) payload.title = title;
        if (coverUrl) payload.coverUrl = coverUrl;
        await updateDoc(doc(db, 'articles', id), payload);
        status.textContent = 'Article updated.';
        await refreshArticles();
      } catch (err) {
        status.textContent = 'Failed: ' + err.message;
        status.classList.add('status-error');
      }
    });
  }
});

window.updateUserProfile = async function () {
  const user = auth.currentUser;
  if (!user) return;

  const newName = document.getElementById("newName").value.trim();
  const newPhoto = document.getElementById("newPhoto").value.trim();

  try {

    await updateProfile(user, {
      displayName: newName || user.displayName,
      photoURL: newPhoto || user.photoURL
    });

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
