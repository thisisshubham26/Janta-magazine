// document.addEventListener("DOMContentLoaded", async () => {
//   const API = "http://localhost:5000/api";
//   const userId = localStorage.getItem("jm_userId");
//   const role = localStorage.getItem("jm_role");
//   const container = document.getElementById("writerArticles");

//   if (role !== "writer") {
//     container.innerHTML = "<p>You must be a writer to view this page.</p>";
//     return;
//   }

//   try {
//     const res = await fetch(API + "/articles");
//     const articles = await res.json();
//     console.log("Articles from API:", articles);

//     const mine = articles.filter(a => String(a.author?._id) === String(userId));
//     console.log("Filtered articles:", mine);

//     if (mine.length === 0) {
//       container.innerHTML = "<p>No articles found for this writer.</p>";
//       return;
//     }

//     container.innerHTML = mine.map(a => `
//       <div class="card">
//         <h3>${a.title}</h3>
//         <p>${a.content.substring(0, 100)}...</p>
//         <a href="edit-article.html?id=${a._id}">Edit</a>
//         <button onclick="deleteArticle('${a._id}')">Delete</button>
//       </div>
//     `).join("");
//   } catch (err) {
//     console.error("Error loading articles:", err);
//     container.innerHTML = "<p>Failed to load articles.</p>";
//   }

//   window.deleteArticle = async (id) => {
//     if (!confirm("Delete this article?")) return;
//     await fetch(`${API}/articles/${id}`, { method: "DELETE" });
//     location.reload();
//   };
// });


document.addEventListener("DOMContentLoaded", async () => {
  const API = "https://janta-magazine.onrender.com/api";
  const token = localStorage.getItem("jm_token");
  const container = document.getElementById("writerArticles");

  if (!token) {
    container.innerHTML = "<p>You must be logged in to view this page.</p>";
    return;
  }

  // Decode JWT payload
  let payload;
  try {
    payload = JSON.parse(atob(token.split('.')[1]));
  } catch (err) {
    console.error("Invalid token", err);
    container.innerHTML = "<p>Invalid login session. Please log in again.</p>";
    return;
  }

  const userId = payload.id;
  const role = payload.role;

  if (role !== "writer") {
    container.innerHTML = "<p>You must be a writer to view this page.</p>";
    return;
  }

  try {
    const res = await fetch(API + "/articles", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const articles = await res.json();
    console.log("Articles from API:", articles);

    const mine = articles.filter(a => String(a.author?._id) === String(userId));
    console.log("Filtered articles:", mine);

    if (mine.length === 0) {
      container.innerHTML = "<p>No articles found for this writer.</p>";
      return;
    }

    container.innerHTML = mine.map(a => `
      <div class="card">
        <h3>${a.title}</h3>
        <p>${a.content.substring(0, 100)}...</p>
        <a href="edit-article.html?id=${a._id}">Edit</a>
        <button onclick="deleteArticle('${a._id}')">Delete</button>
      </div>
    `).join("");
  } catch (err) {
    console.error("Error loading articles:", err);
    container.innerHTML = "<p>Failed to load articles.</p>";
  }

  window.deleteArticle = async (id) => {
    if (!confirm("Delete this article?")) return;
    try {
      await fetch(`${API}/articles/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      location.reload();
    } catch (err) {
      alert("Failed to delete article");
    }
  };
});

