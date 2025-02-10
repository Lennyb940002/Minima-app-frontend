import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL + '/api';

// Configuration de base d'axios
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Fonction utilitaire pour gérer les erreurs
const handleError = (error: any) => {
    console.error('API Error:', error);
    if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('hasPaid');
    throw error;
};

export const authApi = {
    login: async (email: string, password: string) => {
        try {
            const response = await axios.post('/auth/login', 
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
            const response = await axios.post('/auth/register', 
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
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('hasPaid');
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    getToken: () => {
        return localStorage.getItem('token');
    }
};

// Intercepteurs
axios.interceptors.request.use(
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
