// authApi.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;
if (!API_URL) {
  throw new Error('Backend URL not configured');
}

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const handleError = (error: any) => {
  if (error.response) {
    console.error('API Error:', {
      data: error.response.data,
      status: error.response.status
    });
  }
  localStorage.clear();
  throw error;
};

export const authApi = {
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', 
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
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
      const response = await axios.post('/api/auth/register', 
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
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
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getToken: () => {
    return localStorage.getItem('token');
  }
};

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authApi.logout();
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);
