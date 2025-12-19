import React, { useState, useEffect } from 'react';
import TaskManager from './components/TaskManager';
import ViewSwitcher from './components/ViewSwitcher';
import { fetchTasks } from './services/api';
import { setupWebSocket } from './services/websocket';

function App() {
  const [tasks, setTasks] = useState([]);
  const [currentView, setCurrentView] = useState('week');

  useEffect(() => {
    loadTasks();
    const ws = setupWebSocket((message) => {
      handleWebSocketMessage(message);
    });

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const loadTasks = async () => {
    try {
      const fetchedTasks = await fetchTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleWebSocketMessage = (message) => {
    console.log('WebSocket message received:', message);
    loadTasks();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">个人时间管理工具</h1>
          <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <TaskManager tasks={tasks} currentView={currentView} onTasksChange={loadTasks} />
      </main>
    </div>
  );
}

export default App;
