// utils/axios.js
// Skonfigurowany Axios z automatycznym dodawaniem JWT i obsługą błędów

import axios from 'axios';
import { getStoredToken, removeStoredToken, isTokenValid } from './jwt';
import router from '../router/index';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR - dodaj token do każdego requesta
api.interceptors.request.use(
  (config) => {

    if (config.url && config.url.includes('/public/')) {
        return config;
    }

    const token = getStoredToken();
    
    // Jeśli jest token i jest ważny, dodaj do headers
    if (token && isTokenValid(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {

    
    return response;
  },
  (error) => {
    const status = error.response?.status;
    

    
    if (status === 401) {
      removeStoredToken();
      
      if (router.currentRoute.value.path !== '/') {
        router.push('/');
      }
      
      return Promise.reject({
        message: 'Nieudane logowanie',
        status: 401
      });
    }
    
    // 403 Forbidden - brak uprawnień
    if (status === 403) {
      return Promise.reject({
        message: 'Brak uprawnień do wykonania tej operacji.',
        status: 403
      });
    }
    
    // 404 Not Found
    if (status === 404) {
      return Promise.reject({
        message: 'Nie znaleziono zasobu.',
        status: 404
      });
    }
    
    // 429 Too Many Requests
    if (status === 429) {
      return Promise.reject({
        message: 'Za dużo prób. Spróbuj za chwilę.',
        status: 429
      });
    }
    
    // 500 Server Error
    if (status >= 500) {
      return Promise.reject({
        message: 'Błąd serwera. Spróbuj ponownie później.',
        status: status
      });
    }
    
    // Brak połączenia z serwerem
    if (!error.response) {
      return Promise.reject({
        message: 'Brak połączenia z serwerem. Sprawdź internet.',
        status: 0
      });
    }
    
    return Promise.reject(error);
  }
);

// Eksportuj gotową instancję
export default api;

// Eksportuj też pomocnicze metody
export const authAPI = {
  login: (email, haslo) => api.post('/auth/login', { email, haslo }),
  register: (data) => api.post('/auth/register', data),
  logout: () => {
    removeStoredToken();
    return Promise.resolve();
  }
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
};

export const dictionaryAPI = {
  getColors: () => api.get('/public/dictionary/colors'),
  getPatterns: () => api.get('/public/dictionary/patterns'),
  getFonts: () => api.get('/public/dictionary/fonts'),
};

export const projectAPI = {
  submitProject: (data) => api.post('/public/project', data)
};

// utils/axios.js

export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  getAllProjects: () => api.get('/admin/projects') 
};