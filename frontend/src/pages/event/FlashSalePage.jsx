import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/services/api';

const formatPrice = (v) => new Intl.NumberFormat('vi-VN').format(v);

export default function FlashSalePage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hours, setHours] = useState('02');
  const [minutes, setMinutes] = useState('00');
  const [seconds, setSeconds] = useState('00');

  useEffect(() => {
    let t = 3 * 3600;
    const id = setInterval(() => {
      t -= 1;
      if (t < 0) return clearInterval(id);
      setHours(String(Math.floor(t / 3600)).padStart(2, '0'));
      setMinutes(String(Math.floor((t % 3600) / 60)).padStart(2, '0'));
      setSeconds(String(t % 60).padStart(2, '0'));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/books/flash-sale');
        const raw = res?.data ?? res;
        const list = Array.isArray(raw) ? raw : [];
        setBooks(
          list.map((b) => ({
            id: b.book_id,
            slug: b.book_slug || b.slug,
            title: b.book_title || b.title,
            price: Number(b.price) || 0,
            discount: b.discount || 0,
            image: b.BookImages?.[0]?.book_image_url || b.image || 'https://placehold.co/400x600?text=No+Image',
          }))
        );
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 flex-wrap">
            <span className="text-yellow-500 text-3xl">⚡</span>
            FLASH SALE
            <span className="text-gray-400 text-lg font-normal">Kết thúc trong</span>
            <span className="bg-black text-white rounded px-2 font-mono">{hours}</span>:
            <span className="bg-black text-white rounded px-2 font-mono">{minutes}</span>:
            <span className="bg-black text-white rounded px-2 font-mono">{seconds}</span>
          </h1>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-12 w-12 border-t-2 border-red-600 rounded-full" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border">
            <p className="text-gray-500 mb-4">Hiện chưa có chương trình Flash Sale.</p>
            <Link to="/" className="text-pink-600 font-bold">
              Về trang chủ
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map((book) => (
              <div
                key={book.id}
                role="presentation"
                onClick={() => navigate(`/books/${book.slug || book.id}`)}
                className="bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden cursor-pointer"
              >
                <div className="relative pt-[140%] bg-gray-100">
                  <img src={book.image} className="absolute inset-0 w-full h-full object-cover" alt="" />
                  {book.discount > 0 ? (
                    <div className="absolute top-0 right-0 bg-[#C92127] text-white text-xs font-bold px-2 py-1 rounded-bl-lg">-{book.discount}%</div>
                  ) : null}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">{book.title}</h3>
                  <div className="text-[#C92127] font-bold text-lg">{formatPrice(book.price)}đ</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
