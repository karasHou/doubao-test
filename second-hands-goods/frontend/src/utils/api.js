import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default {
  items: {
    getAll: (params) => api.get('/items', { params }),
    get: (id) => api.get(`/items/${id}`),
    create: (data) => api.post('/items', data),
    update: (id, data) => api.put(`/items/${id}`, data),
    delete: (id) => api.delete(`/items/${id}`),
    getPriceHistory: (id) => api.get(`/items/${id}/price-history`)
  },
  categories: {
    getAll: () => api.get('/categories')
  }
}