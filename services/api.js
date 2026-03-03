import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ OJO: tu backend en Render sirve en /api
const BASE_URL = 'https://momly-backend.onrender.com/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Token (si existe)
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

  // ✅ ESTA TE FALTABA / OJO a la ruta
  getGuias: () => api.get('/auth/guias'),
};

export default api;