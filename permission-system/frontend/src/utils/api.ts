import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../store/auth';

// 创建 Axios 实例
const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
instance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const authStore = useAuthStore();
    
    // 如果有访问令牌，添加到请求头
    if (authStore.accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }
    
    return config as any;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    const authStore = useAuthStore();
    
    // 处理 401 未授权错误
    if (error.response?.status === 401) {
      // 清除认证状态
      authStore.clearAuthState();
      
      // 跳转到登录页
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// 导出 API 请求方法
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => 
    instance.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    instance.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    instance.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    instance.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => 
    instance.delete<T>(url, config),
};

export default instance;
