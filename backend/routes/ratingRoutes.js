// backend/routes/ratingRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/ratings
router.post('/', async (req, res, next) => {
  const { value, user_id, recipe_id } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO ratings (value, user_id, recipe_id) VALUES ($1, $2, $3) RETURNING *',
      [value, user_id, recipe_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/ratings/:id
router.put('/:id', async (req, res, next) => {
  const { id } = req.params;
  const { value } = req.body;
  try {
    const result = await db.query(
      'UPDATE ratings SET value = $1, created_at = now() WHERE id = $2 RETURNING *',
      [value, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/ratings/:id
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM ratings WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }
    res.json({ message: 'Rating deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/ratings?recipe_id=...
router.get('/', async (req, res, next) => {
  const { recipe_id } = req.query;
  try {
    let query = 'SELECT * FROM ratings';
    let params = [];
    if (recipe_id) {
      query += ' WHERE recipe_id = $1';
      params.push(recipe_id);
    }
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
