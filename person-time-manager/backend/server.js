const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const WebSocket = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'time_manager'
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  clients.add(ws);

  ws.on('message', (message) => {
    console.log('Received message:', message.toString());
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    clients.delete(ws);
  });
});

const broadcast = (message) => {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*,
             json_agg(td) as dependencies
      FROM tasks t
      LEFT JOIN task_dependencies td ON t.id = td.task_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { title, description, status, priority, due_date, parent_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (id, title, description, status, priority, due_date, parent_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [uuidv4(), title, description || null, status || 'pending', priority || 'medium', due_date || null, parent_id || null]
    );
    const newTask = result.rows[0];
    broadcast({ type: 'task-created', task: newTask });
    res.json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, due_date, parent_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description), status = COALESCE($3, status), priority = COALESCE($4, priority), due_date = COALESCE($5, due_date), parent_id = COALESCE($6, parent_id), updated_at = NOW() WHERE id = $7 RETURNING *',
      [title, description, status, priority, due_date, parent_id, id]
    );
    const updatedTask = result.rows[0];
    broadcast({ type: 'task-updated', task: updatedTask });
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM task_dependencies WHERE task_id = $1 OR depends_on_task_id = $1', [id]);
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    const deletedTask = result.rows[0];
    broadcast({ type: 'task-deleted', taskId: id });
    res.json(deletedTask);
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks/:id/dependencies', async (req, res) => {
  const { id } = req.params;
  const { depends_on_task_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO task_dependencies (id, task_id, depends_on_task_id) VALUES ($1, $2, $3) RETURNING *',
      [uuidv4(), id, depends_on_task_id]
    );
    const dependency = result.rows[0];
    broadcast({ type: 'dependency-added', dependency });
    res.json(dependency);
  } catch (error) {
    console.error('Error adding dependency:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/task-dependencies/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM task_dependencies WHERE id = $1 RETURNING *', [id]);
    const deletedDependency = result.rows[0];
    broadcast({ type: 'dependency-removed', dependencyId: id });
    res.json(deletedDependency);
  } catch (error) {
    console.error('Error removing dependency:', error);
    res.status(500).json({ error: error.message });
  }
});

const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        priority VARCHAR(50) DEFAULT 'medium',
        due_date TIMESTAMP,
        parent_id UUID REFERENCES tasks(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS task_dependencies (
        id UUID PRIMARY KEY,
        task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
        depends_on_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(task_id, depends_on_task_id)
      )
    `);

    console.log('Database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

initializeDatabase();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
