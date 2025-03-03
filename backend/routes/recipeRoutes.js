// backend/routes/recipeRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');

// GET /api/recipes?search=...&featured=true
router.get('/', async (req, res, next) => {
  const { search, featured, category, difficulty, time } = req.query;
  try {
    let query = 'SELECT * FROM recipes';
    const conditions = [];
    const params = [];
    let paramIndex = 1;
    
    if (search) {
      conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (featured === 'true') {
      conditions.push(`is_featured = true`);
    }
    
    if (category && category !== 'all') {
      conditions.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }
    
    if (difficulty && difficulty !== 'all') {
      conditions.push(`difficulty = $${paramIndex}`);
      params.push(difficulty);
      paramIndex++;
    }
    
    if (time) {
      conditions.push(`time_minutes <= $${paramIndex}`);
      params.push(parseInt(time, 10));
      paramIndex++;
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    // Add ordering
    query += ` ORDER BY created_at DESC`;
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/recipes/user/:userId
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId || userId === 'undefined') {
      return res.status(400).json({ error: 'Valid user ID is required' });
    }
    
    const result = await db.query(
      `SELECT * FROM recipes 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user recipes:', err);
    res.status(500).json({ error: 'Failed to fetch user recipes' });
  }
});

// POST /api/recipes
// Require authentication so that the user_id is taken from the token.
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('REQUEST BODY RECEIVED:', req.body);
    
    // Extract with defaults for ALL fields
    const { 
      title = '', 
      description = 'No description provided', 
      content = '', 
      difficulty = 'easy',
      time_minutes = 30,
      category = 'dinner',
      image_url = null 
    } = req.body || {};
    
    // Force non-null values
    const safeValues = {
      title: title || 'Untitled Recipe',
      description: description || 'No description provided',
      content: content || 'No instructions provided',
      difficulty: difficulty || 'easy',
      time_minutes: time_minutes || 30,
      category: category || 'dinner',
      image_url: image_url,
      user_id: req.user.id
    };
    
    console.log('SAFE VALUES FOR INSERT:', safeValues);
    
    // Use the safe values in your query
    const result = await db.query(
      `INSERT INTO recipes 
       (title, description, content, difficulty, time_minutes, category, image_url, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        safeValues.title, 
        safeValues.description, 
        safeValues.content, 
        safeValues.difficulty, 
        safeValues.time_minutes, 
        safeValues.category, 
        safeValues.image_url, 
        safeValues.user_id
      ]
    );

    console.log('Database insert successful:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('FULL ERROR OBJECT:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/recipes/:id/feature
// This would typically be an admin-only route
router.post('/:id/feature', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;
    
    // Optional: Check if user is admin
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ error: 'Unauthorized' });
    // }
    
    const result = await db.query(
      'UPDATE recipes SET is_featured = $1 WHERE id = $2 RETURNING *',
      [featured === true, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error featuring recipe:', err);
    res.status(500).json({ error: 'Failed to update recipe featured status' });
  }
});

// Add a test endpoint to verify the router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Recipe router is working' });
});

// POST /api/recipes/:id/bookmark
router.post('/:id/bookmark', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Get userId from the authenticated token
    
    console.log('Bookmark request:', { recipeId: id, userId });
    
    // Check if recipe exists
    const recipeCheck = await db.query('SELECT id FROM recipes WHERE id = $1', [id]);
    if (recipeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    // Check if bookmark already exists
    const bookmarkCheck = await db.query(
      'SELECT id FROM bookmarks WHERE user_id = $1 AND recipe_id = $2',
      [userId, id]
    );
    
    if (bookmarkCheck.rows.length > 0) {
      // If already bookmarked, return success to make the operation idempotent
      return res.status(200).json({ message: 'Recipe already bookmarked', id: bookmarkCheck.rows[0].id });
    }
    
    // Add bookmark
    const result = await db.query(
      'INSERT INTO bookmarks (user_id, recipe_id) VALUES ($1, $2) RETURNING *',
      [userId, id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error bookmarking recipe:', err);
    res.status(500).json({ error: 'Failed to bookmark recipe' });
  }
});

// DELETE /api/recipes/:id/bookmark
router.delete('/:id/bookmark', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Get userId from the authenticated token
    
    console.log('Remove bookmark request:', { recipeId: id, userId });
    
    const result = await db.query(
      'DELETE FROM bookmarks WHERE user_id = $1 AND recipe_id = $2 RETURNING *',
      [userId, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }
    
    res.json({ message: 'Bookmark removed successfully' });
  } catch (err) {
    console.error('Error removing bookmark:', err);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

// GET /api/recipes/:id
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM recipes WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/recipes/:id
// Require authentication; optionally, you could verify the recipe belongs to req.user.id.
router.put('/:id', authenticateToken, async (req, res, next) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const result = await db.query(
      'UPDATE recipes SET title = $1, content = $2, updated_at = now() WHERE id = $3 RETURNING *',
      [title, content, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/recipes/:id
// Require authentication; optionally, check ownership before deleting.
router.delete('/:id', authenticateToken, async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM recipes WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
