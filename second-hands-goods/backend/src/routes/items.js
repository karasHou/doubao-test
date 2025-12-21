const express = require('express');
const router = express.Router();
const itemModel = require('../models/items');
const valuationService = require('../services/valuation-service');
const cacheService = require('../services/cache-service');

router.get('/', async (req, res) => {
  try {
    // 为了避免复杂的缓存键管理，暂时禁用列表缓存
    // 可以在需要时重新实现
    const items = await itemModel.getAllItems(req.query);

    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const cacheKey = `item:${req.params.id}`;
    const cachedItem = await cacheService.get(cacheKey);

    if (cachedItem) {
      return res.json({ success: true, data: cachedItem });
    }

    const item = await itemModel.getItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: '物品未找到' });
    }

    await cacheService.set(cacheKey, item, 300);
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const itemData = req.body;

    if (itemData.original_price) {
      itemData.estimated_price = await valuationService.estimateItem(itemData);
    }

    const newItem = await itemModel.createItem(itemData);

    await cacheService.clear();

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const itemData = req.body;

    if (itemData.original_price) {
      itemData.estimated_price = await valuationService.estimateItem(itemData);
    }

    const updatedItem = await itemModel.updateItem(req.params.id, itemData);

    if (!updatedItem) {
      return res.status(404).json({ success: false, error: '物品未找到' });
    }

    await cacheService.clear();

    res.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedItem = await itemModel.deleteItem(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ success: false, error: '物品未找到' });
    }

    await cacheService.clear();

    res.json({ success: true, data: deletedItem });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id/price-history', async (req, res) => {
  try {
    const history = await itemModel.getPriceHistory(req.params.id);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;