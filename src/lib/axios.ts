import axios from 'axios';

const api = axios.create({
    // baseURL is removed to use the relative path, which will be handled by Next.js proxy
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000,
});

// Request interceptor: Inject token
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
