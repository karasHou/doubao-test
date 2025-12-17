// 用户类型定义
export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

// 会议室类型定义
export interface MeetingRoom {
  id: number;
  name: string;
  capacity: number;
  equipment: string[];
  location: string;
  status: 'available' | 'maintenance' | 'occupied';
  createdAt: string;
  updatedAt: string;
}

// 会议参与者类型定义
export interface MeetingParticipant {
  userId: number;
  status: 'invited' | 'accepted' | 'rejected';
  user?: User;
}

// 会议类型定义
export interface Meeting {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  roomId: number;
  organizerId: number;
  createdAt: string;
  updatedAt: string;
  Organizer: User;
  Room: MeetingRoom;
  Participants: (User & { MeetingParticipant: { status: string } })[];
}

// 登录请求类型
export interface LoginRequest {
  username: string;
  password: string;
}

// 注册请求类型
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  name: string;
}

// 创建会议请求类型
export interface CreateMeetingRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  roomId: number;
  organizerId: number;
  participants?: MeetingParticipant[];
}

// WebSocket 消息类型
export interface WebSocketMessage {
  type: string;
  data: any;
}