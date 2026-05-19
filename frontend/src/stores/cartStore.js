import { create } from 'zustand';
import api from '@/services/api';

export const useCartStore = create((set, get) => ({
  items: [],
  isLoading: false,

  fetchCart: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ items: [] });
      return;
    }
    set({ isLoading: true });
    try {
      const res = await api.get('/api/cart');
      let cart = null;
      if (res && res.success && res.data) cart = res.data;
      else if (res && res.CartItems) cart = res;
      else if (res && res.data && res.data.CartItems) cart = res.data;

      if (cart && Array.isArray(cart.CartItems)) {
        set({
          items: cart.CartItems.map((item) => ({
            id: item.cart_item_id,
            book_id: item.book_id,
            title: item.Book?.book_title,
            price: parseFloat(item.Book?.price || 0),
            image: item.Book?.BookImages?.[0]?.book_image_url || 'https://via.placeholder.com/150',
            quantity: Number(item.quantity || 1),
          })),
        });
      } else {
        set({ items: [] });
      }
    } catch (e) {
      console.error('Lỗi lấy giỏ hàng:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (book, quantity = 1) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để mua sắm!');
      return false;
    }
    try {
      await api.post('/api/cart/add', { book_id: book.id, quantity });
      await get().fetchCart();
      return true;
    } catch (error) {
      console.error('Lỗi thêm vào giỏ:', error);
      alert(`Thêm vào giỏ thất bại: ${error.response?.data?.message || error.message}`);
      return false;
    }
  },

  removeFromCart: async (cartItemId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await api.delete(`/api/cart/item/${cartItemId}`);
      set({ items: get().items.filter((item) => item.id !== cartItemId) });
    } catch (error) {
      console.error('Lỗi xóa sản phẩm:', error);
      alert('Không thể xóa sản phẩm.');
    }
  },

  updateQuantity: async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const items = [...get().items];
    const itemIndex = items.findIndex((item) => item.id === cartItemId);
    if (itemIndex === -1) return;
    const oldQuantity = items[itemIndex].quantity;
    items[itemIndex] = { ...items[itemIndex], quantity: newQuantity };
    set({ items });
    try {
      await api.put(`/api/cart/item/${cartItemId}`, { quantity: newQuantity });
    } catch (error) {
      console.error('Lỗi cập nhật số lượng:', error);
      items[itemIndex] = { ...items[itemIndex], quantity: oldQuantity };
      set({ items });
      alert('Không thể cập nhật số lượng.');
    }
  },

  clearCartAPI: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!confirm('Bạn có chắc chắn muốn xóa giỏ hàng của mình không?')) return;
    try {
      await api.delete('/api/cart/clear');
      set({ items: [] });
      alert('Đã xóa giỏ hàng!');
    } catch (error) {
      console.error('Lỗi xóa giỏ hàng:', error);
      alert('Xóa giỏ hàng thất bại.');
    }
  },

  clearCart: () => set({ items: [] }),
}));
