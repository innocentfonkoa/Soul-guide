import axios from 'axios';
import { useStore } from '../store/useStore';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  const token = useStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authApi = {
  register: (email: string, password: string, name: string) =>
    api.post('/api/auth/register', { email, password, name }).then((r) => r.data),
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }).then((r) => r.data),
  getMe: () => api.get('/api/auth/me').then((r) => r.data),
  updateOnboarding: (data: Record<string, unknown>) =>
    api.patch('/api/auth/onboarding', data).then((r) => r.data),
};

// Practices
export const practicesApi = {
  getAll: (params?: Record<string, string | number>) =>
    api.get('/api/practices', { params }).then((r) => r.data),
  getDaily: () => api.get('/api/practices/daily').then((r) => r.data),
  getForYou: () => api.get('/api/practices/for-you').then((r) => r.data),
  getById: (id: string) => api.get(`/api/practices/${id}`).then((r) => r.data),
  complete: (id: string, mood?: string) =>
    api.post(`/api/practices/${id}/complete`, { mood }).then((r) => r.data),
};

// Journey
export const journeyApi = {
  getPath: () => api.get('/api/journey/path').then((r) => r.data),
  getHistory: () => api.get('/api/journey/history').then((r) => r.data),
  getStats: () => api.get('/api/journey/stats').then((r) => r.data),
  saveReflection: (data: { practiceId?: string; prompt: string; response: string }) =>
    api.post('/api/journey/reflection', data).then((r) => r.data),
};

// Companion
export const companionApi = {
  getHistory: () => api.get('/api/companion/history').then((r) => r.data),
  sendMessage: (content: string) =>
    api.post('/api/companion/message', { content }).then((r) => r.data),
};

// Insights
export const insightsApi = {
  getMonthly: (month?: number, year?: number) =>
    api.get('/api/insights/monthly', { params: { month, year } }).then((r) => r.data),
  generate: (month?: number, year?: number) =>
    api.post('/api/insights/generate', { month, year }).then((r) => r.data),
};

// Onboarding
export const onboardingApi = {
  complete: (userId: string) =>
    api.post('/api/onboarding/complete', { userId }).then((r) => r.data),
};

export default api;
