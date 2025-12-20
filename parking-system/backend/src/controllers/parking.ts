import { Request, Response } from 'express';
import { getParkingLots as getParkingLotsFromDB, getParkingLotById as getParkingLotFromDB } from '../models/parking';
import { predictAvailability } from '../services/prediction';
import { cacheData, getCachedData } from '../services/cache';

export const getParkingLots = async (req: Request, res: Response) => {
  try {
    const { price, distance } = req.query;
    const cachedData = await getCachedData('parking_lots');

    if (cachedData) {
      console.log('Using cached parking lots data');
      return res.json(cachedData);
    }

    const parkingLots = await getParkingLotsFromDB();
    await cacheData('parking_lots', parkingLots, 60);

    res.json(parkingLots);
  } catch (error) {
    console.error('Error fetching parking lots:', error);
    res.status(500).json({ error: 'Failed to fetch parking lots' });
  }
};

export const getParkingLotById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parkingLot = await getParkingLotFromDB(parseInt(id));
    if (!parkingLot) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }
    res.json(parkingLot);
  } catch (error) {
    console.error('Error fetching parking lot:', error);
    res.status(500).json({ error: 'Failed to fetch parking lot' });
  }
};

export const getParkingLotAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cachedData = await getCachedData(`availability_${id}`);

    if (cachedData) {
      console.log('Using cached availability data for parking lot', id);
      return res.json(cachedData);
    }

    const parkingLot = await getParkingLotFromDB(parseInt(id));
    if (!parkingLot) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    const availability = {
      parkingLotId: parkingLot.id,
      totalSpots: parkingLot.totalSpots,
      availableSpots: parkingLot.availableSpots,
      timestamp: new Date()
    };

    await cacheData(`availability_${id}`, availability, 30);

    res.json(availability);
  } catch (error) {
    console.error('Error fetching parking availability:', error);
    res.status(500).json({ error: 'Failed to fetch parking availability' });
  }
};

export const predictParkingAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { hour } = req.query;

    const cachedData = await getCachedData(`prediction_${id}_${hour}`);
    if (cachedData) {
      console.log('Using cached prediction data for parking lot', id);
      return res.json(cachedData);
    }

    const prediction = await predictAvailability(parseInt(id), hour ? parseInt(hour.toString()) : new Date().getHours());
    await cacheData(`prediction_${id}_${hour}`, prediction, 60);

    res.json(prediction);
  } catch (error) {
    console.error('Error predicting parking availability:', error);
    res.status(500).json({ error: 'Failed to predict parking availability' });
  }
};