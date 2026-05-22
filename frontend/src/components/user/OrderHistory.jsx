import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import {
  formatOrderStatus,
  formatPaymentMethod,
  formatPaymentStatus,
  orderStatusClass,
  paymentStatusClass,
} from '@/utils/orderStatus';

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const STATUS_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'shipped', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã hủy' },
];

function getBookImage(item) {
  const url = item?.Book?.BookImages?.[0]?.book_image_url;
  return url || 'https://placehold.co/80x120?text=Sach';
}

export default function OrderHistory({ embedded = false }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/orders/my-orders', {
        params: { page, limit: 8, status: statusFilter },
      });
      const list = Array.isArray(res) ? res : [];
      setOrders(list);
      setTotal(res.meta?.total ?? list.length);
      setTotalPages(res.meta?.totalPages ?? 1);
    } catch {
      setOrders([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const toggleExpand = (orderId) => {
    setExpandedId((id) => (id === orderId ? null : orderId));
  };

  return (
    <div className={embedded ? '' : 'space-y-6'}>
      {!embedded ? (
        <p className="text-gray-500 text-sm">Theo dõi trạng thái và chi tiết các đơn hàng bạn đã đặt tại Sahafa.</p>
      ) : null}

      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
              statusFilter === f.value
                ? 'bg-pink-600 text-white border-pink-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-pink-600 rounded-full" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào{statusFilter !== 'all' ? ' với trạng thái này' : ''}.</p>
          <Link
            to="/books"
            className="inline-block bg-pink-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-pink-700 transition"
          >
            Mua sách ngay
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => {
            const items = order.OrderItems || [];
            const tx = order.Transactions?.[0] || order.Transaction;
            const paymentMethod = tx?.payment_method;
            const isExpanded = expandedId === order.order_id;

            return (
              <li key={order.order_id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleExpand(order.order_id)}
                  className="w-full text-left p-4 md:p-5 hover:bg-gray-50/80 transition flex flex-col md:flex-row md:items-center gap-4 border-0 bg-transparent cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold text-gray-900">Đơn #{order.order_id}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${orderStatusClass(order.order_status)}`}>
                        {formatOrderStatus(order.order_status)}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${paymentStatusClass(order.payment_status)}`}>
                        {formatPaymentStatus(order.payment_status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {items.length} sản phẩm
                      {paymentMethod ? ` · ${formatPaymentMethod(paymentMethod)}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0">
                    <span className="text-lg font-bold text-[#C92127]">{formatCurrency(order.final_amount)}</span>
                    <span className="text-xs text-pink-600 font-medium">{isExpanded ? 'Thu gọn ▲' : 'Chi tiết ▼'}</span>
                  </div>
                </button>

                {isExpanded ? (
                  <div className="border-t border-gray-100 bg-gray-50/50 px-4 md:px-5 pb-5">
                    {order.Address ? (
                      <div className="py-3 text-sm text-gray-600 border-b border-gray-100 mb-3">
                        <span className="font-semibold text-gray-800">Giao đến: </span>
                        {order.Address.recipient_name} — {order.Address.phone}
                        <br />
                        {order.Address.address_detail}
                      </div>
                    ) : null}

                    <ul className="space-y-3">
                      {items.map((item) => (
                        <li key={item.order_item_id} className="flex gap-3 bg-white rounded-lg p-3 border border-gray-100">
                          <img
                            src={getBookImage(item)}
                            alt=""
                            className="w-14 h-20 object-cover rounded border shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/books/${item.Book?.book_slug || item.book_id}`}
                              className="font-medium text-gray-800 hover:text-pink-600 line-clamp-2 text-sm"
                            >
                              {item.Book?.book_title || 'Sách'}
                            </Link>
                            <p className="text-xs text-gray-500 mt-1">
                              SL: {item.quantity} × {formatCurrency(item.unit_price)}
                            </p>
                          </div>
                          <span className="font-bold text-sm text-gray-800 shrink-0">
                            {formatCurrency(item.subtotal)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 pt-3 border-t border-dashed border-gray-200 space-y-1 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Tạm tính</span>
                        <span>{formatCurrency(order.total_amount)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900">
                        <span>Thanh toán</span>
                        <span className="text-[#C92127]">{formatCurrency(order.final_amount)}</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {!loading && totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded border text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            Trước
          </button>
          <span className="text-sm text-gray-600">
            Trang {page}/{totalPages} ({total} đơn)
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded border text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      ) : null}
    </div>
  );
}
