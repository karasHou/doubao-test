const express = require('express');
const router = express.Router();
const { pool } = require('../models');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pets ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  const { name, type, breed, birthday, weight } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO pets (name, type, breed, birthday, weight) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, type, breed, birthday, weight]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating pet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, breed, birthday, weight } = req.body;
  try {
    const result = await pool.query(
      'UPDATE pets SET name = $1, type = $2, breed = $3, birthday = $4, weight = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [name, type, breed, birthday, weight, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM pets WHERE id = $1', [id]);
    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;