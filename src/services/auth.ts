// authApi.ts
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
if (!BACKEND_URL) {
  throw new Error('Backend URL not configured');
}

const API_URL = `${BACKEND_URL}/api`;

// Axios instance configuration
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

const handleError = (error: any) => {
  console.error('API Error:', {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status
  });
  
  if (error.response?.status === 401) {
    localStorage.clear();
    window.location.href = '/auth';
  }
  
  throw error;
};

export const authApi = {
  login: async (email: string, password: string) => {
    try {
      console.log('Attempting login at:', `${API_URL}/auth/login`);
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('hasPaid', response.data.user.hasPaid.toString());
      }
      
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  register: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('hasPaid', response.data.user.hasPaid.toString());
      }
      
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  logout: () => {
    localStorage.clear();
    window.location.href = '/auth';
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  getToken: () => {
    return localStorage.getItem('token');
  }
};

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authApi.logout();
    }
    return Promise.reject(error);
  }
);

export default authApi;
