const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDatabase } = require('./models');
const petRoutes = require('./routes/pets');
const vaccinationRoutes = require('./routes/vaccinations');
const checkupRoutes = require('./routes/checkups');
const reminderRoutes = require('./routes/reminders');
const { startReminderScheduler } = require('./services/reminderService');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/pets', petRoutes);
app.use('/api/vaccinations', vaccinationRoutes);
app.use('/api/checkups', checkupRoutes);
app.use('/api/reminders', reminderRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Pet Health API is running' });
});

const startServer = async () => {
  try {
    await initDatabase();
    startReminderScheduler();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();