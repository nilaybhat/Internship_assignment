import axios from 'axios';
import { config } from '../config';
import { clearAuth, getToken } from '../utils/token';

/**
 * Single axios instance for the whole app.
 *  - Adds the JWT from localStorage to every request.
 *  - On a 401 response, clears the session and notifies listeners so the UI
 *    can redirect to /login.
 */
const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((request) => {
  const token = getToken();
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && getToken()) {
      clearAuth();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/users/me'),
};

export const taskApi = {
  list: ({ status } = {}) =>
    api.get('/tasks', { params: status ? { status } : {} }),
  create: (payload) => api.post('/tasks', payload),
  update: (id, payload) => api.put(`/tasks/${id}`, payload),
  remove: (id) => api.delete(`/tasks/${id}`),
};

export const userApi = {
  list: () => api.get('/users'),
  remove: (id) => api.delete(`/users/${id}`),
};

export default api;