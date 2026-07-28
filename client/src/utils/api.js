// ============================================
// Axios API Instance
// Configured for HTTP-only cookie authentication
// ============================================

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', // Uses env var in production, proxy in dev
  timeout: 10000,
  withCredentials: true, // CRITICAL: Send cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — let AuthContext handle redirect
      console.warn('Authentication failed — token may be expired');
    }
    return Promise.reject(error);
  }
);

export default api;
