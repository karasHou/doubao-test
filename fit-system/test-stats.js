const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3001;

// Test database connection (optional for testing)
const pool = new Pool({
  host: 'localhost',
  database: 'fitsystem',
  user: 'postgres',
  password: 'password',
  port: 5432
});

// Test stats route
app.get('/test-weekly', async (req, res) => {
  try {
    console.log('Testing weekly stats...');
    const result = await pool.query(`
      SELECT
        DATE_TRUNC('week', training_date) as week_start,
        COUNT(*) as training_sessions,
        AVG(performance_rating) as avg_performance,
        SUM(
          CASE
            WHEN jsonb_typeof(exercises) = 'array' THEN (SELECT COUNT(*) FROM jsonb_array_elements(exercises))
            ELSE 0
          END
        ) as total_exercises
      FROM training_records
      GROUP BY DATE_TRUNC('week', training_date)
      ORDER BY week_start DESC
    `);
    console.log('Query result:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
});
