import axios from 'axios';
import { User, MeetingRoom, Meeting, LoginRequest, RegisterRequest, CreateMeetingRequest, MeetingParticipant } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 设置请求拦截器，自动添加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 认证相关 API
export const authAPI = {
  login: (data: LoginRequest) => api.post('/auth/login', data),
  register: (data: RegisterRequest) => api.post('/auth/register', data),
};

// 用户相关 API
export const userAPI = {
  getUsers: (search?: string) => api.get(`/users?${search ? `search=${search}` : ''}`),
  getUser: (id: number) => api.get(`/users/${id}`),
  updateUser: (id: number, data: Partial<User>) => api.put(`/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/users/${id}`),
};

// 会议室相关 API
export const roomAPI = {
  getRooms: () => api.get('/rooms'),
  getRoom: (id: number) => api.get(`/rooms/${id}`),
  createRoom: (data: Omit<MeetingRoom, 'id' | 'createdAt' | 'updatedAt'>) => api.post('/rooms', data),
  updateRoom: (id: number, data: Partial<MeetingRoom>) => api.put(`/rooms/${id}`, data),
  deleteRoom: (id: number) => api.delete(`/rooms/${id}`),
};

// 会议相关 API
export const meetingAPI = {
  getMeetings: (params?: { userId?: number; roomId?: number; startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.userId) searchParams.append('userId', params.userId.toString());
    if (params?.roomId) searchParams.append('roomId', params.roomId.toString());
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    return api.get(`/meetings?${searchParams.toString()}`);
  },
  getMeeting: (id: number) => api.get(`/meetings/${id}`),
  createMeeting: (data: CreateMeetingRequest) => api.post('/meetings', data),
  updateMeeting: (id: number, data: Partial<CreateMeetingRequest & { status?: string }>) => api.put(`/meetings/${id}`, data),
  deleteMeeting: (id: number) => api.delete(`/meetings/${id}`),
  updateParticipantStatus: (meetingId: number, userId: number, status: 'invited' | 'accepted' | 'rejected') =>
    api.put(`/meetings/${meetingId}/participants/${userId}`, { status }),
};

export default api;