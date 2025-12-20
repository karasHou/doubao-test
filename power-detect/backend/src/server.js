const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// 数据库连接
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: 5432,
  database: process.env.DB_NAME || 'energy_db',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'password'
});

// 测试数据库连接
async function testDbConnection() {
  try {
    await pool.connect();
    console.log('数据库连接成功');
  } catch (err) {
    console.error('数据库连接失败:', err);
  }
}
testDbConnection();

// API 路由
app.get('/api/devices', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM devices');
    res.json(result.rows);
  } catch (err) {
    console.error('查询设备失败:', err);
    res.status(500).json({ error: '查询设备失败' });
  }
});

app.get('/api/energy/history', async (req, res) => {
  try {
    const { deviceId, start, end } = req.query;
    let query = `
      SELECT time, power, energy
      FROM energy_readings
      WHERE time BETWEEN $1 AND $2
    `;
    let params = [start || new Date(Date.now() - 24 * 60 * 60 * 1000), end || new Date()];

    if (deviceId) {
      query += ' AND device_id = $3';
      params.push(deviceId);
    }

    query += ' ORDER BY time';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('查询能耗历史失败:', err);
    res.status(500).json({ error: '查询能耗历史失败' });
  }
});

app.get('/api/energy/stats/:period', async (req, res) => {
  try {
    const { period } = req.params;
    const { deviceId } = req.query;

    let groupBy;
    switch (period) {
      case 'hour':
        groupBy = 'date_trunc(\'hour\', time)';
        break;
      case 'day':
        groupBy = 'date_trunc(\'day\', time)';
        break;
      case 'week':
        groupBy = 'date_trunc(\'week\', time)';
        break;
      case 'month':
        groupBy = 'date_trunc(\'month\', time)';
        break;
      default:
        groupBy = 'date_trunc(\'hour\', time)';
    }

    let query = `
      SELECT ${groupBy} as period, AVG(power) as avg_power, SUM(energy) as total_energy
      FROM energy_readings
    `;
    let params = [];

    if (deviceId) {
      query += ' WHERE device_id = $1';
      params.push(deviceId);
    }

    query += ` GROUP BY ${groupBy} ORDER BY period`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('查询统计数据失败:', err);
    res.status(500).json({ error: '查询统计数据失败' });
  }
});

app.get('/api/alerts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    console.error('查询异常提醒失败:', err);
    res.status(500).json({ error: '查询异常提醒失败' });
  }
});

// 创建 HTTP 服务器
const server = http.createServer(app);

// WebSocket 服务器
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket 客户端连接');

  ws.on('close', () => {
    console.log('WebSocket 客户端断开连接');
  });
});

// 模拟实时能耗数据
async function simulateRealTimeData() {
  const devices = [1, 2, 3, 4]; // 设备 ID

  setInterval(async () => {
    const timestamp = new Date();

    for (const deviceId of devices) {
      const power = Math.random() * 200 + 50; // 50-250 W
      const energy = power / 3600; // kWh

      try {
        await pool.query(
          'INSERT INTO energy_readings (time, device_id, power, energy) VALUES ($1, $2, $3, $4)',
          [timestamp, deviceId, power, energy]
        );

        // 异常检测：功率超过 200W 发送警报
        if (power > 200) {
          await pool.query(
            'INSERT INTO alerts (device_id, type, message, level) VALUES ($1, $2, $3, $4)',
            [deviceId, 'high_power', `设备 ${deviceId} 功率异常: ${power.toFixed(2)}W`, 'warning']
          );

          // 发送异常提醒到 WebSocket
          const alertData = {
            deviceId,
            type: 'high_power',
            message: `设备 ${deviceId} 功率异常: ${power.toFixed(2)}W`,
            level: 'warning',
            timestamp
          };
          broadcastWebSocketMessage({ type: 'alert', data: alertData });
        }

        // 发送实时数据到 WebSocket
        const realTimeData = {
          deviceId,
          time: timestamp,
          power,
          energy
        };
        broadcastWebSocketMessage({ type: 'energy-update', data: realTimeData });

      } catch (err) {
        console.error('插入数据失败:', err);
      }
    }
  }, 5000); // 每 5 秒生成一次数据
}

function broadcastWebSocketMessage(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// 启动服务器
const PORT = process.env.PORT || 3005;
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  simulateRealTimeData();
});
