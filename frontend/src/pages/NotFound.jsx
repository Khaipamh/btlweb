import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="max-w-md">
        <h1 className="text-9xl font-bold text-[#C92127]">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-2">Trang không tìm thấy</h2>
        <p className="text-gray-600 mb-8">Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 transition-colors duration-200"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
