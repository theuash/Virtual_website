import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// ── Request interceptor - attach access token ─────────────────────
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

// ── Response interceptor - silent token refresh on 401 ───────────
let isRefreshing = false;
let refreshQueue = []; // queued requests waiting for the new token

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  refreshQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const requestUrl = original?.url || '';

    // Don't retry auth flow requests or requests that already retried
    const isAuthFlow = requestUrl.includes('/auth/login')
      || requestUrl.includes('/auth/register')
      || requestUrl.includes('/auth/otp/')
      || requestUrl.includes('/auth/refresh');

    if (err.response?.status === 401 && !isAuthFlow && !original._retry) {
      // Try to get a new access token using the stored refresh token
      let storedRefreshToken = null;
      try {
        const stored = localStorage.getItem('virtual_user');
        if (stored) storedRefreshToken = JSON.parse(stored).refreshToken;
      } catch { /* ignore */ }

      if (!storedRefreshToken) {
        // No refresh token - clear session and redirect
        localStorage.removeItem('virtual_user');
        window.location.href = '/login';
        return Promise.reject(err);
      }

      if (isRefreshing) {
        // Another refresh is already in flight - queue this request
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken: storedRefreshToken,
        });

        const newToken = data.data?.token;
        if (!newToken) throw new Error('No token in refresh response');

        // Update stored token
        const stored = localStorage.getItem('virtual_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.token = newToken;
          localStorage.setItem('virtual_user', JSON.stringify(parsed));
        }

        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('virtual_user');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
