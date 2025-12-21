require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { Client } = require('@elastic/elasticsearch');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

// PostgreSQL 连接
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'addressbook'
});

// Elasticsearch 连接
const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://elasticsearch:9200'
});

// 初始化数据库
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id UUID PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100),
        company VARCHAR(100),
        job_title VARCHAR(100),
        last_contacted TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS groups (
        id UUID PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_groups (
        contact_id UUID REFERENCES contacts(id),
        group_id UUID REFERENCES groups(id),
        PRIMARY KEY (contact_id, group_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id UUID PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_tags (
        contact_id UUID REFERENCES contacts(id),
        tag_id UUID REFERENCES tags(id),
        PRIMARY KEY (contact_id, tag_id)
      )
    `);

    console.log('Database initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// 初始化 Elasticsearch 索引
async function initElasticsearch() {
  try {
    const indexExists = await esClient.indices.exists({ index: 'contacts' });
    if (!indexExists) {
      await esClient.indices.create({
        index: 'contacts',
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              name: { type: 'text' },
              phone: { type: 'text' },
              email: { type: 'text' },
              company: { type: 'text' },
              job_title: { type: 'text' },
              groups: { type: 'keyword' },
              tags: { type: 'keyword' },
              last_contacted: { type: 'date' },
              created_at: { type: 'date' },
              updated_at: { type: 'date' }
            }
          }
        }
      });
      console.log('Elasticsearch index initialized');
    }
  } catch (error) {
    console.error('Elasticsearch initialization error:', error);
  }
}

// API 路由

// 获取所有联系人
app.get('/api/contacts', async (req, res) => {
  try {
    const { search, group, tag, sort = 'last_contacted' } = req.query;

    if (search) {
      // 使用 Elasticsearch 搜索
      const result = await esClient.search({
        index: 'contacts',
        body: {
          query: {
            multi_match: {
              query: search,
              fields: ['name', 'phone', 'email', 'company', 'job_title']
            }
          },
          sort: sort === 'last_contacted' ? { last_contacted: { order: 'desc' } } : { created_at: { order: 'desc' } }
        }
      });

      res.json(result.hits.hits.map(hit => hit._source));
    } else {
      // 从 PostgreSQL 获取
      const result = await pool.query(`
        SELECT c.*,
               COALESCE(array_remove(array_agg(DISTINCT g.name), NULL), ARRAY[]::text[]) as groups,
               COALESCE(array_remove(array_agg(DISTINCT t.name), NULL), ARRAY[]::text[]) as tags
        FROM contacts c
        LEFT JOIN contact_groups cg ON c.id = cg.contact_id
        LEFT JOIN groups g ON cg.group_id = g.id
        LEFT JOIN contact_tags ct ON c.id = ct.contact_id
        LEFT JOIN tags t ON ct.tag_id = t.id
        GROUP BY c.id
        ORDER BY ${sort === 'last_contacted' ? 'c.last_contacted DESC NULLS LAST, c.created_at DESC' : 'c.created_at DESC'}
      `);

      // 清理数据，移除 null 值
      const cleanedContacts = result.rows.map(contact => ({
        ...contact,
        groups: Array.isArray(contact.groups) ? contact.groups.filter(g => g != null && g !== '') : [],
        tags: Array.isArray(contact.tags) ? contact.tags.filter(t => t != null && t !== '') : []
      }));
      res.json(cleanedContacts);
    }
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// 创建联系人
app.post('/api/contacts', async (req, res) => {
  const { name, phone, email, company, job_title, groups = [], tags = [] } = req.body;
  const id = uuidv4();

  try {
    await pool.query('BEGIN');

    await pool.query(
      'INSERT INTO contacts (id, name, phone, email, company, job_title) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, name, phone, email, company, job_title]
    );

    // 处理分组
    for (const groupName of groups) {
      let groupId = (await pool.query('SELECT id FROM groups WHERE name = $1', [groupName])).rows[0]?.id;
      if (!groupId) {
        groupId = uuidv4();
        await pool.query('INSERT INTO groups (id, name) VALUES ($1, $2)', [groupId, groupName]);
      }
      await pool.query('INSERT INTO contact_groups (contact_id, group_id) VALUES ($1, $2)', [id, groupId]);
    }

    // 处理标签
    for (const tagName of tags) {
      let tagId = (await pool.query('SELECT id FROM tags WHERE name = $1', [tagName])).rows[0]?.id;
      if (!tagId) {
        tagId = uuidv4();
        await pool.query('INSERT INTO tags (id, name) VALUES ($1, $2)', [tagId, tagName]);
      }
      await pool.query('INSERT INTO contact_tags (contact_id, tag_id) VALUES ($1, $2)', [id, tagId]);
    }

    // 更新 Elasticsearch
    const contact = (await pool.query(`
      SELECT c.*,
             COALESCE(array_remove(array_agg(DISTINCT g.name), NULL), ARRAY[]::text[]) as groups,
             COALESCE(array_remove(array_agg(DISTINCT t.name), NULL), ARRAY[]::text[]) as tags
      FROM contacts c
      LEFT JOIN contact_groups cg ON c.id = cg.contact_id
      LEFT JOIN groups g ON cg.group_id = g.id
      LEFT JOIN contact_tags ct ON c.id = ct.contact_id
      LEFT JOIN tags t ON ct.tag_id = t.id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id])).rows[0];

    await esClient.index({
      index: 'contacts',
      id: id,
      document: contact
    });

    await pool.query('COMMIT');
    res.json(contact);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// 批量删除联系人
