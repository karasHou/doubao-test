import axios from 'axios';
import { Product, Sku, Cart, PromotionRule, CartStatistics } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 商品相关 API
export const productApi = {
  // 获取所有商品
  getAllProducts: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  // 获取商品详情
  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // 获取 SKU 详情
  getSkuById: async (id: string): Promise<Sku> => {
    const response = await api.get(`/products/sku/${id}`);
    return response.data;
  },

  // 检查库存
  checkStock: async (skuId: string, quantity: number): Promise<{ available: boolean; stock?: number }> => {
    const response = await api.get('/products/stock/check', {
      params: { skuId, quantity },
    });
    return response.data;
  },

  // 获取可用的 SKU 组合
  getAvailableSkuCombinations: async (productId: string) => {
    const response = await api.get(`/products/${productId}/sku-combinations`);
    return response.data;
  },

  // 获取商品属性信息
  getProductAttributes: async (productId: string) => {
    const response = await api.get(`/products/${productId}/attributes`);
    return response.data;
  },

  // 扣减库存
  deductStock: async (skuId: string, quantity: number): Promise<{ success: boolean }> => {
    const response = await api.post('/products/stock/deduct', { skuId, quantity });
    return response.data;
  },

  // 恢复库存
  restoreStock: async (skuId: string, quantity: number): Promise<{ success: boolean }> => {
    const response = await api.post('/products/stock/restore', { skuId, quantity });
    return response.data;
  },
};

// 购物车相关 API
export const cartApi = {
  // 获取购物车
  getCart: async (userId: string): Promise<Cart> => {
    const response = await api.get('/cart', { params: { userId } });
    return response.data;
  },

  // 添加商品到购物车
  addItem: async (userId: string, skuId: string, quantity?: number): Promise<Cart> => {
    const response = await api.post('/cart/items', { userId, skuId, quantity });
    return response.data;
  },

  // 更新购物车项目数量
  updateItemQuantity: async (userId: string, itemId: string, quantity: number): Promise<Cart> => {
    const response = await api.put(`/cart/items/${itemId}`, { userId, quantity });
    return response.data;
  },

  // 移除购物车项目
  removeItem: async (userId: string, itemId: string): Promise<Cart> => {
    const response = await api.delete(`/cart/items/${itemId}`, { params: { userId } });
    return response.data;
  },

  // 清空购物车
  clearCart: async (userId: string): Promise<Cart> => {
    const response = await api.delete('/cart', { params: { userId } });
    return response.data;
  },

  // 应用优惠券
  applyCoupon: async (userId: string, couponId: string): Promise<Cart> => {
    const response = await api.post('/cart/coupons', { userId, couponId });
    return response.data;
  },

  // 移除优惠券
  removeCoupon: async (userId: string, couponId: string): Promise<Cart> => {
    const response = await api.delete(`/cart/coupons/${couponId}`, { params: { userId } });
    return response.data;
  },

  // 获取购物车统计信息
  getCartStatistics: async (userId: string): Promise<CartStatistics> => {
    const response = await api.get('/cart/statistics', { params: { userId } });
    return response.data;
  },
};

// 价格引擎相关 API
export const priceEngineApi = {
  // 计算价格
  calculatePrice: async (cartItems: any[], coupons?: string[]) => {
    const response = await api.post('/price-engine/calculate', { cartItems, coupons });
    return response.data;
  },

  // 获取所有促销规则
  getAllPromotions: async (): Promise<PromotionRule[]> => {
    const response = await api.get('/price-engine/promotions');
    return response.data;
  },

  // 获取优惠券列表
  getCoupons: async (): Promise<PromotionRule[]> => {
    const response = await api.get('/price-engine/coupons');
    return response.data;
  },
};

export default api;
