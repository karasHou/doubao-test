import { defineStore } from 'pinia';
import { api } from '../utils/api';

export interface User {
  id: number;
  username: string;
  email: string;
  nickname: string;
  avatar: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  userPermissions: any[];
  userRoles: any[];
  isAuthenticated: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    userPermissions: [],
    userRoles: [],
    isAuthenticated: false,
  }),

  getters: {
    getCurrentUser: (state) => state.user,
    getAccessToken: (state) => state.accessToken,
    getIsAuthenticated: (state) => state.isAuthenticated,
  },

  actions: {
    // 设置认证状态
    setAuthState(user: User, accessToken: string, permissions: any[], roles: any[]) {
      this.user = user;
      this.accessToken = accessToken;
      this.userPermissions = permissions;
      this.userRoles = roles;
      this.isAuthenticated = true;

      // 存储到本地存储
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userPermissions', JSON.stringify(permissions));
      localStorage.setItem('userRoles', JSON.stringify(roles));
    },

    // 清除认证状态
    clearAuthState() {
      this.user = null;
      this.accessToken = null;
      this.userPermissions = [];
      this.userRoles = [];
      this.isAuthenticated = false;

      // 清除本地存储
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userPermissions');
      localStorage.removeItem('userRoles');
    },

    // 登录
    async login(username: string, password: string) {
      try {
        const response = await api.post('/auth/login', { username, password });
        
        const { access_token, user, permissions } = response.data;
        
        // 提取角色信息
        const roles = permissions.roles || [];
        
        // 提取权限信息
        const userPermissions = permissions.permissions || [];
        
        this.setAuthState(user, access_token, userPermissions, roles);
        
        return { success: true, data: response.data };
      } catch (error: any) {
        return { 
          success: false, 
          message: error.response?.data?.message || '登录失败' 
        };
      }
    },

    // 登出
    async logout() {
      try {
        await api.post('/auth/logout');
      } catch (error) {
        // 忽略登出错误
      } finally {
        this.clearAuthState();
      }
    },

    // 从本地存储恢复认证状态
    restoreAuthState() {
      const accessToken = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');
      const userPermissions = localStorage.getItem('userPermissions');
      const userRoles = localStorage.getItem('userRoles');

      if (accessToken && user) {
        this.accessToken = accessToken;
        this.user = JSON.parse(user);
        this.userPermissions = userPermissions ? JSON.parse(userPermissions) : [];
        this.userRoles = userRoles ? JSON.parse(userRoles) : [];
        this.isAuthenticated = true;
      }
    },

    // 获取用户权限
    async getUserPermissions() {
      try {
        const response = await api.get('/auth/permissions');
        this.userPermissions = response.data.permissions || [];
        this.userRoles = response.data.roles || [];
        
        // 更新本地存储
        localStorage.setItem('userPermissions', JSON.stringify(this.userPermissions));
        localStorage.setItem('userRoles', JSON.stringify(this.userRoles));
        
        return response.data;
      } catch (error) {
        console.error('获取用户权限失败:', error);
        return null;
      }
    },
  },
});
