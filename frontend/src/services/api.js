import axios from 'axios';

// Backend origin without trailing slash or /api suffix (defaults to production backend)
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'https://ourstartup.onrender.com'
)
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests automatically & prevent duplicate /api/api URLs
api.interceptors.request.use(
  (config) => {
    // Prevent duplicate /api/api if callers pass a path starting with /api/
    if (config.url && config.baseURL && config.baseURL.endsWith('/api') && config.url.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api/, '');
    }

    const user = localStorage.getItem('ocean_user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (e) {
        console.error('Error parsing stored user token:', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
