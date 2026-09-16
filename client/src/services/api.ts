import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const originalRequest = error.config as typeof error.config & { _retry?: boolean; _skipRefresh?: boolean };
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken && !originalRequest._retry && !originalRequest._skipRefresh) {
        originalRequest._retry = true;
        try {
          const refreshResponse = await api.post('/auth/refresh', { refreshToken }, { _skipRefresh: true } as any);
          const refreshed = refreshResponse.data.data;
          localStorage.setItem('token', refreshed.accessToken);
          localStorage.setItem('refreshToken', refreshed.refreshToken);
          localStorage.setItem('user', JSON.stringify(refreshed));
          originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('refreshToken');
        }
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

