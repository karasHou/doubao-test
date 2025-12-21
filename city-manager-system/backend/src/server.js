const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const sequelize = new Sequelize(
  process.env.DB_NAME || 'city_facilities',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432
  }
);

const Facility = require('./models/Facility')(sequelize);

sequelize.sync({ force: true }).then(() => {
  console.log('Database synchronized');
  require('./data/seed')(Facility);
});

const facilitiesRoutes = require('./routes/facilities')(Facility);
app.use('/api/facilities', facilitiesRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
