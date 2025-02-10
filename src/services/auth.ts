import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL + '/api';

const axiosConfig = {
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
};

// Configuration globale d'axios
axios.defaults.withCredentials = true;

export const authApi = {
    login: async (email: string, password: string) => {
        try {
            const response = await axios.post(
                `${API_URL}/auth/login`,
                { email, password },
                {
                    ...axiosConfig,
                    headers: {
                        ...axiosConfig.headers,
                        'Access-Control-Allow-Origin': 'https://minima-app-frontend.vercel.app'
                    }
                }
            );
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userId', user.id);
            localStorage.setItem('hasPaid', user.hasPaid.toString());
            return { token, user };
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('hasPaid');
            throw error;
        }
    },

    register: async (email: string, password: string, planId: string) => {
        try {
            const response = await axios.post(
                `${API_URL}/auth/register`,
                { email, password, planId },
                {
                    ...axiosConfig,
                    headers: {
                        ...axiosConfig.headers,
                        'Access-Control-Allow-Origin': 'https://minima-app-frontend.vercel.app'
                    }
                }
            );
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userId', user.id);
            localStorage.setItem('hasPaid', user.hasPaid.toString());
            return { token, user };
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('hasPaid');
            throw error;
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

// Intercepteurs axios
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            authApi.logout();
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);
