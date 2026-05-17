import { Link } from 'react-router-dom';

export default function AttendancePage() {
  return (
    <div className="bg-blue-50 min-h-screen py-16 px-4 text-center">
      <h1 className="text-3xl font-bold text-blue-800 mb-4">Điểm danh nhận quà</h1>
      <p className="text-gray-600 mb-8">Chương trình đang được cập nhật.</p>
      <Link to="/" className="text-blue-600 font-bold">
        Về trang chủ
      </Link>
    </div>
  );
}
