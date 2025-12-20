const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bill_db',
  user: process.env.DB_USER || 'bill_user',
  password: process.env.DB_PASSWORD || 'bill_password'
});

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.connect().catch(console.error);

app.get('/api/expenses', async (req, res) => {
  try {
    const { startDate, endDate, categoryId, tags } = req.query;
    let query = 'SELECT e.*, c.name as category_name, c.color FROM expenses e LEFT JOIN categories c ON e.category_id = c.id WHERE 1=1';
    let params = [];
    let paramIndex = 1;

    if (startDate) {
      query += ` AND date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      query += ` AND date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    if (categoryId) {
      query += ` AND category_id = $${paramIndex}`;
      params.push(categoryId);
      paramIndex++;
    }
    if (tags) {
      const tagArray = tags.split(',');
      query += ` AND tags && $${paramIndex}`;
      params.push(tagArray);
      paramIndex++;
    }

    query += ' ORDER BY date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const { amount, description, category_id, tags, date } = req.body;
    const result = await pool.query(
      'INSERT INTO expenses (amount, description, category_id, tags, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [amount, description, category_id, tags || [], date || new Date()]
    );

    await redisClient.del('expense_stats');

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/stats/summary', async (req, res) => {
  try {
    const cacheKey = 'expense_summary';
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const result = await pool.query(`
      SELECT
        c.name as category,
        c.color,
        SUM(e.amount) as total_amount,
        COUNT(*) as transaction_count
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
      GROUP BY c.name, c.color
      ORDER BY total_amount DESC
    `);

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(result.rows));

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/stats/trend', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const cacheKey = `trend_${period}`;
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    let query;
    if (period === 'week') {
      query = `
        SELECT DATE_TRUNC('week', date) as period, SUM(amount) as total
        FROM expenses
        GROUP BY DATE_TRUNC('week', date)
        ORDER BY period
      `;
    } else {
      query = `
        SELECT DATE_TRUNC('month', date) as period, SUM(amount) as total
        FROM expenses
        GROUP BY DATE_TRUNC('month', date)
        ORDER BY period
      `;
    }

    const result = await pool.query(query);

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(result.rows));

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching trend:', error);
    res.status(500).json({ error: 'Failed to fetch trend' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
