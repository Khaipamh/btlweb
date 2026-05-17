import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { cartTotalItems, cartTotalPrice } from '@/utils/cartTotals';
import api from '@/services/api';

const formatPrice = (value) => new Intl.NumberFormat('vi-VN').format(value);

function fullImage(item) {
  const img = item.image || item.Book?.BookImages?.[0]?.book_image_url || '';
  if (!img) return 'https://placehold.co/400x600?text=No+Image';
  return img.startsWith('http') ? img : `${api.defaults.baseURL || ''}${img}`;
}

function resolvePrice(item) {
  return Number(item.price ?? item.Book?.price ?? 0);
}

function resolveQuantity(item) {
  return Number(item.quantity ?? 1);
}

export default function Cart() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const isLoading = useCartStore((s) => s.isLoading);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCartAPI = useCartStore((s) => s.clearCartAPI);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const totalItems = cartTotalItems(items);
  const totalPrice = cartTotalPrice(items);

  const handleCheckout = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để thanh toán!');
      navigate('/login');
      return;
    }
    if (items.length === 0) {
      alert('Giỏ hàng của bạn đang trống!');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="min-h-[60vh] bg-gray-50 py-8 px-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-end mb-6">
          <h1 className="text-xl font-bold text-gray-800 uppercase flex items-center gap-2">
            Giỏ Hàng <span className="text-base font-normal text-gray-500 normal-case">({totalItems} sản phẩm)</span>
          </h1>
          {items.length > 0 ? (
            <button
              type="button"
              onClick={() => clearCartAPI()}
              className="text-red-500 hover:text-red-700 font-medium text-sm underline cursor-pointer bg-transparent border-0"
            >
              Xóa Tất Cả
            </button>
          ) : null}
        </div>

        {totalItems === 0 && !isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 flex flex-col items-center justify-center text-center h-[400px]">
            <p className="text-gray-600 mb-6">Giỏ hàng của bạn đang trống.</p>
            <Link to="/" className="bg-[#C92127] text-white font-bold py-3 px-10 rounded-lg hover:bg-red-700 transition shadow-md uppercase">
              Mua Sắm Ngay
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden relative">
              {isLoading ? (
                <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500" />
                </div>
              ) : null}
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-100 font-bold text-gray-700 text-sm border-b">
                <div className="col-span-6">Sản phẩm</div>
                <div className="col-span-2 text-center">Đơn giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-center">Thành tiền</div>
              </div>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b border-gray-100 items-center hover:bg-gray-50 transition"
                >
                  <div className="col-span-12 md:col-span-6 flex items-center gap-4">
                    <img
                      src={fullImage(item)}
                      className="w-20 h-24 object-cover border rounded bg-white"
                      alt=""
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/400x600?text=Lỗi';
                      }}
                    />
                    <div>
                      <Link
                        to={`/books/${item.book_id}`}
                        className="font-medium text-gray-800 line-clamp-2 mb-1 text-sm md:text-base hover:text-blue-600"
                      >
                        {item.title}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-red-500 hover:underline flex items-center gap-1 mt-1 bg-transparent border-0 p-0 cursor-pointer"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                  <div className="col-span-6 md:col-span-2 text-left md:text-center font-medium text-gray-800">
                    <span className="md:hidden text-gray-500 text-xs">Giá: </span>
                    {formatPrice(resolvePrice(item))}đ
                  </div>
                  <div className="col-span-6 md:col-span-2 flex justify-end md:justify-center">
                    <div className="flex items-center border border-gray-300 rounded h-8 bg-white">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, Math.max(1, resolveQuantity(item) - 1))}
                        disabled={resolveQuantity(item) <= 1}
                        className="w-8 h-full hover:bg-gray-100 text-gray-600 font-bold disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-bold text-gray-700 text-sm leading-8">{resolveQuantity(item)}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, resolveQuantity(item) + 1)}
                        className="w-8 h-full hover:bg-gray-100 text-gray-600 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-2 text-right md:text-center font-bold text-[#C92127]">
                    <span className="md:hidden text-gray-500 font-normal">Tổng: </span>
                    {formatPrice(resolvePrice(item) * resolveQuantity(item))}đ
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full lg:w-[350px] shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24 border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b">Tóm Tắt Đơn Hàng</h3>
                <div className="flex justify-between mb-3 text-gray-600 text-sm">
                  <span>Tạm tính:</span>
                  <span className="font-bold">{formatPrice(totalPrice)}đ</span>
                </div>
                <div className="border-t border-dashed my-4" />
                <div className="flex justify-between mb-6 items-end">
                  <span className="font-bold text-gray-800">Tổng cộng:</span>
                  <div className="text-right">
                    <span className="block font-bold text-[#C92127] text-xl">{formatPrice(totalPrice)}đ</span>
                    <span className="text-xs text-gray-500">(Đã bao gồm VAT)</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="block w-full bg-[#C92127] text-white text-center font-bold py-3 rounded-lg hover:bg-red-700 shadow-lg uppercase"
                >
                  Tiến Hành Thanh Toán
                </button>
                <Link to="/" className="block text-center text-blue-600 hover:underline mt-4 text-sm font-medium">
                  ← Tiếp Tục Mua Sắm
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
