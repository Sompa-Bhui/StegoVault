import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
console.log("API URL:", import.meta.env.VITE_API_URL);
const API_URL = `${BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/auth/login', formData);
    return response.data;
  },
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const stegoService = {
  encode: async (formData) => {
    const response = await api.post('/stego/encode', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  decode: async (formData) => {
    const response = await api.post('/stego/decode', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  analyze: async (formData) => {
    const response = await api.post('/stego/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get('/dashboard/history');
    return response.data;
  },
  getImages: async () => {
    const response = await api.get('/dashboard/images');
    return response.data;
  },
};

export default api;
