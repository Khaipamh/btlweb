import api from './api';

const postService = {
  getAllPosts() {
    return api.get('/api/posts');
  },

  getPostBySlug(slug) {
    return api.get(`/api/posts/slug/${slug}`);
  },

  getPostCategories() {
    return api.get('/api/posts/categories');
  }
};

export default postService;
