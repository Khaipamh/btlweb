import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookService } from '@/services/bookService';
import SuggestionsPage from '@/pages/SuggestionsPage';

export default function NewArrivalsPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await bookService.getNewArrivals();
        const arr = Array.isArray(raw) ? raw : [];
        setBooks(
          arr.map((b) => ({
            id: b.book_id || b.id,
            slug: b.book_slug || b.slug,
            title: b.book_title || b.title,
            price: Number(b.price) || 0,
            oldPrice: Number(b.oldPrice) || 0,
            discount: b.discount,
            image: b.BookImages?.[0]?.book_image_url || b.image || 'https://placehold.co/400x600?text=No+Image',
          }))
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      <div className="bg-green-600 text-white py-10 text-center">
        <h1 className="text-3xl font-black uppercase">Sách mới tuyển chọn</h1>
      </div>
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                role="presentation"
                onClick={() => navigate(`/books/${book.slug || book.id}`)}
                className="group bg-white rounded-2xl p-3 shadow-sm hover:shadow-xl border border-gray-100 cursor-pointer"
              >
                <div className="relative pt-[100%] mb-3 bg-gray-50 rounded-xl overflow-hidden">
                  <img src={book.image} className="absolute top-0 left-0 w-full h-full object-contain p-4 group-hover:scale-110 transition duration-500" alt="" />
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">MỚI</div>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 h-10 mb-1">{book.title}</h3>
                <div className="text-pink-600 font-bold text-lg">{Number(book.price).toLocaleString('vi-VN')}đ</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-8 bg-pink-50 pt-8 pb-0 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] relative z-10">
        <div className="container mx-auto px-4">
          <SuggestionsPage isEmbedded />
        </div>
      </div>
    </div>
  );
}
