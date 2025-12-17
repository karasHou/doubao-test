import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    return Promise.reject(error)
  }
)

// 资产相关 API
export const assetAPI = {
  // 获取资产列表
  getAssets: (params = {}) => api.get('/assets', { params }),

  // 获取单个资产
  getAsset: (id) => api.get(`/assets/${id}`),

  // 新增资产
  addAsset: (data) => api.post('/assets', data),

  // 更新资产
  updateAsset: (id, data) => api.put(`/assets/${id}`, data),

  // 删除资产
  deleteAsset: (id) => api.delete(`/assets/${id}`),

  // 领用资产
  transferAsset: (id, data) => api.post(`/assets/${id}/transfer`, data),

  // 归还资产
  returnAsset: (id, data) => api.post(`/assets/${id}/return`, data)
}

// 报表相关 API
export const reportAPI = {
  // 导出资产报表
  exportAssets: (params = {}) => api.get('/report/assets', {
    params,
    responseType: 'blob'
  }),

  // 获取资产统计
  getAssetStats: () => api.get('/report/stats')
}

export default api