import axios from 'axios';
import ResourceTypes from '../types/resource';

// 解构所有类型
const { ApiResponse, QueryResourcesParams, ResourceQueryResult, Resource } = ResourceTypes;

/**
 * API 基础 URL
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003/api';

/**
 * 创建 Axios 实例
 */
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 资源点相关 API
 */
export const resourceApi = {
  /**
   * 查询资源点列表
   */
  async queryResources(params: QueryResourcesParams): Promise<{ data: Resource[]; total: number }> {
    try {
      const response = await api.get<ApiResponse<Resource[]>>('/resources', { params });

      return {
        data: response.data.data,
        total: response.data.total || 0,
      };
    } catch (error) {
      console.error('查询资源点失败:', error);
      throw error;
    }
  },

  /**
   * 根据 ID 查询单个资源点
   */
  async getResourceById(id: number): Promise<Resource> {
    try {
      const response = await api.get<ApiResponse<Resource>>(`/resources/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`查询资源点 ${id} 失败:`, error);
      throw error;
    }
  },
};

/**
 * 导出所有 API
 */
export default {
  resource: resourceApi,
};
