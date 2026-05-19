import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookCard from '@/components/user/BookCard';

export default function BookListSection({
  title,
  books = [],
  headerClass = 'bg-white',
  iconBgClass,
  showTimer = false,
  showProgressBar = false,
  seeMoreLink,
}) {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [hours, setHours] = useState('02');
  const [minutes, setMinutes] = useState('00');
  const [seconds, setSeconds] = useState('00');

  const goToBookDetail = (book) => {
    const slug = book.slug || book.book_slug || book.id;
    navigate(`/books/${slug}`);
  };

  const scroll = (direction) => {
    const el = scrollContainerRef.current;
    if (el) el.scrollBy({ left: direction === 'left' ? -600 : 600, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!showTimer) return undefined;
    let timeInSeconds = 2 * 60 * 60;
    const id = setInterval(() => {
      if (timeInSeconds <= 0) {
        clearInterval(id);
        return;
      }
      timeInSeconds -= 1;
      const h = Math.floor(timeInSeconds / 3600);
      const m = Math.floor((timeInSeconds % 3600) / 60);
      const s = timeInSeconds % 60;
      setHours(h.toString().padStart(2, '0'));
      setMinutes(m.toString().padStart(2, '0'));
      setSeconds(s.toString().padStart(2, '0'));
    }, 1000);
    return () => clearInterval(id);
  }, [showTimer]);

  return (
    <div className="container mx-auto mt-6 px-4">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden relative group border border-gray-100">
        <div className={`p-4 flex items-center gap-3 border-b border-gray-100 ${headerClass}`}>
          <div className={`p-1.5 rounded ${iconBgClass || 'bg-red-100 text-[#2563eb]'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-lg md:text-xl font-bold uppercase text-gray-800">{title}</h2>
          {showTimer ? (
            <div className="hidden md:flex items-center gap-2 ml-auto text-white">
              <span className="bg-black px-2 py-1 rounded font-bold text-sm w-8 text-center">{hours}</span>:
              <span className="bg-black px-2 py-1 rounded font-bold text-sm w-8 text-center">{minutes}</span>:
              <span className="bg-black px-2 py-1 rounded font-bold text-sm w-8 text-center">{seconds}</span>
            </div>
          ) : null}
        </div>

        <div className="relative p-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full shadow-md w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#2563eb] opacity-0 group-hover:opacity-100 transition border hidden md:flex hover:scale-110"
          >
            ‹
          </button>
          <div ref={scrollContainerRef} className="flex overflow-x-auto gap-3 pb-2 scroll-smooth scrollbar-hide p-1">
            {books.map((book) => (
              <div
                key={book.id || book.slug}
                role="presentation"
                onClick={() => goToBookDetail(book)}
                className="min-w-[170px] md:min-w-[200px] h-auto flex flex-col cursor-pointer"
              >
                <BookCard book={book} asStatic className="h-full" />
                {showProgressBar ? (
                  <div className="mt-2 px-1">
                    <div className="w-full bg-pink-100 rounded-full h-4 relative overflow-hidden">
                      <div
                        className="bg-[#2563eb] h-full absolute left-0 top-0"
                        style={{ width: `${Math.min(((book.total_sold || book.sold || 0) / 1200) * 100, 100)}%` }}
                      />
                      <span className="absolute w-full text-center text-[10px] text-white font-bold leading-4 z-10 uppercase">
                        Đã bán {book.total_sold || book.sold || 0}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full shadow-md w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#2563eb] opacity-0 group-hover:opacity-100 transition border hidden md:flex hover:scale-110"
          >
            ›
          </button>
        </div>

        <div className="text-center pb-4 pt-2">
          {seeMoreLink ? (
            <Link
              to={seeMoreLink}
              className="border-2 border-[#2563eb] text-[#2563eb] px-12 py-2 rounded-lg font-bold text-sm hover:bg-[#2563eb] hover:text-white transition duration-300 inline-block"
            >
              Xem Thêm
            </Link>
          ) : (
            <span className="border-2 border-[#2563eb] text-[#2563eb] px-12 py-2 rounded-lg font-bold text-sm inline-block opacity-60">
              Xem Thêm
            </span>
          )}
        </div>
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
