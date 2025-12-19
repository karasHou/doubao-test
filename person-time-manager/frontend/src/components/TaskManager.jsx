import React, { useState } from 'react';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import { createTask } from '../services/api';

const TaskManager = ({ tasks, currentView, onTasksChange }) => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData);
      onTasksChange();
      setShowTaskForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {currentView === 'day' ? '今日任务' : '本周任务'}
        </h2>
        <button
          onClick={() => setShowTaskForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          + 新建任务
        </button>
      </div>

      {showTaskForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowTaskForm(false)}
        />
      )}

      <TaskList
        tasks={tasks}
        currentView={currentView}
        onTasksChange={onTasksChange}
        selectedTask={selectedTask}
        onTaskSelect={setSelectedTask}
      />
    </div>
  );
};

export default TaskManager;
