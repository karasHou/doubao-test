const express = require('express');
const router = express.Router();
const itemModel = require('../models/items');
const cacheService = require('../services/cache-service');

router.get('/', async (req, res) => {
  try {
    const cacheKey = 'categories';
    const cachedCategories = await cacheService.get(cacheKey);

    if (cachedCategories) {
      return res.json({ success: true, data: cachedCategories });
    }

    const categories = await itemModel.getCategories();
    await cacheService.set(cacheKey, categories, 3600);

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;