const express = require('express');

module.exports = (pool, redisClient) => {
  const router = express.Router();

  // Get weekly training stats
  router.get('/weekly', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          DATE_TRUNC('week', training_date) as week_start,
          COUNT(*) as training_sessions,
          AVG(performance_rating) as avg_performance
        FROM training_records
        GROUP BY DATE_TRUNC('week', training_date)
        ORDER BY week_start DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching weekly stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get monthly training stats
  router.get('/monthly', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          DATE_TRUNC('month', training_date) as month_start,
          COUNT(*) as training_sessions,
          AVG(performance_rating) as avg_performance
        FROM training_records
        GROUP BY DATE_TRUNC('month', training_date)
        ORDER BY month_start DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get training progress
  router.get('/progress', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          training_date,
          performance_rating
        FROM training_records
        ORDER BY training_date
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching progress:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get exercise frequency
  router.get('/exercise-frequency', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          'placeholder' as exercise_name,
          0 as total_performed
        FROM training_records
        LIMIT 1
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching exercise frequency:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
