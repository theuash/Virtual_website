import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('virtual_user');
    if (stored) {
      const { token } = JSON.parse(stored);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch { /* ignore */ }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const requestUrl = err.config?.url || '';
    const isAuthFlowRequest = requestUrl.includes('/auth/login')
      || requestUrl.includes('/auth/register')
      || requestUrl.includes('/auth/otp/');

    if (err.response?.status === 401 && !isAuthFlowRequest) {
      localStorage.removeItem('virtual_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
