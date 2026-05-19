import { Link } from 'react-router-dom';

export default function VoucherPage() {
  return (
    <div className="bg-orange-50 min-h-screen py-10 px-4 text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Mã giảm giá</h1>
      <p className="text-gray-600 mb-8">Nhập mã tại bước thanh toán để được ưu đãi.</p>
      <Link to="/checkout" className="text-blue-600 font-bold hover:underline">
        Đi tới thanh toán
      </Link>
    </div>
  );
}
