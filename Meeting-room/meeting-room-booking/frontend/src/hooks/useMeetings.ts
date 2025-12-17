import { useState, useEffect } from 'react';
import { Meeting, CreateMeetingRequest } from '../types';
import { meetingAPI } from '../services/api';
import socketService from '../services/socket';

export const useMeetings = (userId?: number, roomId?: number) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取所有会议
  const fetchMeetings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await meetingAPI.getMeetings({ userId, roomId });
      setMeetings(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '获取会议列表失败';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 创建会议
  const createMeeting = async (data: CreateMeetingRequest) => {
    try {
      const response = await meetingAPI.createMeeting(data);

      // 触发 WebSocket 事件
      socketService.emitMeetingCreated(response.data.meeting);

      // 刷新列表
      await fetchMeetings();
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '创建会议失败';
      throw new Error(errorMessage);
    }
  };

  // 更新会议
  const updateMeeting = async (id: number, data: Partial<CreateMeetingRequest & { status?: string }>) => {
    try {
      const response = await meetingAPI.updateMeeting(id, data);

      // 触发 WebSocket 事件
      socketService.emitMeetingUpdated(response.data.meeting);

      // 刷新列表
      await fetchMeetings();
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '更新会议失败';
      throw new Error(errorMessage);
    }
  };

  // 删除会议
  const deleteMeeting = async (id: number) => {
    try {
      // 获取会议信息用于 WebSocket 通知
      const meetingResponse = await meetingAPI.getMeeting(id);

      await meetingAPI.deleteMeeting(id);

      // 触发 WebSocket 事件
      socketService.emitMeetingCancelled(meetingResponse.data);

      // 刷新列表
      await fetchMeetings();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '删除会议失败';
      throw new Error(errorMessage);
    }
  };

  // 更新参与者状态
  const updateParticipantStatus = async (meetingId: number, userId: number, status: 'invited' | 'accepted' | 'rejected') => {
    try {
      const response = await meetingAPI.updateParticipantStatus(meetingId, userId, status);

      // 刷新列表
      await fetchMeetings();
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '更新参与者状态失败';
      throw new Error(errorMessage);
    }
  };

  // 检查会议冲突
  const checkConflict = async (
    roomId: number,
    startTime: string,
    endTime: string,
    excludeMeetingId?: number
  ): Promise<{ hasConflict: boolean; conflicts: any[] }> => {
    return new Promise((resolve) => {
      socketService.checkMeetingConflict(
        { roomId, startTime, endTime, excludeMeetingId },
        (result) => {
          resolve(result);
        }
      );
    });
  };

  // 刷新会议列表
  const refreshMeetings = () => {
    fetchMeetings();
  };

  // WebSocket 事件监听器
  useEffect(() => {
    // 监听新会议创建
    socketService.on('meeting:created', () => {
      fetchMeetings();
    });

    // 监听会议取消
    socketService.on('meeting:cancelled', () => {
      fetchMeetings();
    });

    // 监听会议更新
    socketService.on('meeting:updated', () => {
      fetchMeetings();
    });

    // 清理函数
    return () => {
      socketService.off('meeting:created', fetchMeetings);
      socketService.off('meeting:cancelled', fetchMeetings);
      socketService.off('meeting:updated', fetchMeetings);
    };
  }, []);

  // 初始加载
  useEffect(() => {
    fetchMeetings();
  }, [userId, roomId]);

  return {
    meetings,
    loading,
    error,
    fetchMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    updateParticipantStatus,
    checkConflict,
    refreshMeetings,
  };
};