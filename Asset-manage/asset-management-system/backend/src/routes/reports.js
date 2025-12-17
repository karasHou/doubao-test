import express from 'express';
import {
  getAssetStats,
  exportAssets
} from '../controllers/reportController.js';

const router = express.Router();

// 报表路由
router.get('/stats', getAssetStats);
router.get('/assets', exportAssets);

export default router;