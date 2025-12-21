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
  connectionString: process.env.DATABASE_URL || 'postgresql://shopuser:shoppass@db:5432/shopdb'
});

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});

redisClient.connect().catch(console.error);

app.get('/api/products', async (req, res) => {
  try {
    const cacheKey = 'products:all';
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log('Cache hit for products');
      return res.json(JSON.parse(cached));
    }

    console.log('Cache miss, querying database');
    const result = await pool.query(`
      SELECT p.*,
             (SELECT array_agg(json_build_object('price', h.price, 'date', h.date))
              FROM price_history h WHERE h.product_id = p.id) as price_history
      FROM products p
      ORDER BY p.id
    `);

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(result.rows));
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, category, current_price, store } = req.body;

    const result = await pool.query(
      'INSERT INTO products (name, category, current_price, store) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, category, current_price, store]
    );

    await redisClient.del('products:all');

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT category FROM products ORDER BY category');
    res.json(result.rows.map(r => r.category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/stores', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT store FROM products ORDER BY store');
    res.json(result.rows.map(r => r.store));
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});