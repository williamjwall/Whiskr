// backend/routes/bookmarkRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');

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
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const authenticatedUserId = req.user.id;
    
    if (!userId || userId === 'undefined') {
      return res.status(400).json({ error: 'Valid user ID is required' });
    }
    
    if (userId !== authenticatedUserId) {
      console.log('User ID mismatch:', { requestedId: userId, authenticatedId: authenticatedUserId });
      return res.status(403).json({ error: 'Unauthorized access to bookmarks' });
    }
    
    console.log('Fetching bookmarks for user:', userId);
    
    const result = await db.query(
      `SELECT r.*, b.created_at as bookmarked_at
       FROM bookmarks b
       JOIN recipes r ON b.recipe_id = r.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );
    
    console.log(`Found ${result.rows.length} bookmarks for user ${userId}`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching bookmarks:', err);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

module.exports = router;
