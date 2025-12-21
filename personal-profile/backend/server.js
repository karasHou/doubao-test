const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Client } = require('pg');
const elasticsearch = require('elasticsearch');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const db = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://admin:password@localhost:5432/learning_material'
});

db.connect();

const esClient = new elasticsearch.Client({
  host: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  log: 'error'
});

esClient.ping({ requestTimeout: 30000 }, (error) => {
  if (error) {
    console.error('Elasticsearch cluster is down!');
  } else {
    console.log('Successfully connected to Elasticsearch');
    initializeElasticsearch();
  }
});

async function initializeElasticsearch() {
  const indexExists = await esClient.indices.exists({ index: 'materials' });
  if (!indexExists.body) {
    await esClient.indices.create({
      index: 'materials',
      body: {
        mappings: {
          properties: {
            id: { type: 'integer' },
            title: { type: 'text' },
            description: { type: 'text' },
            tags: { type: 'keyword' }
          }
        }
      }
    });
  }
}

app.post('/api/materials', upload.single('file'), async (req, res) => {
  try {
    const { title, description, categoryId, tags } = req.body;

    const result = await db.query(
      'INSERT INTO materials (title, description, file_path, file_type, file_size, category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, `/uploads/${req.file.filename}`, req.file.mimetype, req.file.size, categoryId || null]
    );

    const material = result.rows[0];

    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim());
      for (const tagName of tagArray) {
        const tagResult = await db.query(
          'INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id',
          [tagName]
        );
        const tagId = tagResult.rows[0].id;
        await db.query(
          'INSERT INTO material_tags (material_id, tag_id) VALUES ($1, $2)',
          [material.id, tagId]
        );
      }
    }

    await esClient.index({
      index: 'materials',
      id: material.id.toString(),
      body: {
        id: material.id,
        title: material.title,
        description: material.description,
        tags: tags ? tags.split(',').map(t => t.trim()) : []
      }
    });

    res.status(201).json(material);
  } catch (error) {
    console.error('Error uploading material:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/materials', async (req, res) => {
  try {
    const { search, category, tags, sort = 'recent' } = req.query;

    if (search) {
      const esResult = await esClient.search({
        index: 'materials',
        body: {
          query: {
            multi_match: {
              query: search,
              fields: ['title^2', 'description', 'tags']
            }
          }
        }
      });

      const materialIds = esResult.hits.hits.map(hit => hit._source.id);

      if (materialIds.length > 0) {
        const placeholders = materialIds.map((_, i) => `$${i + 1}`).join(',');
        const result = await db.query(
          `SELECT m.*, c.name as category_name
           FROM materials m
           LEFT JOIN categories c ON m.category_id = c.id
           WHERE m.id IN (${placeholders})
           ORDER BY m.last_accessed DESC`,
          materialIds
        );
        res.json(result.rows);
      } else {
        res.json([]);
      }
    } else {
      let query = `
        SELECT m.*, c.name as category_name
        FROM materials m
        LEFT JOIN categories c ON m.category_id = c.id
      `;
      let params = [];

      if (category) {
        query += ` WHERE c.name = $1`;
        params = [category];
      }

      if (sort === 'recent') {
        query += ` ORDER BY m.last_accessed DESC`;
      } else {
        query += ` ORDER BY m.created_at DESC`;
      }

      const result = await db.query(query, params);
      res.json(result.rows);
    }
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await db.query(
      'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING *',
      [name]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tags', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tags');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/materials/:id/access', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'UPDATE materials SET last_accessed = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating access time:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});