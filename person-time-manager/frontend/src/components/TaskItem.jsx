import React, { useState } from 'react';
import TaskForm from './TaskForm';
import { updateTask } from '../services/api';

const TaskItem = ({ task, onDelete, onTasksChange, isSelected, onSelect }) => {
  const [showEditForm, setShowEditForm] = useState(false);

  const handleUpdateTask = async (taskData) => {
    try {
      await updateTask(task.id, taskData);
      onTasksChange();
      setShowEditForm(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      blocked: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${isSelected ? 'border-blue-500' : 'border-gray-300'} hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status === 'pending' && '待处理'}
              {task.status === 'in_progress' && '进行中'}
              {task.status === 'completed' && '已完成'}
              {task.status === 'blocked' && '已阻塞'}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority === 'low' && '低'}
              {task.priority === 'medium' && '中'}
              {task.priority === 'high' && '高'}
            </span>
          </div>
          {task.description && (
            <p className="mt-1 text-sm text-gray-600">{task.description}</p>
          )}
          {task.due_date && (
            <p className="mt-2 text-sm text-gray-500">
              截止日期: {new Date(task.due_date).toLocaleString('zh-CN')}
            </p>
          )}
          {task.parent_id && (
            <p className="mt-1 text-sm text-gray-500">子任务</p>
          )}
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => setShowEditForm(true)}
            className="text-blue-600 hover:text-blue-800"
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-600 hover:text-red-800"
          >
            删除
          </button>
        </div>
      </div>

      {showEditForm && (
        <div className="mt-4 pt-4 border-t">
          <TaskForm
            task={task}
            onSubmit={handleUpdateTask}
            onCancel={() => setShowEditForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default TaskItem;