app.delete('/api/contacts', async (req, res) => {
  const { ids } = req.body;

  try {
    await pool.query('BEGIN');

    await pool.query('DELETE FROM contact_groups WHERE contact_id = ANY($1)', [ids]);
    await pool.query('DELETE FROM contact_tags WHERE contact_id = ANY($1)', [ids]);
    await pool.query('DELETE FROM contacts WHERE id = ANY($1)', [ids]);

    // 从 Elasticsearch 删除
    for (const id of ids) {
      await esClient.delete({
        index: 'contacts',
        id: id
      });
    }

    await pool.query('COMMIT');
    res.json({ message: 'Contacts deleted successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error deleting contacts:', error);
    res.status(500).json({ error: 'Failed to delete contacts' });
  }
});

// 获取单个联系人
app.get('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT c.*,
             COALESCE(array_remove(array_agg(DISTINCT g.name), NULL), ARRAY[]::text[]) as groups,
             COALESCE(array_remove(array_agg(DISTINCT t.name), NULL), ARRAY[]::text[]) as tags
      FROM contacts c
      LEFT JOIN contact_groups cg ON c.id = cg.contact_id
      LEFT JOIN groups g ON cg.group_id = g.id
      LEFT JOIN contact_tags ct ON c.id = ct.contact_id
      LEFT JOIN tags t ON ct.tag_id = t.id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    // 清理数据，移除 null 值
    const cleanedContact = {
      ...result.rows[0],
      groups: Array.isArray(result.rows[0].groups) ? result.rows[0].groups.filter(g => g != null && g !== '') : [],
      tags: Array.isArray(result.rows[0].tags) ? result.rows[0].tags.filter(t => t != null && t !== '') : []
    };
    res.json(cleanedContact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

// 更新单个联系人
app.put('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, company, job_title, groups = [], tags = [] } = req.body;

  try {
    await pool.query('BEGIN');

    await pool.query(`
      UPDATE contacts
      SET name = $1, phone = $2, email = $3, company = $4, job_title = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
    `, [name, phone, email, company, job_title, id]);

    // 更新分组
    await pool.query('DELETE FROM contact_groups WHERE contact_id = $1', [id]);
    for (const groupName of groups) {
      let groupId = (await pool.query('SELECT id FROM groups WHERE name = $1', [groupName])).rows[0]?.id;
      if (!groupId) {
        groupId = uuidv4();
        await pool.query('INSERT INTO groups (id, name) VALUES ($1, $2)', [groupId, groupName]);
      }
      await pool.query('INSERT INTO contact_groups (contact_id, group_id) VALUES ($1, $2)', [id, groupId]);
    }

    // 更新标签
    await pool.query('DELETE FROM contact_tags WHERE contact_id = $1', [id]);
    for (const tagName of tags) {
      let tagId = (await pool.query('SELECT id FROM tags WHERE name = $1', [tagName])).rows[0]?.id;
      if (!tagId) {
        tagId = uuidv4();
        await pool.query('INSERT INTO tags (id, name) VALUES ($1, $2)', [tagId, tagName]);
      }
      await pool.query('INSERT INTO contact_tags (contact_id, tag_id) VALUES ($1, $2)', [id, tagId]);
    }

    // 更新 Elasticsearch
    const contact = (await pool.query(`
      SELECT c.*,
             COALESCE(array_remove(array_agg(DISTINCT g.name), NULL), ARRAY[]::text[]) as groups,
             COALESCE(array_remove(array_agg(DISTINCT t.name), NULL), ARRAY[]::text[]) as tags
      FROM contacts c
      LEFT JOIN contact_groups cg ON c.id = cg.contact_id
      LEFT JOIN groups g ON cg.group_id = g.id
      LEFT JOIN contact_tags ct ON c.id = ct.contact_id
      LEFT JOIN tags t ON ct.tag_id = t.id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id])).rows[0];

    await esClient.index({
      index: 'contacts',
      id: id,
      document: contact
    });

    await pool.query('COMMIT');
    res.json(contact);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// 删除单个联系人
app.delete('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('BEGIN');

    await pool.query('DELETE FROM contact_groups WHERE contact_id = $1', [id]);
    await pool.query('DELETE FROM contact_tags WHERE contact_id = $1', [id]);
    await pool.query('DELETE FROM contacts WHERE id = $1', [id]);

    // 从 Elasticsearch 删除
    await esClient.delete({
      index: 'contacts',
      id: id
    });

    await pool.query('COMMIT');
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// 批量编辑联系人
app.put('/api/contacts/batch', async (req, res) => {
  const { ids, updates } = req.body;

  try {
    await pool.query('BEGIN');

    if (updates.groups || updates.tags) {
      if (updates.groups) {
        // 移除现有分组
        await pool.query('DELETE FROM contact_groups WHERE contact_id = ANY($1)', [ids]);

        // 添加新分组
        for (const contactId of ids) {
          for (const groupName of updates.groups) {
            let groupId = (await pool.query('SELECT id FROM groups WHERE name = $1', [groupName])).rows[0]?.id;
            if (!groupId) {
              groupId = uuidv4();
              await pool.query('INSERT INTO groups (id, name) VALUES ($1, $2)', [groupId, groupName]);
            }
            await pool.query('INSERT INTO contact_groups (contact_id, group_id) VALUES ($1, $2)', [contactId, groupId]);
          }
        }
      }

      if (updates.tags) {
        // 移除现有标签
        await pool.query('DELETE FROM contact_tags WHERE contact_id = ANY($1)', [ids]);

        // 添加新标签
        for (const contactId of ids) {
          for (const tagName of updates.tags) {
            let tagId = (await pool.query('SELECT id FROM tags WHERE name = $1', [tagName])).rows[0]?.id;
            if (!tagId) {
              tagId = uuidv4();
              await pool.query('INSERT INTO tags (id, name) VALUES ($1, $2)', [tagId, tagName]);
            }
            await pool.query('INSERT INTO contact_tags (contact_id, tag_id) VALUES ($1, $2)', [contactId, tagId]);
          }
        }
      }
    }

    // 更新联系人信息
    if (Object.keys(updates).some(key => ['name', 'phone', 'email', 'company', 'job_title', 'last_contacted'].includes(key))) {
      const updateFields = Object.keys(updates)
        .filter(key => ['name', 'phone', 'email', 'company', 'job_title', 'last_contacted'].includes(key))
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      if (updateFields) {
        const updateValues = Object.values(updates).filter((v, i) =>
          ['name', 'phone', 'email', 'company', 'job_title', 'last_contacted'].includes(Object.keys(updates)[i])
        );

        await pool.query(
          `UPDATE contacts SET ${updateFields}, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($1)`,
          [ids, ...updateValues]
        );
      }
    }

    // 更新 Elasticsearch
    for (const contactId of ids) {
      const contact = (await pool.query(`
        SELECT c.*,
               array_agg(DISTINCT g.name) as groups,
               array_agg(DISTINCT t.name) as tags
        FROM contacts c
        LEFT JOIN contact_groups cg ON c.id = cg.contact_id
        LEFT JOIN groups g ON cg.group_id = g.id
        LEFT JOIN contact_tags ct ON c.id = ct.contact_id
        LEFT JOIN tags t ON ct.tag_id = t.id
        WHERE c.id = $1
        GROUP BY c.id
      `, [contactId])).rows[0];

      await esClient.index({
        index: 'contacts',
        id: contactId,
        document: contact
      });
    }

    await pool.query('COMMIT');
    res.json({ message: 'Contacts updated successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error updating contacts:', error);
    res.status(500).json({ error: 'Failed to update contacts' });
  }
});

// 获取所有分组
app.get('/api/groups', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM groups ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// 获取所有标签
app.get('/api/tags', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tags ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// 启动服务器
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initDatabase();
  await initElasticsearch();
});
