import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import banner1 from '@/assets/banners/POISEIDON_Bookstore.png';
import { EVENT_BANNERS } from '@/constants/eventBanners';
import CategoryNav from '@/components/user/CategoryNav';
import GiftCardSection from '@/components/user/GiftCardSection';
import BookListSection from '@/components/user/BookListSection';
import ProductCategory from '@/components/user/ProductCategory';
import SuggestionsPage from '@/pages/SuggestionsPage';
import FlashSale from '@/components/user/FlashSale';

const formatCurrency = (val) => {
  if (!val || Number.isNaN(Number(val))) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

const normalizeBooks = (arr) =>
  Array.isArray(arr)
    ? arr.map((b) => ({
        id: b.book_id || b.id,
        slug: b.book_slug || b.slug,
        title: b.book_title || b.title,
        price: Number(b.price) || 0,
        oldPrice: b.oldPrice || 0,
        image:
          (b.BookImages && b.BookImages[0] && b.BookImages[0].book_image_url) ||
          b.image ||
          'https://placehold.co/400x600?text=No+Image',
        total_sold: b.total_sold || b.sold || 0,
        sold: b.total_sold || b.sold || 0,
      }))
    : [];

export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bestSellers, setBestSellers] = useState([]);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [newBooks, setNewBooks] = useState([]);
  const bannerImages = [
    banner1,
    EVENT_BANNERS.summerSale66,
    EVENT_BANNERS.childrenDay16,
    EVENT_BANNERS.summerBooksSale,
  ];
  const bannerAlts = [
    'Poiseidon Bookstore',
    'Siêu sale mùa hè 6/6',
    'Ưu đãi Quốc tế Thiếu nhi 1/6',
    'Sale sách mùa hè',
  ];

  useEffect(() => {
    (async () => {
      try {
        const [best, trend, news] = await Promise.all([
          api.get('/api/books', { params: { sort: 'total_sold', order: 'DESC', limit: 4 } }),
          api.get('/api/books', { params: { sort: 'total_sold', order: 'DESC', limit: 10 } }),
          api.get('/api/books', { params: { sort: 'book_id', order: 'DESC', limit: 10 } }),
        ]);
        setBestSellers(normalizeBooks(best));
        setTrendingBooks(normalizeBooks(trend));
        setNewBooks(normalizeBooks(news));
      } catch (error) {
        console.error('Lỗi khi gọi API trực tiếp:', error);
      }
    })();
  }, []);

  const nextSlide = () => setCurrentSlide((s) => (s + 1) % bannerImages.length);
  const prevSlide = () => setCurrentSlide((s) => (s - 1 + bannerImages.length) % bannerImages.length);

  return (
    <div className="pb-10 bg-gray-50 min-h-screen">
      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl overflow-hidden shadow-lg relative group h-[200px] md:h-[320px]">
            <div
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {bannerImages.map((banner, index) => (
                <div key={index} className="min-w-full h-full">
                  <img src={banner} className="w-full h-full object-cover" alt={bannerAlts[index] || 'Banner sự kiện'} />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-all z-10 hover:scale-110"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-all z-10 hover:scale-110"
            >
              ›
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {bannerImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Slide ${index + 1}`}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    currentSlide === index ? 'bg-white w-6' : 'bg-white/50 hover:bg-white w-2.5'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 h-auto lg:h-[320px]">
            <Link to="/event-summer-66" className="h-[150px] lg:h-1/2 rounded-2xl overflow-hidden shadow-md group block relative">
              <img
                src={EVENT_BANNERS.childrenDay16}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500 cursor-pointer"
                alt="Sự kiện 1/6 — Quốc tế Thiếu nhi"
              />
              <span className="absolute bottom-2 left-3 bg-pink-600/90 text-white text-xs font-bold px-2 py-1 rounded">
                Sale 1/6
              </span>
            </Link>
            <Link to="/event-summer-66" className="h-[150px] lg:h-1/2 rounded-2xl overflow-hidden shadow-md group block relative">
              <img
                src={EVENT_BANNERS.sidePromo66}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500 cursor-pointer"
                alt="Siêu sale 6/6 mùa hè"
              />
              <span className="absolute bottom-2 left-3 bg-orange-500/90 text-white text-xs font-bold px-2 py-1 rounded">
                Sale 6/6
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-red-600 rounded-full" />
          <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Top Bán Chạy Nhất</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bestSellers.map((book, index) => (
            <div
              key={index}
              role="presentation"
              onClick={() => navigate(`/books/${book.slug || book.id}`)}
              className="bg-white rounded-xl border border-gray-100 p-3 hover:shadow-lg transition-all duration-300 flex flex-col group cursor-pointer"
            >
              <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-3">
                <img
                  src={book.image}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                  alt=""
                />
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-bold text-gray-800 text-sm line-clamp-2 mb-1 group-hover:text-pink-600 transition">
                  {book.title}
                </h4>
                <div className="mt-auto flex items-end justify-between">
                  <div className="text-red-600 font-bold">{formatCurrency(book.price)}</div>
                  {book.oldPrice > book.price ? (
                    <div className="text-xs text-gray-400 line-through">{formatCurrency(book.oldPrice)}</div>
                  ) : null}
                </div>
                <div className="mt-2 text-xs text-gray-500 bg-gray-100 py-1 px-2 rounded-md text-center font-medium">
                  Đã bán {book.total_sold || book.sold || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CategoryNav />
      <FlashSale />
      <ProductCategory />
      <GiftCardSection />

      {trendingBooks.length ? (
        <BookListSection
          title="Xu Hướng Mua Sắm"
          headerClass="bg-pink-100"
          books={trendingBooks}
          seeMoreLink="/trending"
        />
      ) : null}
      {newBooks.length ? (
        <BookListSection title="Sách Mới Tuyển Chọn" books={newBooks} seeMoreLink="/new-arrivals" />
      ) : null}

      <div className="mt-8 bg-pink-50 pt-8 pb-0 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] relative z-10">
        <div className="container mx-auto px-4">
          <SuggestionsPage isEmbedded />
        </div>
      </div>
    </div>
  );
}
