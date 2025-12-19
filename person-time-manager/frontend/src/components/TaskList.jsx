import React from 'react';
import TaskItem from './TaskItem';
import { deleteTask } from '../services/api';

const TaskList = ({ tasks, currentView, onTasksChange, selectedTask, onTaskSelect }) => {
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('确定要删除这个任务吗？')) {
      try {
        await deleteTask(taskId);
        onTasksChange();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const getFilteredTasks = () => {
    if (currentView === 'day') {
      const today = new Date().toISOString().split('T')[0];
      return tasks.filter(task =>
        task.due_date && task.due_date.startsWith(today)
      );
    }
    return tasks;
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="grid gap-4">
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">暂无任务</p>
        </div>
      ) : (
        filteredTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onDelete={handleDeleteTask}
            onTasksChange={onTasksChange}
            isSelected={selectedTask?.id === task.id}
            onSelect={() => onTaskSelect(task)}
          />
        ))
      )}
    </div>
  );
};

export default TaskList;
