// backend/routes/recipeRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');

// GET /api/recipes?search=...
router.get('/', async (req, res, next) => {
  const { search } = req.query;
  try {
    let query = 'SELECT * FROM recipes';
    let params = [];
    if (search) {
      query += ' WHERE title ILIKE $1 OR content ILIKE $1';
      params.push(`%${search}%`);
    }
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
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

// POST /api/recipes
// Require authentication so that the user_id is taken from the token.
router.post('/', authenticateToken, async (req, res, next) => {
  const { title, content } = req.body;
  const user_id = req.user.id; // user id from the authenticated token
  try {
    const result = await db.query(
      'INSERT INTO recipes (title, content, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, content, user_id]
    );
    res.status(201).json(result.rows[0]);
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
