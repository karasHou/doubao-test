const express = require('express');

module.exports = (pool, redisClient) => {
  const router = express.Router();

  // Get all training plans
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT * FROM training_plans
        ORDER BY created_at DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching training plans:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get training plan by ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        SELECT * FROM training_plans
        WHERE id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Training plan not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching training plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create new training plan
  router.post('/', async (req, res) => {
    try {
      const { name, description, exercises, duration_weeks, intensity_level } = req.body;

      const result = await pool.query(`
        INSERT INTO training_plans (name, description, exercises, duration_weeks, intensity_level)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [name, description, exercises, duration_weeks, intensity_level]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating training plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update training plan
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, exercises, duration_weeks, intensity_level } = req.body;

      const result = await pool.query(`
        UPDATE training_plans
        SET name = $1, description = $2, exercises = $3, duration_weeks = $4, intensity_level = $5
        WHERE id = $6
        RETURNING *
      `, [name, description, exercises, duration_weeks, intensity_level, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Training plan not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating training plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete training plan
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        DELETE FROM training_plans
        WHERE id = $1
        RETURNING *
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Training plan not found' });
      }

      res.json({ message: 'Training plan deleted successfully' });
    } catch (error) {
      console.error('Error deleting training plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Adjust intensity for a plan
  router.post('/:id/adjust-intensity', async (req, res) => {
    try {
      const { id } = req.params;
      const IntensityAdjuster = require('../services/intensityAdjuster');
      const intensityAdjuster = new IntensityAdjuster(pool);

      const result = await intensityAdjuster.adjustIntensity(id);

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Training plan not found' });
      }
    } catch (error) {
      console.error('Error adjusting intensity:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get intensity adjustment suggestions
  router.get('/:id/adjustment-suggestions', async (req, res) => {
    try {
      const { id } = req.params;
      const IntensityAdjuster = require('../services/intensityAdjuster');
      const intensityAdjuster = new IntensityAdjuster(pool);

      const suggestions = await intensityAdjuster.getAdjustmentSuggestions(id);
      res.json(suggestions);
    } catch (error) {
      console.error('Error getting adjustment suggestions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
