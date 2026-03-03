import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const api = axios.create({
  baseURL: "https://momly-backend.onrender.com",
  timeout: 15000,
});

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  registro: (datos) => api.post('/auth/registro', datos),
  registroCompleto: (datos) => api.post('/auth/registro-completo', datos),
  login: (datos) => api.post('/auth/login', datos),
};

export default api;