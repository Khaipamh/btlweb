import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { cartTotalItems } from '@/utils/cartTotals';
import { getGenreInfo } from '@/utils/genreMap';
import api from '@/services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const openLoginModal = useUiStore((s) => s.openLoginModal);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [genres, setGenres] = useState([]);
  const debounceRef = useRef(null);

  const totalItems = cartTotalItems(items);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get('/api/books/genres');
        if (data) setGenres(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Lỗi tải Genres:', e);
      }
    })();
  }, []);

  const formatPrice = (val) => new Intl.NumberFormat('vi-VN').format(val);

  const handleLiveSearch = (value) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setShowDropdown(true);
    setIsSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await api.get('/api/books', {
          params: { search: value, limit: 5 },
        });
        if (response && Array.isArray(response)) setSearchResults(response);
        else if (response?.data) setSearchResults(response.data.slice(0, 5));
        else setSearchResults([]);
      } catch (error) {
        console.error('Lỗi search:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const goToDetail = (slugOrId) => {
    setShowDropdown(false);
    setSearchQuery('');
    navigate(`/books/${slugOrId}`);
  };

  const goToSearchPage = () => {
    setShowDropdown(false);
    if (searchQuery.trim()) {
      navigate({ pathname: '/books', search: `?search=${encodeURIComponent(searchQuery)}` });
    }
  };

  const goToCategory = (slug) => {
    navigate({ pathname: '/books', search: `?category=${encodeURIComponent(slug)}` });
  };

  return (
    <div className="sticky top-0 z-50">
      <header className="bg-pink-600 text-white py-2 shadow-md font-sans">
        <div className="container mx-auto flex items-center justify-between px-4 lg:px-8 gap-6">
          <div className="flex items-center gap-6 shrink-0">
            <Link to="/" className="text-2xl font-extrabold tracking-tighter flex items-center italic">
              Poiseidon<span className="text-yellow-400" />
            </Link>

            <div className="relative group z-50">
              <div className="flex items-center justify-center cursor-pointer hover:bg-pink-700 w-10 h-10 rounded-lg transition p-2 border-2 border-transparent hover:border-pink-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path
                    fillRule="evenodd"
                    d="M3 6a3 3 0 013-3h2.25a3 3 0 013 3v2.25a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm9.75 0a3 3 0 013-3H18a3 3 0 013 3v2.25a3 3 0 01-3 3h-2.25a3 3 0 01-3-3V6zM3 15.75a3 3 0 013-3h2.25a3 3 0 013 3V18a3 3 0 01-3 3H6a3 3 0 01-3-3v-2.25zm9.75 0a3 3 0 013-3H18a3 3 0 013 3V18a3 3 0 01-3 3h-2.25a3 3 0 01-3-3v-2.25z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <div className="absolute top-full left-0 pt-4 w-[350px] hidden group-hover:block animate-fade-in">
                <div className="bg-white text-gray-800 shadow-2xl rounded-xl border border-gray-200 overflow-hidden">
                  <ul className="flex flex-col text-base py-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {genres.length === 0 ? (
                      <li className="px-6 py-3 text-gray-500 text-center">Đang tải danh mục...</li>
                    ) : (
                      genres.map((genre) => {
                        const g = getGenreInfo(genre);
                        return (
                          <li
                            key={genre.genre_id}
                            role="presentation"
                            onClick={() => goToCategory(genre.genre_slug)}
                            className="px-6 py-3 cursor-pointer hover:bg-pink-50 hover:text-pink-700 flex items-center gap-4 transition-colors border-l-4 border-transparent hover:border-pink-600"
                          >
                            <img src={g.icon} className="w-8 h-8 object-contain" alt="" />
                            <div className="flex flex-col leading-tight">
                              <span className="font-bold text-gray-800 text-lg hover:text-pink-700">{g.viName}</span>
                              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                                {genre.genre_name}
                              </span>
                            </div>
                          </li>
                        );
                      })
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-grow-0 w-full md:w-[420px] lg:w-[520px] mx-auto relative group/search">
            <div className="bg-white rounded-xl flex items-center p-1 shadow-lg overflow-hidden">
              <input
                value={searchQuery}
                onChange={(e) => handleLiveSearch(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                onKeyDown={(e) => e.key === 'Enter' && goToSearchPage()}
                type="text"
                placeholder="Tìm kiếm sách, tác giả, thể loại mong muốn..."
                className="w-full px-3 py-1 text-gray-800 outline-none text-sm font-medium placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={goToSearchPage}
                className="bg-pink-600 hover:bg-pink-700 text-white px-2 py-1 rounded-lg font-bold transition flex items-center justify-center shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {showDropdown && searchQuery.trim() ? (
              <div className="absolute top-full left-0 right-0 w-full mx-auto bg-white rounded-xl shadow-2xl border border-gray-100 mt-2 overflow-hidden z-[60]">
                {isSearching ? (
                  <div className="p-6 text-center text-gray-500 text-base font-medium">Đang tìm...</div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar py-2">
                      {searchResults.map((book) => (
                        <div
                          key={book.book_id}
                          role="presentation"
                          onClick={() => goToDetail(book.book_slug || book.book_id)}
                          className="flex gap-4 p-4 hover:bg-pink-50 cursor-pointer border-b border-gray-100 last:border-none transition-colors"
                        >
                          <img
                            src={book.BookImages?.[0]?.book_image_url || 'https://placehold.co/100x150'}
                            className="w-16 h-24 object-cover rounded-md border shadow-sm"
                            alt=""
                          />
                          <div className="flex-1 flex flex-col justify-center">
                            <h4 className="text-base font-bold text-gray-800 line-clamp-2 mb-2">{book.book_title}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-[#C92127] font-extrabold text-lg">{formatPrice(book.price)}đ</span>
                              {book.Author ? (
                                <span className="text-sm text-gray-500">| {book.Author.author_name}</span>
                              ) : null}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{book.Genre?.genre_name || ''}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div
                      role="presentation"
                      onClick={goToSearchPage}
                      className="p-4 text-center bg-gray-50 text-pink-600 text-sm font-extrabold uppercase hover:bg-pink-100 cursor-pointer border-t tracking-wider transition-colors"
                    >
                      Xem tất cả kết quả
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-gray-500 text-base">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/7465/7465679.png"
                      alt=""
                      className="w-16 h-16 mx-auto mb-4 opacity-50"
                    />
                    Không tìm thấy sách nào phù hợp.
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-8 shrink-0">
            <div className="relative group z-50 cursor-pointer hover:text-yellow-300 text-white transition flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>

            <Link to="/cart" className="relative cursor-pointer hover:text-yellow-300 text-white transition flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {totalItems > 0 ? (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-700 text-xs font-extrabold rounded-full h-6 w-6 flex items-center justify-center border-[3px] border-pink-600">
                  {totalItems}
                </span>
              ) : null}
            </Link>

            <div className="relative group z-50">
              <div
                role="presentation"
                onClick={() => {
                  if (!user) openLoginModal('login');
                }}
                className="cursor-pointer hover:text-yellow-300 text-white transition flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="absolute top-full right-[-20px] pt-5 hidden group-hover:block w-[260px]">
                <div className="bg-white rounded-xl shadow-2xl p-5 border border-gray-100 flex flex-col gap-4 relative mt-2">
                  <div className="absolute -top-2 right-8 w-5 h-5 bg-white transform rotate-45 border-l border-t border-gray-100" />
                  {!user ? (
                    <>
                      <button
                        type="button"
                        onClick={() => openLoginModal('login')}
                        className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-700 transition shadow-md text-base"
                      >
                        Đăng nhập
                      </button>
                      <button
                        type="button"
                        onClick={() => openLoginModal('register')}
                        className="w-full bg-white text-pink-600 border-2 border-pink-600 font-bold py-3 rounded-lg hover:bg-pink-50 transition text-base"
                      >
                        Đăng ký
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-center font-bold text-gray-800 border-b pb-3 mb-2 truncate text-lg">
                        Xin chào, {user.full_name || user.name}
                      </div>
                      {['admin', 'employee'].includes(user.role) ? (
                        <Link
                          to="/admin"
                          className="w-full block text-center bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-black transition shadow-md mb-2"
                        >
                          Trang Quản Trị
                        </Link>
                      ) : null}
                      <Link
                        to="/user/profile"
                        className="w-full block text-center py-3 hover:bg-pink-50 text-pink-700 rounded-lg text-base font-bold mb-1 transition"
                      >
                        Hồ sơ cá nhân
                      </Link>
                      <Link
                        to="/user/orders"
                        className="w-full block text-center py-3 hover:bg-pink-50 text-pink-700 rounded-lg text-base font-bold mb-1 transition"
                      >
                        Lịch sử mua hàng
                      </Link>
                      <button
                        type="button"
                        onClick={() => logout()}
                        className="w-full text-center py-3 text-red-600 hover:bg-red-50 rounded-lg text-base font-bold transition"
                      >
                        Đăng xuất
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
      `}</style>
    </div>
  );
}
