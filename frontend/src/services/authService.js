import api from './api';

export const authService = {
    async login(email, password) {
        const res = await api.post('/api/auth/login', { email, password });
        const body = res.data || res;
        if (body.success) {
            if (body.token) localStorage.setItem('token', body.token);
            if (body.user) localStorage.setItem('user', JSON.stringify(body.user));
        }
        return body;
    },

    async register(data) {
        const res = await api.post('/api/auth/register', data);
        return res.data || res;
    },

    async getProfile() {
        const res = await api.get('/api/auth/me');
        return res.data || res;
    },

    async updateProfile(data) {
        const res = await api.put('/api/auth/me', data);
        return res.data || res;
    }
};