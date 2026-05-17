import { Link } from 'react-router-dom';

const formatPrice = (value) => new Intl.NumberFormat('vi-VN').format(value);

function formatNumber(num) {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num;
}

const cardClass =
  'bg-white rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-3 border border-gray-100 hover:border-gray-200 cursor-pointer h-full flex flex-col group relative';

export default function BookCard({ book, className = '', asStatic = false }) {
  const slug = book.slug || book.book_slug || book.id;
  const wrapClass = `${cardClass} ${className}`;
  const inner = (
    <>
      <div className="relative pt-[100%] mb-3 overflow-hidden rounded-md">
        <img
          src={book.image || 'https://placehold.co/400x600?text=No+Image'}
          alt={book.title}
          className="absolute top-0 left-0 w-full h-full object-contain p-2 group-hover:scale-105 transition duration-500 ease-in-out"
        />
        {book.discount ? (
          <div className="absolute top-0 right-0 bg-[#C92127] text-white text-[11px] font-bold px-2 py-1 rounded-bl-lg shadow-sm z-10">
            -{book.discount}%
          </div>
        ) : null}
      </div>
      <div className="flex flex-col flex-1 gap-1">
        <h3 className="text-[14px] leading-snug text-gray-800 line-clamp-2 min-h-[40px] group-hover:text-blue-600 transition-colors font-medium">
          {book.title}
        </h3>
        <div className="mt-auto flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#C92127] font-bold text-lg">{formatPrice(book.price)}đ</span>
            {book.oldPrice ? <span className="text-gray-400 text-xs line-through">{formatPrice(book.oldPrice)}đ</span> : null}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex text-yellow-400 text-xs gap-[1px]">★★★★★</div>
            <span className="text-gray-500 text-[11px] truncate">
              Đã bán {formatNumber(book.total_sold || book.sold || 0)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
  if (asStatic) {
    return <div className={wrapClass}>{inner}</div>;
  }
  return (
    <Link to={`/books/${slug}`} className={wrapClass}>
      {inner}
    </Link>
  );
}
