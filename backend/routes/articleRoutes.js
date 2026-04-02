const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const authMiddleware = require('../middleware/auth');

// Get all articles
router.get('/articles', async (req, res) => {
  try {
    const articles = await Article.find().populate('author', 'name role');
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// Get single article
router.get('/articles/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate('author', 'name role');
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create article
// router.post('/articles', async (req, res) => {
//   try {
//     const { title, content, category, author } = req.body;
//     const article = new Article({ title, content, category, author });
//     await article.save();
//     res.status(201).json(article);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });


router.post('/articles', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "writer") {
      return res.status(403).json({ error: "Only writers can create articles" });
    }
    const { title, content, category } = req.body;
    const article = new Article({ title, content, category, author: req.user.id });
    await article.save();
    res.status(201).json(article);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update article (general edit)
// router.put('/articles/:id', async (req, res) => {
//   try {
//     const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json(article);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

router.put('/articles/:id', authMiddleware, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });

    // Only author or admin can edit
    if (String(article.author) !== String(req.user.id) && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to edit this article" });
    }

    article.title = req.body.title;
    article.content = req.body.content;
    article.category = req.body.category;
    await article.save();

    res.json(article);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Delete article
router.delete('/articles/:id', async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: 'Article deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// 👍 Like an article
// router.post('/articles/:id/like', async (req, res) => {
//   try {
//     const article = await Article.findById(req.params.id);
//     if (!article) return res.status(404).json({ error: 'Article not found' });

//     article.likes += 1;
//     await article.save();
//     res.json({ likes: article.likes });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });


router.post('/articles/:id/like', authMiddleware, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });

    article.likes += 1;
    await article.save();
    res.json({ likes: article.likes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 💬 Add a comment
// 💬 Add a comment
// router.post('/articles/:id/comment',async (req, res) => {
//   try {
//     const { user, text } = req.body;
//     const article = await Article.findById(req.params.id);
//     if (!article) return res.status(404).json({ error: 'Article not found' });

//     article.comments.push({ user, text });
//     await article.save();

//     // Re-fetch with populate so user names are included
//     const populatedArticle = await Article.findById(req.params.id)
//       .populate('comments.user', 'name role');

//     res.json(populatedArticle.comments);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });


router.post('/articles/:id/comment', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });

    article.comments.push({ user: req.user.id, text });
    await article.save();

    const populatedArticle = await Article.findById(req.params.id)
      .populate('comments.user', 'name role');

    res.json(populatedArticle.comments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});




// Get all comments for an article
router.get('/articles/:id/comments', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('comments.user', 'name role');
    if (!article) return res.status(404).json({ error: 'Article not found' });

    res.json(article.comments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;
