import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials).then(r => r.data),
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  getCurrentUser: () => api.get('/auth/me').then(r => r.data),
};
