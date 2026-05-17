import { Link } from 'react-router-dom';

export default function GiftCardPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Gift Card Sahafa</h1>
      <p className="text-gray-600 mb-8">Mua phiếu quà tặng cho người thân.</p>
      <Link to="/" className="text-blue-600 font-bold hover:underline">
        Về trang chủ
      </Link>
    </div>
  );
}
