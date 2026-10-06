import api from './api';

export const dailyWorkerService = {
  getByWorkDay: (dayId) => api.get(`/work-days/${dayId}/workers`).then(r => r.data),
  assign: (dayId, data) => api.post(`/work-days/${dayId}/workers`, data).then(r => r.data),
  update: (id, data) => api.put(`/daily-workers/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/daily-workers/${id}`),
};

export const paymentService = {
  getByDailyWorker: (dailyWorkerId) =>
    api.get(`/daily-workers/${dailyWorkerId}/payments`).then(r => r.data),
  record: (dailyWorkerId, data) =>
    api.post(`/daily-workers/${dailyWorkerId}/payments`, data).then(r => r.data),
  getRecent: (limit = 20) =>
    api.get('/payments', { params: { limit } }).then(r => r.data),
};
