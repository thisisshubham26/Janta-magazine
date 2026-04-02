
// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');

// router.post('/register', async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;
//     const user = new User({ name, email, password, role });
//     await user.save();
//     res.status(201).json(user);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email, password });
//     if (!user) return res.status(401).json({ error: "Invalid credentials" });
//     res.json(user);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET = process.env.JWT_SECRET || "supersecretkey";

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    // issue token
    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    // issue token
    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
