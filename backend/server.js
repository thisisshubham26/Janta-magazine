require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');


const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api', articleRoutes);

// MongoDB connection
// mongoose.connect('mongodb://127.0.0.1:27017/janta_magazine')
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => console.error(err));

app.get('/', (req, res) => {  
  res.send('Welcome to Janta Magazine API');
});


