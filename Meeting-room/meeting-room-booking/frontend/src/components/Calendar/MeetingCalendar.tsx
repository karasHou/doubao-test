import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Meeting, MeetingRoom } from '../../types';
import { useMeetings } from '../../hooks/useMeetings';
import { useRooms } from '../../hooks/useRooms';
import MeetingModal from '../Meeting/MeetingModal';
import socketService from '../../services/socket';

const CalendarContainer = styled.div`
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #333;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const ViewToggle = styled.div`
  display: flex;
  background: #f1f3f4;
  border-radius: 8px;
  padding: 4px;
`;

const ViewButton = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  border: none;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#667eea' : '#5f6368'};
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'};

  &:hover {
    background: ${props => props.active ? 'white' : '#e8eaed'};
  }
`;

const RoomSelector = styled.select`
  padding: 8px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const AddButton = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CalendarWrapper = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .fc {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .fc-toolbar-title {
    font-size: 18px !important;
    font-weight: 600 !important;
  }

  .fc-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    border: none !important;
    border-radius: 6px !important;
    transition: all 0.3s ease !important;
  }

  .fc-button:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
  }

  .fc-daygrid-day:hover {
    background: #f8f9fa;
    cursor: pointer;
  }

  .fc-timegrid-slot:hover {
    background: #f8f9fa;
    cursor: pointer;
  }

  .fc-event {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .fc-event:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`;

const Notification = styled.div<{ type: 'success' | 'error' | 'info' }>`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  background: ${props => {
    switch (props.type) {
      case 'success':
        return '#4ade80';
      case 'error':
        return '#f87171';
      case 'info':
        return '#60a5fa';
      default:
        return '#60a5fa';
    }
  }};
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transition: all 0.3s ease;
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const MeetingCalendar: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek'>('timeGridWeek');
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const { meetings, loading, createMeeting, updateMeeting, deleteMeeting } = useMeetings(undefined, selectedRoom || undefined);
  const { rooms } = useRooms();

  // 连接 WebSocket
  useEffect(() => {
    socketService.connect();

    // 监听会议相关事件
    socketService.on('meeting:created', (meeting) => {
      showNotification(`新会议: ${meeting.title}`, 'info');
    });

    socketService.on('meeting:cancelled', (meeting) => {
      showNotification(`会议已取消: ${meeting.title}`, 'info');
    });

    socketService.on('meeting:updated', (meeting) => {
      showNotification(`会议已更新: ${meeting.title}`, 'info');
    });

    socketService.on('meeting:invitation', (meeting) => {
      showNotification(`您收到新会议邀请: ${meeting.title}`, 'success');
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(selectInfo.start);
    setSelectedMeeting(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const meeting = meetings.find(m => m.id === clickInfo.event.id);
    if (meeting) {
      setSelectedMeeting(meeting);
      setSelectedDate(null);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMeeting(null);
    setSelectedDate(null);
  };

  const handleMeetingSave = async (meetingData: any) => {
    try {
      if (selectedMeeting) {
        await updateMeeting(selectedMeeting.id, meetingData);
        showNotification('会议更新成功', 'success');
      } else {
        await createMeeting(meetingData);
        showNotification('会议创建成功', 'success');
      }
      handleModalClose();
    } catch (error: any) {
      showNotification(error.message || '操作失败', 'error');
    }
  };

  const handleMeetingDelete = async () => {
    if (!selectedMeeting) return;

    try {
      await deleteMeeting(selectedMeeting.id);
      showNotification('会议删除成功', 'success');
      handleModalClose();
    } catch (error: any) {
      showNotification(error.message || '删除失败', 'error');
    }
  };

  // 转换会议数据为 FullCalendar 事件格式
  const events = meetings.map(meeting => ({
    id: meeting.id.toString(),
    title: meeting.title,
    start: meeting.startTime,
    end: meeting.endTime,
    extendedProps: {
      meeting,
    },
  }));

  return (
    <CalendarContainer>
      <Header>
        <Title>会议预约系统</Title>
        <Controls>
          <ViewToggle>
            <ViewButton
              active={currentView === 'timeGridWeek'}
              onClick={() => setCurrentView('timeGridWeek')}
            >
              周视图
            </ViewButton>
            <ViewButton
              active={currentView === 'dayGridMonth'}
              onClick={() => setCurrentView('dayGridMonth')}
            >
              月视图
            </ViewButton>
          </ViewToggle>
          <RoomSelector
            value={selectedRoom || ''}
            onChange={(e) => setSelectedRoom(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">所有会议室</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </RoomSelector>
          <AddButton onClick={() => { setSelectedMeeting(null); setSelectedDate(null); setIsModalOpen(true); }}>
            + 新建会议
          </AddButton>
        </Controls>
      </Header>

      <CalendarWrapper>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={currentView}
          views={{
            timeGridWeek: {
              slotMinTime: '08:00:00',
              slotMaxTime: '19:00:00',
            },
          }}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: '',
          }}
          events={events}
          dateClick={handleDateSelect}
          eventClick={handleEventClick}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
        />
      </CalendarWrapper>

      {isModalOpen && (
        <MeetingModal
          meeting={selectedMeeting}
          selectedDate={selectedDate}
          rooms={rooms}
          onSave={handleMeetingSave}
          onDelete={handleMeetingDelete}
          onClose={handleModalClose}
        />
      )}

      {notification && (
        <Notification type={notification.type}>
          {notification.message}
        </Notification>
      )}
    </CalendarContainer>
  );
};

export default MeetingCalendar;