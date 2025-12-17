import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  // 连接到 WebSocket 服务器
  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 60000,
    });

    // 设置事件监听器
    this.socket.on('connect', () => {
      console.log('WebSocket 连接成功');
      this.emitListeners('connect', null);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket 断开连接');
      this.emitListeners('disconnect', null);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket 连接错误:', error);
      this.emitListeners('connect_error', error);
    });

    // 会议相关事件
    this.socket.on('meeting:created', (meeting) => {
      console.log('新会议创建:', meeting);
      this.emitListeners('meeting:created', meeting);
    });

    this.socket.on('meeting:cancelled', (meeting) => {
      console.log('会议取消:', meeting);
      this.emitListeners('meeting:cancelled', meeting);
    });

    this.socket.on('meeting:updated', (meeting) => {
      console.log('会议更新:', meeting);
      this.emitListeners('meeting:updated', meeting);
    });

    this.socket.on('meeting:invitation', (meeting) => {
      console.log('收到会议邀请:', meeting);
      this.emitListeners('meeting:invitation', meeting);
    });
  }

  // 断开连接
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // 检查连接状态
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // 用户登录
  userLogin(userId: number): void {
    if (this.socket) {
      this.socket.emit('user:login', userId);
    }
  }

  // 加入会议室频道
  joinRoom(roomId: number): void {
    if (this.socket) {
      this.socket.emit('room:join', roomId);
    }
  }

  // 检查会议冲突
  checkMeetingConflict(
    meetingData: { roomId: number; startTime: string; endTime: string; excludeMeetingId?: number },
    callback: (result: { hasConflict: boolean; conflicts: any[] }) => void
  ): void {
    if (this.socket) {
      this.socket.emit('meeting:check-conflict', meetingData, callback);
    }
  }

  // 触发会议创建事件
  emitMeetingCreated(meeting: any): void {
    if (this.socket) {
      this.socket.emit('meeting:created', meeting);
    }
  }

  // 触发会议取消事件
  emitMeetingCancelled(meeting: any): void {
    if (this.socket) {
      this.socket.emit('meeting:cancelled', meeting);
    }
  }

  // 触发会议更新事件
  emitMeetingUpdated(meeting: any): void {
    if (this.socket) {
      this.socket.emit('meeting:updated', meeting);
    }
  }

  // 添加事件监听器
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  // 移除事件监听器
  off(event: string, callback: (data: any) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  // 触发所有监听器
  private emitListeners(event: string, data: any): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`事件监听器执行错误 [${event}]:`, error);
      }
    });
  }
}

// 创建单例实例
const socketService = new SocketService();

export default socketService;