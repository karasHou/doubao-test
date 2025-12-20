const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const 快递Routes = require('./routes/快递Routes');
const { initDatabase } = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', 快递Routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '服务运行正常' });
});

const startServer = async () => {
  try {
    await initDatabase();
    console.log('数据库连接成功');

    app.listen(PORT, () => {
      console.log(`服务运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('启动服务失败:', error);
    process.exit(1);
  }
};

startServer();
