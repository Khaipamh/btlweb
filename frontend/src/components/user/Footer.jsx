import { Link } from 'react-router-dom';
import { useUiStore } from '@/stores/uiStore';

export default function Footer() {
  const openLoginModal = useUiStore((s) => s.openLoginModal);

  return (
    <footer className="bg-white border-t border-gray-200 mt-10 pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-600">
          <div>
            <div className="text-3xl font-bold text-pink-600 mb-4 tracking-tighter flex items-center">
              Poiseidon<span className="text-yellow-400">.com</span>
            </div>
            <div className="space-y-3">
              <p className="font-bold text-gray-800 uppercase">Công Ty Cổ Phần Phát Hành Sách Poiseidon</p>
              <p>Địa chỉ: Hà Nội</p>
              <p className="leading-relaxed">
                Poiseidon.com nhận đặt hàng trực tuyến và giao hàng tận nơi. KHÔNG hỗ trợ đặt mua và nhận hàng trực tiếp tại văn phòng.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 uppercase mb-4 text-base">DỊCH VỤ</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/policy/dieu-khoan-su-dung" className="hover:text-pink-600 transition">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link to="/policy/chinh-sach-bao-mat" className="hover:text-pink-600 transition">
                  Chính sách bảo mật thông tin cá nhân
                </Link>
              </li>
              <li>
                <Link to="/policy/bao-mat-thanh-toan" className="hover:text-pink-600 transition">
                  Chính sách bảo mật thanh toán
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-pink-600 transition">
                  Giới thiệu Poiseidon
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-pink-600 transition">
                  Tin tức & Sự kiện (Blog)
                </Link>
              </li>
              <li>
                <Link to="/store-system" className="hover:text-pink-600 transition">
                  Hệ thống nhà sách
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 uppercase mb-4 text-base">TÀI KHOẢN CỦA TÔI</h3>
            <ul className="space-y-2 mb-6">
              <li>
                <button
                  type="button"
                  onClick={() => openLoginModal('login')}
                  className="hover:text-pink-600 transition cursor-pointer text-left bg-transparent border-0 p-0 text-sm text-gray-600"
                >
                  Đăng nhập / Tạo mới tài khoản
                </button>
              </li>
              <li>
                <Link to="/user/profile?tab=address" className="hover:text-pink-600 transition">
                  Thay đổi địa chỉ khách hàng
                </Link>
              </li>
              <li>
                <Link to="/user/profile?tab=profile" className="hover:text-pink-600 transition">
                  Chi tiết tài khoản
                </Link>
              </li>
              <li>
                <Link to="/user/orders" className="hover:text-pink-600 transition">
                  Lịch sử mua hàng
                </Link>
              </li>
            </ul>

            <h3 className="font-bold text-gray-800 uppercase mb-3 text-base">LIÊN HỆ</h3>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                cskh@poiseidon.dungcan.id.vn
              </p>
              <p className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                1900 636469
              </p>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-gray-400 text-xs mb-1">
            Giấy chứng nhận Đăng ký Kinh doanh số 0123456789 do Sở Kế hoạch và Đầu tư Thành phố Hà Nội cấp ngày 20/12/2025
          </p>
          <p className="text-gray-500 text-xs font-medium">&copy; 2025 Poiseidon.com - All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
}
