import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import postService from '@/services/postService';

function formatDate(dateString) {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString));
}

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);
        const response = await postService.getPostBySlug(slug);
        setPost(response);
      } catch (err) {
        console.error(err);
        setError('Không tìm thấy bài viết hoặc đã xảy ra lỗi.');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <Link to="/blog" className="text-pink-500 hover:underline">
          ← Quay lại trang tin tức
        </Link>
      </div>
    );
  }
  if (!post) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
        <Link to="/blog" className="text-gray-500 hover:text-pink-500 text-sm mb-4 inline-block">
          ← Quay lại
        </Link>
        <div className="flex items-center gap-2 mb-4">
          {post.Category ? (
            <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full font-medium">{post.Category.category_name}</span>
          ) : null}
          <span className="text-gray-500 text-sm border-l pl-2 border-gray-300">{formatDate(post.created_at)}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>
        {post.thumbnail_url ? (
          <div className="mb-8 rounded-lg overflow-hidden shadow-sm">
            <img src={post.thumbnail_url} alt={post.title} className="w-full h-auto object-cover max-h-[500px]" />
          </div>
        ) : null}
        <div className="prose prose-lg max-w-none text-gray-700 post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </div>
  );
}
