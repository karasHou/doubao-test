import axios from 'axios';

// 创建 axios 实例
const service = axios.create({
  baseURL: 'http://localhost:3005',
  timeout: 10000,
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token 等
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('响应错误:', error);
    return Promise.reject(error);
  },
);

export default service;
