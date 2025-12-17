import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import MeetingCalendar from './components/Calendar/MeetingCalendar';
import './App.css';

const AppContent: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { user } = useAuth();

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
  };

  if (!user) {
    return authMode === 'login' ? (
      <Login onToggleForm={toggleAuthMode} />
    ) : (
      <Register onToggleForm={toggleAuthMode} />
    );
  }

  return <MeetingCalendar />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;