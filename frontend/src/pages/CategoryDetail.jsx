import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

const categoryMap = {
  'van-hoc': { name: 'Văn Học', icon: 'https://cdn-icons-png.flaticon.com/512/3389/3389081.png' },
  'kinh-te': { name: 'Kinh Tế', icon: 'https://cdn-icons-png.flaticon.com/512/2666/2666505.png' },
  'tam-ly': { name: 'Tâm Lý - Kỹ Năng', icon: 'https://cdn-icons-png.flaticon.com/512/3079/3079166.png' },
  'thieu-nhi': { name: 'Thiếu Nhi', icon: 'https://cdn-icons-png.flaticon.com/512/3468/3468306.png' },
  'giao-khoa': { name: 'Sách Giáo Khoa', icon: 'https://cdn-icons-png.flaticon.com/512/167/167755.png' },
  'nuoi-day-con': { name: 'Nuôi Dạy Con', icon: 'https://cdn-icons-png.flaticon.com/512/2990/2990263.png' },
  default: { name: 'Danh Mục Sách', icon: 'https://cdn-icons-png.flaticon.com/512/207/207114.png' },
};

const allBooks = [
  { id: 1, category: 'van-hoc', title: 'Mắt Biếc - Nguyễn Nhật Ánh', price: 110000, discount: 20, sold: 1200, image: 'https://cdn0.fahasa.com/media/catalog/product/m/a/mat-biec-bia-mem-2019.jpg' },
  { id: 2, category: 'van-hoc', title: 'Nhà Giả Kim', price: 79000, discount: 15, sold: 5000, image: 'https://cdn0.fahasa.com/media/catalog/product/n/h/nha_gia_kim_2020_1.jpg' },
];

const formatPrice = (value) => new Intl.NumberFormat('vi-VN').format(value);

export default function CategoryDetail() {
  const { id } = useParams();
  const categoryInfo = categoryMap[id] || categoryMap.default;
  const filteredBooks = useMemo(() => allBooks.filter((b) => b.category === id), [id]);

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      <div className="bg-white shadow-sm mb-6 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-red-50 rounded-full border border-red-100">
              <img src={categoryInfo.icon} className="w-12 h-12 object-contain" alt="" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Danh mục sản phẩm</p>
              <h1 className="text-3xl font-bold text-gray-800 uppercase tracking-wide">{categoryInfo.name}</h1>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4">
        {filteredBooks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg">Chưa có sản phẩm nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredBooks.map((book) => (
              <Link
                key={book.id}
                to={`/books/${book.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-3 border border-gray-100 flex flex-col group"
              >
                <div className="aspect-[2/3] overflow-hidden rounded-md mb-3 relative">
                  <img src={book.image} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="" />
                  {book.discount > 0 ? (
                    <div className="absolute top-2 right-2 bg-[#C92127] text-white text-xs font-bold px-2 py-1 rounded shadow-sm">-{book.discount}%</div>
                  ) : null}
                </div>
                <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-2 flex-1 group-hover:text-[#C92127]">{book.title}</h3>
                <div className="mt-auto pt-2 border-t border-gray-50">
                  <span className="text-[#C92127] font-bold text-lg">{formatPrice(book.price)}đ</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-yellow-400 text-xs">★★★★★</span>
                    <span className="text-gray-400 text-xs">Đã bán {book.sold}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
