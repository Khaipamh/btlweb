import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';

const formatPrice = (v) => new Intl.NumberFormat('vi-VN').format(v);

function normalize(arr) {
  return Array.isArray(arr)
    ? arr.map((b) => ({
        id: b.book_id || b.id,
        slug: b.book_slug || b.slug,
        book_slug: b.book_slug,
        book_title: b.book_title,
        title: b.book_title || b.title,
        price: Number(b.price) || 0,
        oldPrice: b.oldPrice || 0,
        image: (b.BookImages && b.BookImages[0] && b.BookImages[0].book_image_url) || b.image || null,
        BookImages: b.BookImages || null,
        total_sold: b.total_sold || b.sold || 0,
        sold: b.total_sold || b.sold || 0,
        Author: b.Author || null,
        discount: b.discount,
      }))
    : [];
}

export default function SuggestionsPage({ isEmbedded = false }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await api.get('/api/books', { params: { limit: 10, sort: 'book_id' } });
        setBooks(normalize(data || []));
      } catch (e) {
        console.error('Lỗi tải gợi ý:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const wrap = isEmbedded ? 'bg-gray-50 py-6' : 'bg-gray-50 min-h-screen py-6';

  return (
    <div className={wrap}>
      <div className="container mx-auto px-4">
        {!isEmbedded ? (
          <>
            <div className="text-sm text-gray-500 mb-4">
              <Link to="/" className="hover:text-pink-600">
                Trang chủ
              </Link>{' '}
              / <span className="text-gray-800 font-medium">Gợi Ý Cho Bạn</span>
            </div>
            <div className="bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg p-8 mb-8 flex items-center gap-6 border border-green-300 shadow-lg">
              <div className="animate-pulse text-4xl">💡</div>
              <div>
                <h1 className="text-3xl font-bold uppercase">Gợi Ý Cho Bạn</h1>
                <p className="text-green-100 text-base mt-2">Những cuốn sách được gợi ý dựa trên sở thích của bạn tại Sahafa</p>
              </div>
            </div>
          </>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, n) => (
              <div key={n} className="bg-white rounded-lg p-4 h-[320px] animate-pulse border border-gray-200">
                <div className="bg-gray-200 h-[200px] w-full mb-3 rounded" />
                <div className="bg-gray-200 h-4 w-3/4 mb-2 rounded" />
                <div className="bg-gray-200 h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map((book) => (
              <Link
                key={book.id}
                to={`/books/${book.slug || book.book_slug || book.id}`}
                className="bg-white rounded-lg p-4 hover:shadow-xl transition duration-300 border border-transparent hover:border-gray-200 cursor-pointer flex flex-col group relative"
              >
                <div className="relative pt-[100%] mb-3 overflow-hidden rounded-md bg-gray-100">
                  <img
                    src={
                      book.image ||
                      (book.BookImages && book.BookImages[0] && book.BookImages[0].book_image_url) ||
                      'https://placehold.co/400x600?text=No+Image'
                    }
                    className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    alt=""
                  />
                  {book.discount ? (
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
                      -{book.discount}%
                    </div>
                  ) : null}
                </div>
                <h3 className="text-sm text-gray-700 font-medium line-clamp-2 mb-2 min-h-[40px] group-hover:text-pink-600 transition">
                  {book.title || book.book_title}
                </h3>
                <div className="text-sm text-gray-500 mb-2">{book.Author?.author_name || ''}</div>
                <div className="mt-auto">
                  <div className="text-red-600 font-bold text-lg">{formatPrice(book.price)}đ</div>
                  <div className="flex items-center gap-2 mt-1">
                    {book.oldPrice ? (
                      <div className="text-gray-400 text-xs line-through">{formatPrice(book.oldPrice)}đ</div>
                    ) : null}
                    <div className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      Đã bán {book.total_sold || book.sold || 0}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {isEmbedded ? (
          <div className="flex justify-center mt-10 mb-4">
            <Link
              to="/suggestions"
              className="bg-white border-2 border-green-500 text-green-600 font-bold px-12 py-2.5 rounded-full hover:bg-green-500 hover:text-white transition shadow-md uppercase text-sm tracking-wide"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
