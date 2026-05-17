import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/services/api';

const formatPrice = (value) => new Intl.NumberFormat('vi-VN').format(value);

function fullImage(img) {
  if (!img) return '';
  return img.startsWith('http') ? img : `${api.defaults.baseURL || ''}${img}`;
}

export default function FlashSale() {
  const navigate = useNavigate();
  const [flashSaleBooks, setFlashSaleBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hours, setHours] = useState('02');
  const [minutes, setMinutes] = useState('59');
  const [seconds, setSeconds] = useState('59');

  useEffect(() => {
    let timeInSecs = 3 * 60 * 60;
    const id = setInterval(() => {
      timeInSecs -= 1;
      if (timeInSecs < 0) {
        clearInterval(id);
        return;
      }
      setHours(Math.floor(timeInSecs / 3600).toString().padStart(2, '0'));
      setMinutes(Math.floor((timeInSecs % 3600) / 60).toString().padStart(2, '0'));
      setSeconds(Math.floor(timeInSecs % 60).toString().padStart(2, '0'));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/api/books/flash-sale');
        const raw = res?.data ?? res;
        const list = Array.isArray(raw) ? raw : [];
        setFlashSaleBooks(
          list.map((b) => ({
            id: b.book_id || b.id,
            slug: b.book_slug || b.slug,
            title: b.book_title || b.title,
            price: Number(b.price) || 0,
            oldPrice: Number(b.oldPrice || b.price || 0),
            discount: b.discount || 0,
            image:
              b.BookImages?.[0]?.book_image_url ||
              b.image ||
              'https://placehold.co/400x600?text=No+Image',
            total_sold: b.total_sold || b.sold || 0,
            sold: b.total_sold || b.sold || 0,
            totalStock: b.totalStock || b.stock_quantity || 500,
          }))
        );
      } catch (e) {
        console.error('Lỗi Flash Sale:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const goToBookDetail = (slugOrId) => {
    if (!slugOrId) return;
    navigate(`/books/${slugOrId}`);
  };

  return (
    <div className="container mx-auto mt-6 px-4">
      <div className="bg-red-600 rounded-xl p-4 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2 md:gap-6">
            <div className="flex items-center gap-1 italic font-black text-2xl md:text-3xl text-white">
              <span className="text-yellow-400 drop-shadow-md">FLA⚡H</span>
              <span className="drop-shadow-md">SALE</span>
            </div>
            <div className="flex items-center gap-1 text-white font-bold">
              <span className="text-sm md:text-base font-normal mr-2 hidden md:inline-block">Kết thúc trong</span>
              <div className="bg-black/80 text-white px-2 py-1 rounded-md min-w-[32px] text-center border border-white/20">{hours}</div>
              <span className="font-black">:</span>
              <div className="bg-black/80 text-white px-2 py-1 rounded-md min-w-[32px] text-center border border-white/20">{minutes}</div>
              <span className="font-black">:</span>
              <div className="bg-black/80 text-white px-2 py-1 rounded-md min-w-[32px] text-center border border-white/20">{seconds}</div>
            </div>
          </div>
          <Link to="/flash-sale" className="text-white text-sm font-medium hover:text-yellow-200 flex items-center group transition">
            Xem tất cả <span className="ml-1 group-hover:translate-x-1 transition-transform">&gt;</span>
          </Link>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 snap-x custom-scrollbar">
          {isLoading ? (
            <div className="w-full text-center text-white py-10">
              <div className="inline-block w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mb-2" />
              <p>Đang săn deal tốt...</p>
            </div>
          ) : (
            flashSaleBooks.map((book) => (
              <div
                key={book.id}
                role="presentation"
                onClick={() => goToBookDetail(book.slug || book.id)}
                className="bg-white rounded-xl p-3 min-w-[170px] max-w-[170px] md:min-w-[210px] md:max-w-[210px] flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer snap-start"
              >
                <div className="relative pt-[140%] mb-3 rounded-lg overflow-hidden group">
                  <img
                    src={fullImage(book.image)}
                    className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    alt=""
                  />
                  <div className="absolute top-0 right-0 bg-[#C92127] text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                    -{book.discount}%
                  </div>
                </div>
                <h3 className="text-[14px] leading-tight text-gray-800 font-medium line-clamp-2 mb-2 min-h-[40px]">{book.title}</h3>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-[#C92127] font-bold text-lg">{formatPrice(book.price)}đ</div>
                  </div>
                  <div className="text-gray-400 text-xs line-through mb-2">{formatPrice(book.oldPrice)}đ</div>
                  <div className="relative w-full h-5 bg-pink-100 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-[#C92127]"
                      style={{
                        width: `${Math.min(((book.total_sold || book.sold || 0) / (book.totalStock || 1)) * 100, 100)}%`,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold uppercase z-10 drop-shadow-sm">
                      {(book.total_sold || book.sold) > 0 ? `Đã bán ${book.total_sold || book.sold}` : 'Vừa mở bán'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.5); border-radius: 4px; }
      `}</style>
    </div>
  );
}
