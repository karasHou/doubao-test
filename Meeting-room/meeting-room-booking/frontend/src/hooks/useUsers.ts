import { useState, useEffect } from 'react';
import { User } from '../types';
import { userAPI } from '../services/api';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取所有用户
  const fetchUsers = async (search?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await userAPI.getUsers(search);
      setUsers(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '获取用户列表失败';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 获取单个用户
  const fetchUser = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await userAPI.getUser(id);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '获取用户详情失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 创建用户
  const createUser = async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // 注意：这里应该使用用户注册 API，而不是管理员创建用户的 API
      // 但为了保持一致性，我们使用 userAPI.updateUser 的模式
      // 实际项目中应该有专门的管理员 API
      throw new Error('创建用户功能未实现');
    } catch (err: any) {
      const errorMessage = err.message || '创建用户失败';
      throw new Error(errorMessage);
    }
  };

  // 更新用户
  const updateUser = async (id: number, data: Partial<User>) => {
    try {
      const response = await userAPI.updateUser(id, data);
      // 刷新列表
      await fetchUsers();
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '更新用户信息失败';
      throw new Error(errorMessage);
    }
  };

  // 删除用户
  const deleteUser = async (id: number) => {
    try {
      await userAPI.deleteUser(id);
      // 刷新列表
      await fetchUsers();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '删除用户失败';
      throw new Error(errorMessage);
    }
  };

  // 刷新用户列表
  const refreshUsers = () => {
    fetchUsers();
  };

  // 初始加载
  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers,
  };
};