import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import postService from '@/services/postService';

function formatDate(dateString) {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateString));
}

function getExcerpt(html) {
  if (!html) return '';
  const t = html.replace(/<[^>]+>/g, '');
  return t.length > 120 ? `${t.slice(0, 120)}...` : t;
}

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await postService.getAllPosts();
        setPosts(Array.isArray(response) ? response : []);
      } catch (err) {
        console.error(err);
        setError('Không thể tải danh sách bài viết. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Sahafa Blog</h1>
        <p className="text-gray-600">Cập nhật tin tức, review sách và khuyến mãi mới nhất</p>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500" />
        </div>
      ) : null}
      {error ? <div className="text-center py-12 text-red-500">{error}</div> : null}
      {!loading && !error ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.post_id} to={`/blog/${post.post_slug}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 block">
              <div className="h-48 overflow-hidden">
                <img
                  src={post.thumbnail_url || 'https://placehold.co/600x400?text=No+Image'}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  {post.Category ? (
                    <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full mr-2">{post.Category.category_name}</span>
                  ) : null}
                  <span>{formatDate(post.created_at)}</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-pink-600">{post.title}</h2>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">{getExcerpt(post.content)}</p>
                <div className="text-pink-500 font-medium text-sm">Đọc tiếp →</div>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
