document.addEventListener("DOMContentLoaded", async () => {
  const API = "https://janta-mag.onrender.com/api";
  const token = localStorage.getItem("jm_token");

  const params = new URLSearchParams(window.location.search);
  const articleId = params.get("id");

  const titleEl = document.getElementById("articleTitle");
  const bodyEl = document.getElementById("articleBody");
  const categoryEl = document.getElementById("articleCategory");
  const authorEl = document.getElementById("articleAuthor");
  const likeBtn = document.getElementById("likeBtn");
  const likeCount = document.getElementById("likeCount");
  const commentsList = document.getElementById("commentsList");
  const commentForm = document.getElementById("commentForm");
  const commentText = document.getElementById("commentText");

  // Load article
  async function loadArticle() {
    try {
      const res = await fetch(`${API}/articles/${articleId}`);
      const article = await res.json();
      titleEl.textContent = article.title;
      bodyEl.textContent = article.content;
      categoryEl.textContent = article.category || "Uncategorized";
      authorEl.textContent = article.author?.name || "Unknown";
      likeCount.textContent = article.likes || 0;

      loadComments();
    } catch (err) {
      console.error("Error loading article:", err);
      titleEl.textContent = "Error loading article";
    }
  }

  // Load comments
  async function loadComments() {
    try {
      const res = await fetch(`${API}/articles/${articleId}/comments`);
      const comments = await res.json();
      renderComments(comments);
    } catch (err) {
      console.error("Error loading comments:", err);
    }
  }

  function renderComments(comments) {
    commentsList.innerHTML = comments.map(c => `
      <li><strong>${c.user?.name || "Anonymous"}:</strong> ${c.text}</li>
    `).join("");
  }

  // Like button
  if (likeBtn) {
    if (!token) {
      likeBtn.disabled = true;
      likeBtn.title = "Login required to like";
    } else {
      likeBtn.addEventListener("click", async () => {
        try {
          const res = await fetch(`${API}/articles/${articleId}/like`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
          });
          const data = await res.json();
          likeCount.textContent = data.likes;
        } catch (err) {
          console.error("Error liking article:", err);
          alert("Failed to like article");
        }
      });
    }
  }

  // Comment form
  if (commentForm) {
    if (!token) {
      commentForm.style.display = "none"; // hide for guests
    } else {
      commentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = commentText.value.trim();
        if (!text) return;

        try {
          await fetch(`${API}/articles/${articleId}/comment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ text })
          });

          await loadComments();
          commentText.value = "";
        } catch (err) {
          console.error("Error posting comment:", err);
          alert("Failed to post comment");
        }
      });
    }
  }

  loadArticle();
});
