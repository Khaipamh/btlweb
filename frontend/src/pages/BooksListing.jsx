import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/services/api';

const formatPrice = (val) => new Intl.NumberFormat('vi-VN').format(val);

export default function BooksListing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const goToDetail = (slug) => {
    if (!slug) return;
    navigate(`/books/${slug}`);
  };

  useEffect(() => {
    const load = async () => {
      if (!search && !category) {
        setBooks([]);
        return;
      }
      setIsLoading(true);
      setBooks([]);
      try {
        const params = {};
        if (search) params.search = search;
        if (category) params.category = category;
        const response = await api.get('/api/books', { params });
        if (Array.isArray(response)) setBooks(response);
        else if (response?.data) setBooks(response.data);
      } catch (error) {
        console.error('Lỗi search:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [search, category]);

  const titleLabel = search ? `Kết quả tìm kiếm: "${search}"` : `Danh mục: "${category}"`;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-[#C92127]">{titleLabel}</span>
            </h1>
            <p className="text-gray-500 mt-1 ml-1">
              Tìm thấy <b>{books.length}</b> cuốn sách phù hợp
            </p>
          </div>
        </div>

        {!search && !category ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg mb-4">Nhập từ khóa tìm kiếm hoặc chọn danh mục từ trang chủ.</p>
            <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Về trang chủ
            </Link>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600" />
          </div>
        ) : null}

        {!isLoading && (search || category) && books.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-100">
            <img
              src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
              className="w-32 h-32 mx-auto mb-4 opacity-50"
              alt=""
            />
            <p className="text-gray-500 text-lg mb-4">Không tìm thấy sách hoặc tác giả nào phù hợp.</p>
            <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Về trang chủ
            </Link>
          </div>
        ) : null}

        {!isLoading && books.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {books.map((book) => (
              <div
                key={book.book_id}
                role="presentation"
                onClick={() => goToDetail(book.book_slug)}
                className="bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer hover:-translate-y-1 flex flex-col"
              >
                <div className="relative w-full h-56 md:h-64 bg-gray-100 overflow-hidden">
                  <img
                    src={book.BookImages?.[0]?.book_image_url || 'https://placehold.co/400x600?text=No+Image'}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    alt=""
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/400x600?text=No+Image';
                    }}
                  />
                  {book.discount && book.discount > 0 ? (
                    <div className="absolute top-2 right-2 bg-[#C92127] text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                      -{book.discount}%
                    </div>
                  ) : null}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-[#C92127] transition-colors">
                    {book.book_title}
                  </h3>
                  <div className="text-sm text-gray-600 mb-2">
                    <div>
                      <span className="font-medium">TG: </span>
                      {book.Author?.author_name || 'Đang cập nhật'}
                    </div>
                    <div>
                      <span className="font-medium">Thể loại: </span>
                      {book.Genre?.genre_name || 'Đang cập nhật'}
                    </div>
                  </div>
                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-end justify-between">
                    <div className="text-[#C92127] font-extrabold text-lg">{formatPrice(book.price)}</div>
                    <div className="text-right">
                      {book.oldPrice > book.price ? (
                        <div className="text-sm text-gray-400 line-through">{formatPrice(book.oldPrice)}</div>
                      ) : null}
                      <div className="text-xs text-gray-500">Đã bán {book.total_sold || book.sold || 0}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
