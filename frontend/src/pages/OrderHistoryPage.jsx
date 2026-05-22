import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import OrderHistory from '@/components/user/OrderHistory';

export default function OrderHistoryPage() {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="container mx-auto py-10 px-4 md:px-8 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Lịch sử mua hàng</h1>
      <OrderHistory />
    </div>
  );
}
