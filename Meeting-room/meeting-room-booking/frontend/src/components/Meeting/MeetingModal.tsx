import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from 'react-modal';
import { Meeting, MeetingRoom, User } from '../../types';
import { useUsers } from '../../hooks/useUsers';

Modal.setAppElement('#root');

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    color: #333;
    background: #f8f9fa;
    border-radius: 50%;
  }
`;

const ModalTitle = styled.h2`
  margin: 0 0 25px 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 15px;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 15px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background: #e9ecef;
    border-color: #667eea;
  }

  input[type="checkbox"]:checked + & {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' | 'danger' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;

  background: ${props => {
    switch (props.variant) {
      case 'primary':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'secondary':
        return '#e9ecef';
      case 'danger':
        return '#f87171';
      default:
        return '#667eea';
    }
  }};

  color: ${props => props.variant === 'secondary' ? '#333' : 'white'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => {
      switch (props.variant) {
        case 'primary':
          return '0 10px 25px rgba(102, 126, 234, 0.3)';
        case 'secondary':
          return '0 4px 12px rgba(0, 0, 0, 0.1)';
        case 'danger':
          return '0 10px 25px rgba(248, 113, 113, 0.3)';
        default:
          return '0 10px 25px rgba(102, 126, 234, 0.3)';
      }
    }};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ConflictWarning = styled.div`
  background: #fef3c7;
  border: 2px solid #f59e0b;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  color: #92400e;

  strong {
    display: block;
    margin-bottom: 4px;
  }
`;

interface MeetingModalProps {
  meeting: Meeting | null;
  selectedDate: Date | null;
  rooms: MeetingRoom[];
  onSave: (data: any) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const MeetingModal: React.FC<MeetingModalProps> = ({
  meeting,
  selectedDate,
  rooms,
  onSave,
  onDelete,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    roomId: 0,
    startTime: '',
    endTime: '',
    participants: [] as number[],
  });

  const [conflictWarning, setConflictWarning] = useState(false);
  const { users } = useUsers();

  // 初始化表单数据
  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title,
        description: meeting.description || '',
        roomId: meeting.roomId,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        participants: meeting.Participants.map(p => p.id),
      });
    } else if (selectedDate) {
      // 设置默认时间（1小时会议）
      const start = new Date(selectedDate);
      const end = new Date(selectedDate);
      end.setHours(end.getHours() + 1);

      setFormData({
        title: '',
        description: '',
        roomId: rooms[0]?.id || 0,
        startTime: start.toISOString().slice(0, 16),
        endTime: end.toISOString().slice(0, 16),
        participants: [],
      });
    }
  }, [meeting, selectedDate, rooms]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setConflictWarning(false);
  };

  const handleParticipantsChange = (userId: number, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        participants: [...prev.participants, userId],
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        participants: prev.participants.filter(id => id !== userId),
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 转换参与者数据格式
    const participantsData = formData.participants.map(userId => ({
      userId,
      status: 'invited',
    }));

    onSave({
      ...formData,
      participants: participantsData,
    });
  };

  const handleDeleteClick = () => {
    if (window.confirm('确定要删除这个会议吗？')) {
      onDelete?.();
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton onClick={onClose}>×</CloseButton>
        <ModalTitle>{meeting ? '编辑会议' : '新建会议'}</ModalTitle>

        {conflictWarning && (
          <ConflictWarning>
            <strong>⚠️ 时间冲突警告</strong>
            该时间段已有其他会议，请重新选择时间。
          </ConflictWarning>
        )}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="title">会议标题</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="请输入会议标题"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="roomId">选择会议室</Label>
            <Select
              id="roomId"
              name="roomId"
              value={formData.roomId}
              onChange={handleChange}
              required
            >
              <option value="">请选择会议室</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name} (可容纳 {room.capacity} 人)
                </option>
              ))}
            </Select>
          </FormGroup>

          <div style={{ display: 'flex', gap: '15px' }}>
            <FormGroup style={{ flex: 1 }}>
              <Label htmlFor="startTime">开始时间</Label>
              <Input
                type="datetime-local"
                id="startTime"
                name="startTime"
                value={formData.startTime.slice(0, 16)}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormGroup style={{ flex: 1 }}>
              <Label htmlFor="endTime">结束时间</Label>
              <Input
                type="datetime-local"
                id="endTime"
                name="endTime"
                value={formData.endTime.slice(0, 16)}
                onChange={handleChange}
                required
              />
            </FormGroup>
          </div>

          <FormGroup>
            <Label htmlFor="description">会议描述</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="请输入会议描述（可选）"
            />
          </FormGroup>

          <FormGroup>
            <Label>邀请参与者</Label>
            <CheckboxGroup>
              {users.map(user => (
                <label key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={formData.participants.includes(user.id)}
                    onChange={(e) => handleParticipantsChange(user.id, e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>{user.name} ({user.username})</span>
                </label>
              ))}
            </CheckboxGroup>
          </FormGroup>

          <ButtonGroup>
            {meeting && (
              <Button variant="danger" onClick={handleDeleteClick} disabled={!onDelete}>
                删除
              </Button>
            )}
            <Button variant="secondary" onClick={onClose}>
              取消
            </Button>
            <Button variant="primary" type="submit">
              {meeting ? '更新' : '创建'}
            </Button>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default MeetingModal;