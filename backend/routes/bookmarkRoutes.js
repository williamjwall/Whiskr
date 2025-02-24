// backend/routes/bookmarkRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/bookmarks
router.post('/', async (req, res, next) => {
  const { user_id, recipe_id } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO bookmarks (user_id, recipe_id) VALUES ($1, $2) RETURNING *',
      [user_id, recipe_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/bookmarks
// This endpoint expects a JSON body with user_id and recipe_id to identify the bookmark.
router.delete('/', async (req, res, next) => {
  const { user_id, recipe_id } = req.body;
  try {
    const result = await db.query(
      'DELETE FROM bookmarks WHERE user_id = $1 AND recipe_id = $2 RETURNING *',
      [user_id, recipe_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }
    res.json({ message: 'Bookmark removed successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/bookmarks/user/:userId
router.get('/user/:userId', async (req, res, next) => {
  const { userId } = req.params;
  try {
    // Join bookmarks with recipes for additional recipe details
    const result = await db.query(
      `SELECT b.*, r.title, r.content 
       FROM bookmarks b 
       JOIN recipes r ON b.recipe_id = r.id 
       WHERE b.user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
