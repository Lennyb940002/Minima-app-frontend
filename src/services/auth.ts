import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const authApi = {
    login: async (email: string, password: string) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userId', user._id);
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
            const response = await axios.post(`${API_URL}/auth/register`, { email, password, planId });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userId', user._id);
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