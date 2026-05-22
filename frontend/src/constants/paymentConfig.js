/**
 * Cấu hình QR thanh toán
 *
 * mode: 'sepay'  → QR động theo số tiền & nội dung chuyển khoản (Sepay)
 * mode: 'static' → Dùng 1 ảnh QR cố định (đặt file vào frontend/public/payment/)
 */
export const PAYMENT_QR_CONFIG = {
  mode: 'sepay',

  /** Ảnh QR tĩnh — chỉ dùng khi mode = 'static' */
  staticImageUrl: '/payment/qr-thanh-toan.png',

  /** Sepay — đổi bank & số tài khoản tại đây khi mode = 'sepay' */
  sepay: {
    bank: 'VietinBank',
    account: '105879669225',
    template: 'qronly',
    baseUrl: 'https://qr.sepay.vn/img',
  },
};

/**
 * @param {{ amount?: number|string, content?: string }} paymentInfo
 * @returns {string} URL ảnh QR hiển thị trên modal thanh toán
 */
export function getPaymentQrImageUrl(paymentInfo = {}) {
  if (PAYMENT_QR_CONFIG.mode === 'static') {
    return PAYMENT_QR_CONFIG.staticImageUrl;
  }

  const { bank, account, template, baseUrl } = PAYMENT_QR_CONFIG.sepay;
  const amount = paymentInfo.amount ?? '';
  const des = encodeURIComponent(paymentInfo.content || '');
  const params = new URLSearchParams({
    bank,
    acc: account,
    template,
    amount: String(amount),
    des,
  });

  return `${baseUrl}?${params.toString()}`;
}
