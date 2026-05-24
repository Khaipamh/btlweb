import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookService } from '@/services/bookService';
import SuggestionsPage from '@/pages/SuggestionsPage';

const formatPrice = (v) => new Intl.NumberFormat('vi-VN').format(v);

export default function TrendingPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const raw = await bookService.getTrending();
        const arr = Array.isArray(raw) ? raw : [];
        setBooks(
          arr.map((b) => ({
            id: b.book_id || b.id,
            slug: b.book_slug || b.slug,
            title: b.book_title || b.title,
            price: Number(b.price) || 0,
            oldPrice: b.oldPrice || 0,
            image: b.BookImages?.[0]?.book_image_url || b.image || 'https://placehold.co/400x600?text=No+Image',
            discount: b.discount,
            total_sold: b.total_sold || b.sold || 0,
          }))
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="container mx-auto px-4">
        <div className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-pink-600">
            Trang chủ
          </Link>{' '}
          / <span className="text-gray-800 font-medium">Xu Hướng Mua Sắm</span>
        </div>
        <div className="bg-pink-100 rounded-lg p-6 mb-6 flex items-center gap-4 border border-pink-200">
          <div className="bg-red-500 p-3 rounded-full text-white shadow-md text-2xl">📈</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 uppercase">Xu Hướng Mua Sắm</h1>
            <p className="text-gray-600 text-sm mt-1">Top những cuốn sách bán chạy nhất tuần qua tại Poiseidon</p>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, n) => (
              <div key={n} className="bg-white rounded-lg p-4 h-[320px] animate-pulse border border-gray-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map((book) => (
              <Link
                key={book.id}
                to={`/books/${book.slug || book.id}`}
                className="bg-white rounded-lg p-4 hover:shadow-xl transition duration-300 border border-transparent hover:border-gray-200 flex flex-col group"
              >
                <div className="relative pt-[100%] mb-3 overflow-hidden rounded-md">
                  <img src={book.image} className="absolute top-0 left-0 w-full h-full object-contain group-hover:scale-105 transition duration-500" alt="" />
                  {book.discount ? (
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">-{book.discount}%</div>
                  ) : null}
                </div>
                <h3 className="text-sm text-gray-700 font-medium line-clamp-2 mb-2 min-h-[40px] group-hover:text-pink-600">{book.title}</h3>
                <div className="mt-auto">
                  <div className="text-red-600 font-bold text-lg">{formatPrice(book.price)}đ</div>
                  <div className="flex items-center gap-2 mt-1">
                    {book.oldPrice ? <div className="text-gray-400 text-xs line-through">{formatPrice(book.oldPrice)}đ</div> : null}
                    <div className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Đã bán {book.total_sold || 0}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-8 bg-pink-50 pt-8 pb-0 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] relative z-10">
          <div className="container mx-auto px-4">
            <SuggestionsPage isEmbedded />
          </div>
        </div>
      </div>
    </div>
  );
}
