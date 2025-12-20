import express from 'express';
import {
  getParkingLots,
  getParkingLotById,
  getParkingLotAvailability,
  predictParkingAvailability
} from '../controllers/parking';

const router = express.Router();

router.get('/lots', getParkingLots);
router.get('/lots/:id', getParkingLotById);
router.get('/lots/:id/availability', getParkingLotAvailability);
router.get('/lots/:id/predict', predictParkingAvailability);

export default router;