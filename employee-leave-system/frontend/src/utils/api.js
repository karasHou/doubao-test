import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    return config
  },
  error => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('API Response Error:', error)
    return Promise.reject(error)
  }
)

// 员工相关 API
export const employeeAPI = {
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  getManager: (id) => api.get(`/employees/${id}/manager`),
  create: (data) => api.post('/employees', data)
}

// 假期类型相关 API
export const leaveTypeAPI = {
  getAll: () => api.get('/leave-types'),
  getById: (id) => api.get(`/leave-types/${id}`),
  create: (data) => api.post('/leave-types', data)
}

// 请假申请相关 API
export const leaveApplicationAPI = {
  getAll: (params = {}) => api.get('/leave-applications', { params }),
  getById: (id) => api.get(`/leave-applications/${id}`),
  create: (data) => api.post('/leave-applications', data),
  withdraw: (id) => api.patch(`/leave-applications/${id}/withdraw`)
}

// 审批相关 API
export const approvalAPI = {
  approve: (applicationId, data) => api.post(`/approvals/${applicationId}`, data),
  getHistory: (applicationId) => api.get(`/approvals/${applicationId}/history`),
  getMyPending: (approverId) => api.get(`/approvals/my-pending/${approverId}`)
}

export default api
