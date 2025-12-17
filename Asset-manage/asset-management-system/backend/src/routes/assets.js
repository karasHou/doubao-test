import express from 'express';
import {
  getAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,
  transferAsset,
  returnAsset
} from '../controllers/assetController.js';

const router = express.Router();

// 资产路由
router.get('/', getAssets);
router.get('/:id', getAsset);
router.post('/', createAsset);
router.put('/:id', updateAsset);
router.delete('/:id', deleteAsset);

// 资产领用和归还
router.post('/:id/transfer', transferAsset);
router.post('/:id/return', returnAsset);

export default router;