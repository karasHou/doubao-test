const express = require('express');
const router = express.Router();
const { pool } = require('../models');

router.get('/pet/:petId', async (req, res) => {
  const { petId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM checkups WHERE pet_id = $1 ORDER BY checkup_date DESC',
      [petId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching checkups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  const { pet_id, checkup_date, vet_name, diagnosis, recommendations, weight } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO checkups (pet_id, checkup_date, vet_name, diagnosis, recommendations, weight) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [pet_id, checkup_date, vet_name, diagnosis, recommendations, weight]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating checkup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM checkups WHERE id = $1', [id]);
    res.json({ message: 'Checkup deleted successfully' });
  } catch (error) {
    console.error('Error deleting checkup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;