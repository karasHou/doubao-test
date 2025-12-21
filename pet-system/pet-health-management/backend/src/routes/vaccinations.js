const express = require('express');
const router = express.Router();
const { pool } = require('../models');

router.get('/pet/:petId', async (req, res) => {
  const { petId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM vaccinations WHERE pet_id = $1 ORDER BY date_administered DESC',
      [petId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vaccinations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  const { pet_id, vaccine_name, date_administered, next_due_date, vet_name, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO vaccinations (pet_id, vaccine_name, date_administered, next_due_date, vet_name, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [pet_id, vaccine_name, date_administered, next_due_date, vet_name, notes]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating vaccination:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM vaccinations WHERE id = $1', [id]);
    res.json({ message: 'Vaccination deleted successfully' });
  } catch (error) {
    console.error('Error deleting vaccination:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;