const express = require('express');
const IntensityAdjuster = require('../services/intensityAdjuster');

module.exports = (pool, redisClient) => {
  const router = express.Router();
  const intensityAdjuster = new IntensityAdjuster(pool);

  // Get all training records
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT * FROM training_records
        ORDER BY training_date DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching training records:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get training record by ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        SELECT * FROM training_records
        WHERE id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Training record not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching training record:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create new training record
  router.post('/', async (req, res) => {
    try {
      const { plan_id, training_date, exercises, notes, performance_rating } = req.body;

      const result = await pool.query(`
        INSERT INTO training_records (plan_id, training_date, exercises, notes, performance_rating)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [plan_id, training_date, exercises, notes, performance_rating]);

      // 自动调整训练强度
      if (plan_id) {
        await intensityAdjuster.adjustIntensity(plan_id);
      }

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating training record:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update training record
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { plan_id, training_date, exercises, notes, performance_rating } = req.body;

      const result = await pool.query(`
        UPDATE training_records
        SET plan_id = $1, training_date = $2, exercises = $3, notes = $4, performance_rating = $5
        WHERE id = $6
        RETURNING *
      `, [plan_id, training_date, exercises, notes, performance_rating, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Training record not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating training record:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete training record
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        DELETE FROM training_records
        WHERE id = $1
        RETURNING *
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Training record not found' });
      }

      res.json({ message: 'Training record deleted successfully' });
    } catch (error) {
      console.error('Error deleting training record:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
