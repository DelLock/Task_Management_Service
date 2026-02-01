import axios from 'axios';

const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.VUE_APP_API_URL || '/api';
  }
  return process.env.VUE_APP_API_URL || 'http://localhost:3000/api';
};

export const getWebSocketUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin;
  }
  return process.env.VUE_APP_WS_URL || 'http://localhost:3000';
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    if (response) {
      switch (response.status) {
        case 400:
          console.error('Ошибка валидации:', response.data);
          break;
        case 401:
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Use router if available, otherwise redirect
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Доступ запрещен:', error.config.url);
          break;
        case 404:
          console.error('Ресурс не найден:', error.config.url);
          break;
        case 500:
          console.error('Ошибка сервера:', response.data?.message);
          break;
        default:
          console.error('Ошибка:', response.status, error.config.url);
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error('Таймаут запроса');
    } else if (error.message === 'Network Error') {
      console.error('Сетевая ошибка. Проверьте подключение к интернету.');
    } else {
      console.error('Неизвестная ошибка:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;