import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';

const genreMap = {
  fiction: { vi: 'Tiểu Thuyết', icon: 'https://cdn-icons-png.flaticon.com/512/2232/2232688.png', bg: 'bg-pink-50 group-hover:bg-pink-100' },
  'science-fiction': { vi: 'Viễn Tưởng', icon: 'https://cdn-icons-png.flaticon.com/512/2040/2040660.png', bg: 'bg-indigo-50 group-hover:bg-indigo-100' },
  mystery: { vi: 'Trinh Thám', icon: 'https://cdn-icons-png.flaticon.com/512/3079/3079120.png', bg: 'bg-purple-50 group-hover:bg-purple-100' },
  romance: { vi: 'Lãng Mạn', icon: 'https://cdn-icons-png.flaticon.com/512/1077/1077035.png', bg: 'bg-pink-50 group-hover:bg-pink-100' },
  horror: { vi: 'Kinh Dị', icon: 'https://cdn-icons-png.flaticon.com/512/3079/3079140.png', bg: 'bg-red-50 group-hover:bg-red-100' },
  'self-help': { vi: 'Kỹ Năng', icon: 'https://cdn-icons-png.flaticon.com/512/3079/3079166.png', bg: 'bg-green-50 group-hover:bg-green-100' },
  business: { vi: 'Kinh Doanh', icon: 'https://cdn-icons-png.flaticon.com/512/2666/2666505.png', bg: 'bg-yellow-50 group-hover:bg-yellow-100' },
  history: { vi: 'Lịch Sử', icon: 'https://cdn-icons-png.flaticon.com/512/3389/3389081.png', bg: 'bg-orange-50 group-hover:bg-orange-100' },
  biography: { vi: 'Hồi Ký', icon: 'https://cdn-icons-png.flaticon.com/512/167/167755.png', bg: 'bg-teal-50 group-hover:bg-teal-100' },
  fantasy: { vi: 'Giả Tưởng', icon: 'https://cdn-icons-png.flaticon.com/512/3468/3468306.png', bg: 'bg-rose-50 group-hover:bg-rose-100' },
};

export default function ProductCategory() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/api/books/genres');
        const body = res && res.data !== undefined ? res.data : res;
        let list = [];
        if (body && body.success && Array.isArray(body.data)) list = body.data;
        else if (Array.isArray(body)) list = body;
        setCategories(
          list.map((g) => {
            const info = genreMap[g.genre_slug];
            return {
              slug: g.genre_slug,
              name: info ? info.vi : g.genre_name,
              icon: info ? info.icon : 'https://cdn-icons-png.flaticon.com/512/29/29302.png',
              bgClass: info ? info.bg : 'bg-gray-50 group-hover:bg-gray-100',
            };
          })
        );
      } catch (e) {
        console.error('Lỗi tải danh mục:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#C92127]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 uppercase">Danh mục Sách</h2>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-gray-500 flex justify-center items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#C92127]" />
            Đang tải danh mục...
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-x-4 gap-y-8">
            {categories.map((cat, index) => (
              <Link
                key={index}
                to={`/books?category=${encodeURIComponent(cat.slug)}`}
                className="flex flex-col items-center group cursor-pointer transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-16 h-16 md:w-20 md:h-20 mb-3 rounded-full flex items-center justify-center transition-colors duration-300 shadow-sm ${cat.bgClass}`}
                >
                  <img src={cat.icon} alt={cat.name} className="w-8 h-8 md:w-10 md:h-10 object-contain opacity-90 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-sm md:text-[13px] text-center text-gray-700 font-bold leading-tight px-1 group-hover:text-[#C92127] transition-colors h-8 flex items-start justify-center">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
