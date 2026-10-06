import api from './api';

export const workerService = {
  getAll: (params) => api.get('/workers', { params }).then(r => r.data),
  getActive: () => api.get('/workers/active').then(r => r.data),
  getById: (id) => api.get(`/workers/${id}`).then(r => r.data),
  create: (data) => api.post('/workers', data).then(r => r.data),
  update: (id, data) => api.put(`/workers/${id}`, data).then(r => r.data),
  deactivate: (id) => api.put(`/workers/${id}/deactivate`).then(r => r.data),
  activate: (id) => api.put(`/workers/${id}/activate`).then(r => r.data),
  getHistory: (id) => api.get(`/workers/${id}/history`).then(r => r.data),
};
