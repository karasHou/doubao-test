import Asset from '../models/Asset.js';
import Joi from 'joi';

// 验证资产数据
const assetSchema = Joi.object({
  asset_number: Joi.string().required().max(50),
  name: Joi.string().required().max(100),
  category: Joi.string().required().valid('office_equipment', 'electronic_equipment', 'furniture_appliances', 'vehicle_equipment', 'other'),
  status: Joi.string().valid('in_stock', 'in_use', 'maintenance', 'discarded'),
  user: Joi.string().max(100),
  department: Joi.string().max(100),
  purchase_date: Joi.date().iso(),
  price: Joi.number().required().min(0),
  supplier: Joi.string().max(100),
  description: Joi.string()
});

// 验证领用数据
const transferSchema = Joi.object({
  user: Joi.string().required().max(100),
  department: Joi.string().required().max(100),
  transfer_date: Joi.date().iso().required(),
  reason: Joi.string()
});

// 验证归还数据
const returnSchema = Joi.object({
  return_date: Joi.date().iso().required(),
  condition: Joi.string().required().valid('good', 'minor_damage', 'major_damage', 'unusable'),
  notes: Joi.string()
});

// 获取资产列表
export const getAssets = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '', status = '' } = req.query;

    const assets = await Asset.getAll({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      search,
      status
    });

    res.json({
      success: true,
      data: assets.data,
      total: assets.total
    });
  } catch (error) {
    console.error('获取资产列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取资产列表失败',
      error: error.message
    });
  }
};

// 获取单个资产
export const getAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await Asset.getById(id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: '资产不存在'
      });
    }

    res.json({
      success: true,
      data: asset
    });
  } catch (error) {
    console.error('获取资产失败:', error);
    res.status(500).json({
      success: false,
      message: '获取资产失败',
      error: error.message
    });
  }
};

// 创建资产
export const createAsset = async (req, res) => {
  try {
    // 验证数据
    const { error, value } = assetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        error: error.details[0].message
      });
    }

    const asset = await Asset.create(value);

    res.status(201).json({
      success: true,
      message: '资产创建成功',
      data: asset
    });
  } catch (error) {
    console.error('创建资产失败:', error);
    res.status(500).json({
      success: false,
      message: '创建资产失败',
      error: error.message
    });
  }
};

// 更新资产
export const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;

    // 验证数据
    const { error, value } = assetSchema.validate(req.body, { allowUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        error: error.details[0].message
      });
    }

    const asset = await Asset.update(id, value);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: '资产不存在'
      });
    }

    res.json({
      success: true,
      message: '资产更新成功',
      data: asset
    });
  } catch (error) {
    console.error('更新资产失败:', error);
    res.status(500).json({
      success: false,
      message: '更新资产失败',
      error: error.message
    });
  }
};

// 删除资产
export const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await Asset.delete(id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: '资产不存在'
      });
    }

    res.json({
      success: true,
      message: '资产删除成功',
      data: asset
    });
  } catch (error) {
    console.error('删除资产失败:', error);
    res.status(500).json({
      success: false,
      message: '删除资产失败',
      error: error.message
    });
  }
};

// 领用资产
export const transferAsset = async (req, res) => {
  try {
    const { id } = req.params;

    // 验证数据
    const { error, value } = transferSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        error: error.details[0].message
      });
    }

    const asset = await Asset.transfer(id, value);

    res.json({
      success: true,
      message: '资产领用成功',
      data: asset
    });
  } catch (error) {
    console.error('领用资产失败:', error);
    res.status(500).json({
      success: false,
      message: '领用资产失败',
      error: error.message
    });
  }
};

// 归还资产
export const returnAsset = async (req, res) => {
  try {
    const { id } = req.params;

    // 验证数据
    const { error, value } = returnSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        error: error.details[0].message
      });
    }

    const asset = await Asset.returnAsset(id, value);

    res.json({
      success: true,
      message: '资产归还成功',
      data: asset
    });
  } catch (error) {
    console.error('归还资产失败:', error);
    res.status(500).json({
      success: false,
      message: '归还资产失败',
      error: error.message
    });
  }
};