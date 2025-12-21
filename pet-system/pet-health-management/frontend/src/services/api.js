import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const petAPI = {
  getAll: () => api.get('/pets'),
  create: (pet) => api.post('/pets', pet),
  update: (id, pet) => api.put(`/pets/${id}`, pet),
  delete: (id) => api.delete(`/pets/${id}`),
};

export const vaccinationAPI = {
  getByPet: (petId) => api.get(`/vaccinations/pet/${petId}`),
  create: (vaccination) => api.post('/vaccinations', vaccination),
  delete: (id) => api.delete(`/vaccinations/${id}`),
};

export const checkupAPI = {
  getByPet: (petId) => api.get(`/checkups/pet/${petId}`),
  create: (checkup) => api.post('/checkups', checkup),
  delete: (id) => api.delete(`/checkups/${id}`),
};

export const reminderAPI = {
  getAll: () => api.get('/reminders'),
  getByPet: (petId) => api.get(`/reminders/pet/${petId}`),
  create: (reminder) => api.post('/reminders', reminder),
  update: (id, reminder) => api.put(`/reminders/${id}`, reminder),
  delete: (id) => api.delete(`/reminders/${id}`),
};

export default api;