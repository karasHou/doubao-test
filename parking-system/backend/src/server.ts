import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import parkingRoutes from './routes/parking';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/parking', parkingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Parking System API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});