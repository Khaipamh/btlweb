/**
 * Ảnh banner sự kiện mùa hè — 1/6 & 6/6
 * Import qua Vite (không dùng đường dẫn ổ D:\... — trình duyệt không đọc được).
 */
import motsauBanner from '../../../images/motsau.png';
import saleheBanner from '../../../images/salehe.png';

export const EVENT_BANNERS = {
  /** Banner 1/6 — Quốc tế Thiếu nhi */
  childrenDay16: motsauBanner,
  /** Banner siêu sale 6/6 mùa hè */
  summerSale66: saleheBanner,
  /** Sale sách mùa hè */
  summerBooksSale: saleheBanner,
  /** Promo 1/6 */
  sidePromoSummer: motsauBanner,
  /** Promo 6/6 */
  sidePromo66: saleheBanner,
};
