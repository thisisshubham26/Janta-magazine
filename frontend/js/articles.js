document.addEventListener("DOMContentLoaded", async () => {
  const API = "https://janta-magazine.onrender.com/api";
  const list = document.getElementById("articlesList");

  try {
    const res = await fetch(API + "/articles");
    if (!res.ok) throw new Error("Network response was not ok");
    const articles = await res.json();
    console.log("Articles from API:", articles);

    if (articles.length === 0) {
      list.innerHTML = "<p>No articles available yet.</p>";
      return;
    }

    list.innerHTML = articles.map(a => `
      <div class="card">
        <h3>${a.title}</h3>
        <p>${a.content.substring(0, 100)}...</p>
        <a href="article.html?id=${a._id}">Read More</a>
      </div>
    `).join("");
  } catch (err) {
    console.error("Error loading articles:", err);
    list.innerHTML = "<p>Failed to load articles.</p>";
  }
});
