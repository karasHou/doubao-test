const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// PostgreSQL Configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'fitsystem',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432
});

// Initialize Database
const { initializeDatabase } = require('./models');
initializeDatabase();

// Redis Configuration - 暂时禁用 Redis 连接以避免错误
// 我们将在有需要时再启用
let redisClient = null;

app.get('/api/plans', async (req, res) => {
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

app.post('/api/plans', async (req, res) => {
  try {
    const { name, description, exercises, duration_weeks, intensity_level } = req.body;

    const result = await pool.query(`
      INSERT INTO training_plans (name, description, exercises, duration_weeks, intensity_level)
      VALUES ($1, $2, $3::jsonb, $4, $5)
      RETURNING *
    `, [name, description, JSON.stringify(exercises), duration_weeks, intensity_level]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating training plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/records', async (req, res) => {
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

app.post('/api/records', async (req, res) => {
  try {
    const { plan_id, training_date, exercises, notes, performance_rating } = req.body;

    const result = await pool.query(`
      INSERT INTO training_records (plan_id, training_date, exercises, notes, performance_rating)
      VALUES ($1, $2, $3::jsonb, $4, $5)
      RETURNING *
    `, [plan_id, training_date, JSON.stringify(exercises), notes, performance_rating]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating training record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Weekly Stats Route
app.get('/api/stats/weekly', async (req, res) => {
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

// Monthly Stats Route
app.get('/api/stats/monthly', async (req, res) => {
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

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: 'v4',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      redis: 'disabled',
      api: 'active'
    }
  });
});

app.listen(port, () => {
  console.log(`Fit System Backend running on port ${port}`);
});
