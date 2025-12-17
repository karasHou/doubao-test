import { useState, useEffect } from 'react';
import { MeetingRoom } from '../types';
import { roomAPI } from '../services/api';

export const useRooms = () => {
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取所有会议室
  const fetchRooms = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await roomAPI.getRooms();
      setRooms(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '获取会议室列表失败';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 创建会议室
  const createRoom = async (data: Omit<MeetingRoom, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await roomAPI.createRoom(data);
      // 刷新列表
      await fetchRooms();
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '创建会议室失败';
      throw new Error(errorMessage);
    }
  };

  // 更新会议室
  const updateRoom = async (id: number, data: Partial<MeetingRoom>) => {
    try {
      const response = await roomAPI.updateRoom(id, data);
      // 刷新列表
      await fetchRooms();
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '更新会议室失败';
      throw new Error(errorMessage);
    }
  };

  // 删除会议室
  const deleteRoom = async (id: number) => {
    try {
      await roomAPI.deleteRoom(id);
      // 刷新列表
      await fetchRooms();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '删除会议室失败';
      throw new Error(errorMessage);
    }
  };

  // 刷新会议室列表
  const refreshRooms = () => {
    fetchRooms();
  };

  // 初始加载
  useEffect(() => {
    fetchRooms();
  }, []);

  return {
    rooms,
    loading,
    error,
    fetchRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    refreshRooms,
  };
};