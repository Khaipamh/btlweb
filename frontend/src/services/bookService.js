// SỬA TRONG bookService.js
import api from './api';

export const bookService = {
  getFlashSale: () => api.get('/api/books/flash-sale'),
  getBestSellers: (limit = 4) => api.get('/api/books', { params: { sort: 'total_sold', order: 'DESC', limit } }),
  getTrending: () => api.get('/api/books', { params: { sort: 'total_sold', order: 'DESC', limit: 10 } }),
  getNewArrivals: () => api.get('/api/books', { params: { sort: 'book_id', order: 'DESC', limit: 10 } })
};