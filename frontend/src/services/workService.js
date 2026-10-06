import api from './api';

export const workService = {
  getAll: (params) => api.get('/works', { params }).then(r => r.data),
  getById: (id) => api.get(`/works/${id}`).then(r => r.data),
  create: (data) => api.post('/works', data).then(r => r.data),
  update: (id, data) => api.put(`/works/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/works/${id}`),

  // Work Days
  getDays: (workId) => api.get(`/works/${workId}/days`).then(r => r.data),
  addDay: (workId, data) => api.post(`/works/${workId}/days`, data).then(r => r.data),
  updateDay: (dayId, data) => api.put(`/work-days/${dayId}`, data).then(r => r.data),
  deleteDay: (dayId) => api.delete(`/work-days/${dayId}`),

  // Expenses
  getExpenses: (workId) => api.get(`/works/${workId}/expenses`).then(r => r.data),
  addExpense: (workId, data) => api.post(`/works/${workId}/expenses`, data).then(r => r.data),
  updateExpense: (expenseId, data) => api.put(`/expenses/${expenseId}`, data).then(r => r.data),
  deleteExpense: (expenseId) => api.delete(`/expenses/${expenseId}`),
};
