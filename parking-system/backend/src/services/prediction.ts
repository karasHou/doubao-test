import { getParkingLotById } from '../models/parking';

export const predictAvailability = async (parkingLotId: number, hour: number): Promise<any> => {
  const parkingLot = await getParkingLotById(parkingLotId);

  if (!parkingLot) {
    throw new Error('Parking lot not found');
  }

  let occupancyRate = 0.5;

  if (hour >= 8 && hour <= 10) {
    occupancyRate = 0.85;
  } else if (hour >= 17 && hour <= 19) {
    occupancyRate = 0.9;
  } else if (hour >= 12 && hour <= 13) {
    occupancyRate = 0.7;
  } else {
    occupancyRate = 0.3;
  }

  const predictedAvailable = Math.max(0, Math.round(parkingLot.totalSpots * (1 - occupancyRate)));

  return {
    parkingLotId,
    predictedAvailableSpots: predictedAvailable,
    predictionHour: hour,
    timestamp: new Date(),
    confidence: 0.85
  };
};