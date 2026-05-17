import { create } from 'zustand';
import api from '@/services/api';

export const useAuthStore = create((set) => ({
  user: (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/api/auth/login', { email, password });
      let finalData = res;
      if (!finalData || !finalData.token) finalData = res?.data;
      if (finalData && finalData.token) {
        localStorage.setItem('token', finalData.token);
        localStorage.setItem('user', JSON.stringify(finalData.user));
        set({
          token: finalData.token,
          user: finalData.user,
          isLoading: false,
        });
        return true;
      }
      set({ error: 'Phản hồi từ máy chủ không hợp lệ (Thiếu Token)', isLoading: false });
      return false;
    } catch (err) {
      console.error('Lỗi Đăng Nhập:', err);
      set({
        error: err.response?.data?.message || 'Đăng nhập thất bại',
        isLoading: false,
      });
      return false;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/api/auth/register', userData);
      set({ isLoading: false });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Đăng ký thất bại',
        isLoading: false,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
    window.location.href = '/';
  },

  setUser: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },
}));
