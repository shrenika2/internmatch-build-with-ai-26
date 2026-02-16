import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add a request interceptor to include auth token
API.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        const { token } = JSON.parse(userInfo);
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    login: (credentials) => API.post('/auth/login', credentials),
    register: (userData) => API.post('/auth/register', userData),
    getMe: () => API.get('/auth/me'),
    getStatus: () => API.get('/auth/status'),
};

export const notificationAPI = {
    getNotifications: (page = 1) => API.get(`/notifications?page=${page}`),
    markAsRead: (id) => API.patch(`/notifications/${id}/read`),
    markAllRead: () => API.patch('/notifications/read'),
};

export default API;
