export const ORDER_STATUS_LABELS = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

export const PAYMENT_STATUS_LABELS = {
  unpaid: 'Chưa thanh toán',
  paid: 'Đã thanh toán',
  refunded: 'Đã hoàn tiền',
};

export const PAYMENT_METHOD_LABELS = {
  COD: 'Thanh toán khi nhận hàng',
  cod: 'Thanh toán khi nhận hàng',
  bank_transfer: 'Chuyển khoản / QR',
};

export function formatOrderStatus(status) {
  return ORDER_STATUS_LABELS[status] || status || '—';
}

export function formatPaymentStatus(status) {
  return PAYMENT_STATUS_LABELS[status] || status || '—';
}

export function formatPaymentMethod(method) {
  if (!method) return '—';
  return PAYMENT_METHOD_LABELS[method] || method;
}

export function orderStatusClass(status) {
  const map = {
    pending: 'bg-amber-100 text-amber-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-600',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
}

export function paymentStatusClass(status) {
  const map = {
    unpaid: 'bg-orange-100 text-orange-800',
    paid: 'bg-green-100 text-green-800',
    refunded: 'bg-purple-100 text-purple-800',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
}
