// backend/index.js
require('dotenv').config(); // Load .env variables early

const express = require('express');
const app = express();

const recipeRoutes = require('./routes/recipeRoutes');
const userRoutes = require('./routes/userRoutes');

// Middleware: parse JSON requests
app.use(express.json());

// (Optional) Enable CORS if your frontend runs on a different origin
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Mount API routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
