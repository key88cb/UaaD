import axios from 'axios';
import { AUTH_LOGOUT_EVENT } from '../constants/authEvents';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
        localStorage.removeItem('token');
        window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
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
