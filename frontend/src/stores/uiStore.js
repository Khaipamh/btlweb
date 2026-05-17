import { create } from 'zustand';

export const useUiStore = create((set) => ({
  loginModalOpen: false,
  loginModalTab: 'login',
  openLoginModal: (tab = 'login') => set({ loginModalOpen: true, loginModalTab: tab }),
  closeLoginModal: () => set({ loginModalOpen: false }),
}));
