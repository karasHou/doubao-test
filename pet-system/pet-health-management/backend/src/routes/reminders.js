const express = require('express');
const router = express.Router();
const { pool } = require('../models');

router.get('/pet/:petId', async (req, res) => {
  const { petId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM reminders WHERE pet_id = $1 ORDER BY reminder_date DESC',
      [petId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reminders ORDER BY reminder_date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all reminders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  const { pet_id, title, reminder_date, type, is_sent, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO reminders (pet_id, title, reminder_date, type, is_sent, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [pet_id, title, reminder_date, type, is_sent || false, notes]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { is_sent } = req.body;
  try {
    const result = await pool.query(
      'UPDATE reminders SET is_sent = $1 WHERE id = $2 RETURNING *',
      [is_sent, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM reminders WHERE id = $1', [id]);
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;