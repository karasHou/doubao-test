const express = require('express');

module.exports = (Facility) => {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const {
        type,
        latitude,
        longitude,
        sort = 'distance',
        rating
      } = req.query;

      let whereConditions = {};

      if (type) {
        whereConditions.type = type;
      }

      if (rating) {
        whereConditions.rating = { [require('sequelize').Op.gte]: parseFloat(rating) };
      }

      const facilities = await Facility.findAll({ where: whereConditions });

      let processedFacilities = facilities.map(facility => {
        const facilityData = facility.toJSON();
        if (latitude && longitude) {
          facilityData.distance = facility.calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude)
          );
        }
        return facilityData;
      });

      if (sort === 'distance' && latitude && longitude) {
        processedFacilities.sort((a, b) => a.distance - b.distance);
      } else if (sort === 'rating') {
        processedFacilities.sort((a, b) => b.rating - a.rating);
      }

      res.json({
        success: true,
        data: processedFacilities,
        count: processedFacilities.length
      });
    } catch (error) {
      console.error('Error fetching facilities:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch facilities'
      });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const facility = await Facility.findByPk(req.params.id);
      if (!facility) {
        return res.status(404).json({
          success: false,
          message: 'Facility not found'
        });
      }
      res.json({
        success: true,
        data: facility.toJSON()
      });
    } catch (error) {
      console.error('Error fetching facility:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch facility'
      });
    }
  });

  return router;
};
