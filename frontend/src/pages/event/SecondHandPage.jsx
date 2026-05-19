import { Link } from 'react-router-dom';

export default function SecondHandPage() {
  return (
    <div className="bg-teal-50 min-h-screen py-12 px-4 text-center">
      <h1 className="text-3xl font-bold text-teal-900 mb-4">Sách cũ giá tốt</h1>
      <p className="text-gray-700 mb-6">Khám phá sách đã qua sử dụng với giá ưu đãi.</p>
      <Link to="/books?category=sách" className="text-blue-600 font-bold">
        Xem danh sách sách
      </Link>
    </div>
  );
}
