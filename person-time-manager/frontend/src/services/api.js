const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3007/api';

export const fetchTasks = async () => {
  const response = await fetch(`${API_BASE_URL}/tasks`);
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
};

export const createTask = async (taskData) => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });
  if (!response.ok) throw new Error('Failed to create task');
  return response.json();
};

export const updateTask = async (taskId, taskData) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });
  if (!response.ok) throw new Error('Failed to update task');
  return response.json();
};

export const deleteTask = async (taskId) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete task');
  return response.json();
};

export const addDependency = async (taskId, dependsOnTaskId) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/dependencies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ depends_on_task_id: dependsOnTaskId }),
  });
  if (!response.ok) throw new Error('Failed to add dependency');
  return response.json();
};

export const removeDependency = async (dependencyId) => {
  const response = await fetch(`${API_BASE_URL}/task-dependencies/${dependencyId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to remove dependency');
  return response.json();
};
