import axios from 'axios';
import { 快递 } from '../types/快递';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3007/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const 快递API = {
  获取所有快递: async (): Promise<快递[]> => {
    const response = await api.get('/packages');
    return response.data;
  },

  创建快递: async (单号: string, 快递公司?: string): Promise<{ message: string; data: 快递 }> => {
    const response = await api.post('/packages', { 单号, 快递公司 });
    return response.data;
  },

  获取快递详情: async (单号: string): Promise<快递> => {
    const response = await api.get(`/packages/${单号}`);
    return response.data;
  },

  删除快递: async (id: number): Promise<void> => {
    await api.delete(`/packages/${id}`);
  },

  手动同步物流: async (单号: string): Promise<void> => {
    await api.post(`/packages/${单号}/sync`);
  },
};

export default api;
