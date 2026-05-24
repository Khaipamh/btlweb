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
  fieldErrors: {},

  clearFieldError: (field) => {
    set((state) => ({
      fieldErrors: { ...state.fieldErrors, [field]: null },
    }));
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null, fieldErrors: {} });
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
          fieldErrors: {},
        });
        return true;
      }
      set({ error: 'Phản hồi từ máy chủ không hợp lệ (Thiếu Token)', isLoading: false });
      return false;
    } catch (err) {
      console.error('Lỗi Đăng Nhập:', err);
      const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại';
      set({
        error: errorMessage,
        isLoading: false,
        fieldErrors: {},
      });
      return false;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null, fieldErrors: {} });
    try {
      const res = await api.post('/api/auth/register', userData);
      if (res?.success === false) {
        set({
          error: res.message || 'Đăng ký thất bại',
          isLoading: false,
        });
        return false;
      }
      const loggedIn = await useAuthStore.getState().login(userData.email, userData.password);
      set({ isLoading: false });
      if (!loggedIn) {
        set({ error: useAuthStore.getState().error || 'Đăng ký xong nhưng đăng nhập thất bại' });
      }
      return loggedIn;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' ? 'Không kết nối được máy chủ. Hãy chạy backend (cổng 3000).' : null) ||
        'Đăng ký thất bại';
      set({
        error: msg,
        isLoading: false,
        fieldErrors: {},
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
