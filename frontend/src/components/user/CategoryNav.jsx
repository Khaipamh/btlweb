import { useNavigate } from 'react-router-dom';

const fixedItems = [
  { name: '12.12', icon: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png', bgClass: 'bg-red-50', path: '/event-1212' },
  { name: 'Gift Card', icon: 'https://cdn-icons-png.flaticon.com/512/3210/3210036.png', bgClass: 'bg-green-50', path: '/gift-card' },
  { name: 'Mã Giảm Giá', icon: 'https://cdn-icons-png.flaticon.com/512/879/879757.png', bgClass: 'bg-orange-50', path: '/vouchers' },
  { name: 'Điểm Danh', icon: 'https://cdn-icons-png.flaticon.com/512/7518/7518748.png', bgClass: 'bg-pink-50', path: '/attendance' },
  { name: 'Flash Sale', icon: 'https://cdn-icons-png.flaticon.com/512/3266/3266208.png', bgClass: 'bg-yellow-50', path: '/flash-sale' },
  { name: 'Sách Mới', icon: 'https://cdn-icons-png.flaticon.com/512/1156/1156949.png', bgClass: 'bg-pink-50', path: '/new-arrivals' },
  { name: 'Sách Cũ', icon: 'https://cdn-icons-png.flaticon.com/512/2331/2331941.png', bgClass: 'bg-teal-50', path: '/second-hand' },
  { name: 'Ngoại Văn', icon: 'https://cdn-icons-png.flaticon.com/512/2436/2436636.png', bgClass: 'bg-indigo-50', path: '/foreign-books' },
];

export default function CategoryNav() {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto mt-6 px-4">
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-8 gap-y-6 gap-x-2 md:gap-4 justify-items-center">
          {fixedItems.map((item, index) => (
            <button
              type="button"
              key={index}
              onClick={() => item.path && navigate(item.path)}
              className="flex flex-col items-center justify-start cursor-pointer group hover:-translate-y-1 transition-transform duration-300 gap-2 w-full bg-transparent border-0 p-0"
            >
              <div
                className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl transition-colors p-3 shadow-sm ${
                  item.bgClass || 'bg-gray-50 group-hover:bg-gray-100'
                }`}
              >
                <img src={item.icon} className="w-full h-full object-contain" alt="" />
              </div>
              <span className="text-[11px] md:text-[13px] text-center text-gray-600 font-medium group-hover:text-pink-600 transition-colors leading-tight px-1 h-8 flex items-start justify-center">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
