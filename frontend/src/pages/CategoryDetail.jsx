import { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '@/services/api';
import { message } from 'antd';

const categoryMap = {
  'fiction': { name: 'Tiểu Thuyết', icon: 'https://cdn-icons-png.flaticon.com/512/3389/3389081.png' },
  'science-fiction': { name: 'Viễn Tưởng', icon: 'https://cdn-icons-png.flaticon.com/512/2666/2666505.png' },
  'mystery': { name: 'Trình Thám', icon: 'https://cdn-icons-png.flaticon.com/512/3079/3079166.png' },
  'romance': { name: 'Lãng Mạn', icon: 'https://cdn-icons-png.flaticon.com/512/3468/3468306.png' },
  'horror': { name: 'Kinh Dị', icon: 'https://cdn-icons-png.flaticon.com/512/167/167755.png' },
  'self-help': { name: 'Kỹ Năng Sống', icon: 'https://cdn-icons-png.flaticon.com/512/2990/2990263.png' },
  'business': { name: 'Kinh Doanh', icon: 'https://cdn-icons-png.flaticon.com/512/207/207114.png' },
  default: { name: 'Danh Mục Sách', icon: 'https://cdn-icons-png.flaticon.com/512/207/207114.png' },
};

const formatPrice = (value) => new Intl.NumberFormat('vi-VN').format(value);

export default function CategoryDetail() {
  const { id } = useParams();
  const categoryInfo = categoryMap[id] || categoryMap.default;
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/books', { params: { category: id } });
        if (res.success && res.data) {
          setBooks(res.data);
        } else {
          setBooks([]);
        }
      } catch (error) {
        console.error('Lỗi tải sách:', error);
        message.error('Lỗi tải dữ liệu sách');
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [id]);

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      <div className="bg-white shadow-sm mb-6 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-red-50 rounded-full border border-red-100">
              <img src={categoryInfo.icon} className="w-12 h-12 object-contain" alt="" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Danh mục sản phẩm</p>
              <h1 className="text-3xl font-bold text-gray-800 uppercase tracking-wide">{categoryInfo.name}</h1>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg">Đang tải sách...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg">Chưa có sản phẩm nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map((book) => {
              const image = book.BookImages?.length > 0 ? book.BookImages[0].book_image_url : 'https://via.placeholder.com/200x300?text=No+Image';
              return (
                <Link
                  key={book.book_id}
                  to={`/books/${book.book_slug || book.book_id}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-3 border border-gray-100 flex flex-col group"
                >
                  <div className="aspect-[2/3] overflow-hidden rounded-md mb-3 relative">
                    <img src={image} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt={book.book_title} />
                  </div>
                  <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-2 flex-1 group-hover:text-[#C92127]">{book.book_title}</h3>
                  <div className="mt-auto pt-2 border-t border-gray-50">
                    <span className="text-[#C92127] font-bold text-lg">{formatPrice(book.price)}đ</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-yellow-400 text-xs">★★★★★</span>
                      <span className="text-gray-400 text-xs">Đã bán {book.total_sold || 0}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}