import axios from 'axios';
import type { RegisterData, LoginData, CompetitionFilters } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: RegisterData) =>
    api.post('/auth/register', data),

  login: (data: LoginData) =>
    api.post('/auth/login', data),
};

export const competitionAPI = {
  getAll: () =>
    api.get('/competitions'),

  getPaginated: (filters: CompetitionFilters) =>
    api.get('/competitions/paginated', { params: filters }),

  getMy: () =>
    api.get('/competitions/my'),

  join: (competitionId: string) =>
    api.post(`/competitions/${competitionId}/join`),

  leave: (competitionId: string) =>
    api.delete(`/competitions/${competitionId}/leave`),
};

export default api;
