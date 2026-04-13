import { AUTH_SESSION_STORAGE_KEY, LEGACY_TOKEN_STORAGE_KEY } from '../constants/auth';

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

function readStoredToken() {
  const serializedSession = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

  if (serializedSession) {
    try {
      const parsed = JSON.parse(serializedSession) as { token?: string };
      if (typeof parsed.token === 'string' && parsed.token) {
        return parsed.token;
      }
    } catch {
      localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    }
  }

  return localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY);
}

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = readStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a global response interceptor for unified error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
        localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
        // Simple client-side redirect since this runs outside context
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
      }
      
      // Could also add more global catches for 403, 500, etc. here
      console.error('API Error Response:', error.response.status, error.response.data);
    } else {
      console.error('Network Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
