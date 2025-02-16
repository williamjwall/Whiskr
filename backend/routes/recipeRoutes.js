// backend/routes/recipeRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/recipes?search=...
router.get('/', async (req, res) => {
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
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/recipes/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM recipes WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/recipes
router.post('/', async (req, res) => {
  const { title, content, user_id } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO recipes (title, content, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, content, user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/recipes/:id
router.put('/:id', async (req, res) => {
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
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/recipes/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM recipes WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
