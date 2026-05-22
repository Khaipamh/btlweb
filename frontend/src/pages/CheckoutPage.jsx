import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCartStore } from '@/stores/cartStore';
import { cartTotalPrice } from '@/utils/cartTotals';
import api from '@/services/api';
import { getPaymentQrImageUrl } from '@/constants/paymentConfig';

const formatPrice = (value) => new Intl.NumberFormat('vi-VN').format(value);

export default function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [isLoading, setIsLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({});
  const [saveToAddressBook, setSaveToAddressBook] = useState(false);
  const [myAddresses, setMyAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    district: '',
    ward: '',
    address: '',
    payment: 'sepay',
  });
  const [locations, setLocations] = useState({ cities: [], districts: [], wards: [] });
  const [errors, setErrors] = useState({
    name: false,
    phone: false,
    city: false,
    district: false,
    ward: false,
    address: false,
  });
  const shippingFee = 30000;
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState('');
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

  const subtotal = cartTotalPrice(items);

  const voucherDiscount = useMemo(() => {
    if (!appliedVoucher) return 0;
    const { discount_type, value } = appliedVoucher;
    const orderValue = subtotal;
    if (discount_type === 'fixed') return Math.min(Number(value), orderValue);
    if (discount_type === 'percentage') return (orderValue * Number(value)) / 100;
    return 0;
  }, [appliedVoucher, subtotal]);

  const finalTotal = useMemo(() => {
    const total = subtotal + shippingFee - voucherDiscount;
    return total > 0 ? total : 0;
  }, [subtotal, voucherDiscount]);

  const fetchMyAddresses = async () => {
    try {
      const res = await api.get('/api/addresses');
      const list = res || [];
      setMyAddresses(Array.isArray(list) ? list : []);
      const defaultAddr = list.find((a) => a.is_default);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.address_id);
        setForm((f) => ({
          ...f,
          name: defaultAddr.recipient_name,
          phone: defaultAddr.phone,
          address: defaultAddr.address_detail,
          city: '',
          district: '',
          ward: '',
        }));
      }
    } catch (e) {
      console.error('Lỗi lấy địa chỉ', e);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await axios.get('https://provinces.open-api.vn/api/?depth=1');
      setLocations((l) => ({ ...l, cities: res.data }));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCities();
    fetchMyAddresses();
  }, []);

  const onSelectAddress = (id) => {
    setSelectedAddressId(id);
    if (id) {
      const addr = myAddresses.find((a) => a.address_id === id);
      if (addr) {
        setForm((f) => ({
          ...f,
          name: addr.recipient_name,
          phone: addr.phone,
          address: addr.address_detail,
          city: '',
          district: '',
          ward: '',
        }));
      }
    } else {
      setForm((f) => ({ ...f, name: '', phone: '', address: '' }));
    }
  };

  const onCityChange = async (code) => {
    setForm((f) => ({ ...f, city: code, district: '', ward: '' }));
    setLocations((l) => ({ ...l, districts: [], wards: [] }));
    if (!code) return;
    const res = await axios.get(`https://provinces.open-api.vn/api/p/${code}?depth=2`);
    setLocations((l) => ({ ...l, districts: res.data.districts }));
  };

  const onDistrictChange = async (code) => {
    setForm((f) => ({ ...f, district: code, ward: '' }));
    setLocations((l) => ({ ...l, wards: [] }));
    if (!code) return;
    const res = await axios.get(`https://provinces.open-api.vn/api/d/${code}?depth=2`);
    setLocations((l) => ({ ...l, wards: res.data.wards }));
  };

  const applyVoucher = async () => {
    if (!voucherCode) return;
    setIsApplyingVoucher(true);
    setVoucherError('');
    setVoucherSuccess('');
    try {
      const res = await api.post('/api/vouchers/check', {
        code: voucherCode,
        orderValue: subtotal,
      });
      setAppliedVoucher(res);
      setVoucherSuccess('Áp dụng mã thành công!');
    } catch (error) {
      setAppliedVoucher(null);
      setVoucherError(error.response?.data?.message || 'Lỗi khi áp dụng mã.');
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const submitOrder = async () => {
    if (!selectedAddressId) {
      if (!form.name || !form.phone || !form.city || !form.address) {
        alert('Vui lòng điền đầy đủ thông tin địa chỉ!');
        return;
      }
    } else if (!form.name || !form.phone) {
      alert('Thông tin người nhận bị thiếu!');
      return;
    }

    let finalAddress = form.address;
    if (!selectedAddressId) {
      const c = locations.cities.find((x) => String(x.code) === String(form.city))?.name || '';
      const d = locations.districts.find((x) => String(x.code) === String(form.district))?.name || '';
      const w = locations.wards.find((x) => String(x.code) === String(form.ward))?.name || '';
      finalAddress = `${form.address}, ${w}, ${d}, ${c}`;
    }

    setIsLoading(true);
    try {
      if (saveToAddressBook && !selectedAddressId) {
        try {
          await api.post('/api/addresses', {
            recipient_name: form.name,
            phone: form.phone,
            address_detail: finalAddress,
            is_default: myAddresses.length === 0,
          });
        } catch (e) {
          console.error('Lỗi lưu địa chỉ:', e);
        }
      }

      const res = await api.post('/api/orders', {
        address_id: selectedAddressId || null,
        recipient_name: form.name,
        phone: form.phone,
        address_detail: finalAddress,
        payment_method: form.payment,
        voucher_code: appliedVoucher?.code || null,
      });

      if (res) {
        if (['sepay', 'bank_transfer'].includes(form.payment)) {
          const info = res.payment_info || {};
          setPaymentInfo({
            amount: info.amount ?? res.final_amount,
            content: info.content || `SAHAFA ${res.order_id}`,
          });
          setShowQRModal(true);
        } else {
          alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
          clearCart();
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Lỗi Đặt Hàng:', error);
      alert(error.response?.data?.message || 'Lỗi hệ thống. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const finishPayment = () => {
    setShowQRModal(false);
    clearCart();
    alert('Đơn hàng đang chờ xử lý. Cảm ơn bạn!');
    navigate('/');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-800 uppercase text-sm">Địa chỉ giao hàng</h2>
                {myAddresses.length > 0 ? (
                  <select
                    value={selectedAddressId ?? ''}
                    onChange={(e) => onSelectAddress(e.target.value ? Number(e.target.value) : null)}
                    className="text-sm border border-pink-300 text-pink-600 rounded px-2 py-1 outline-none bg-pink-50 cursor-pointer"
                  >
                    <option value="">-- Nhập địa chỉ mới --</option>
                    {myAddresses.map((addr) => (
                      <option key={addr.address_id} value={addr.address_id}>
                        {addr.recipient_name} - {addr.phone} {addr.is_default ? '(Mặc định)' : ''}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      disabled={!!selectedAddressId}
                      className="input-field"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      disabled={!!selectedAddressId}
                      className="input-field"
                    />
                  </div>
                </div>
                {!selectedAddressId ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-gray-600">Tỉnh/Thành phố *</label>
                      <select
                        value={form.city}
                        onChange={(e) => onCityChange(e.target.value)}
                        className="input-field"
                      >
                        <option value="">Chọn Tỉnh/Thành phố</option>
                        {locations.cities.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-gray-600">Quận/Huyện *</label>
                      <select
                        value={form.district}
                        onChange={(e) => onDistrictChange(e.target.value)}
                        className="input-field"
                        disabled={!form.city}
                      >
                        <option value="">Chọn Quận/Huyện</option>
                        {locations.districts.map((d) => (
                          <option key={d.code} value={d.code}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-gray-600">Phường/Xã *</label>
                      <select
                        value={form.ward}
                        onChange={(e) => setForm((f) => ({ ...f, ward: e.target.value }))}
                        className="input-field"
                        disabled={!form.district}
                      >
                        <option value="">Chọn Phường/Xã</option>
                        {locations.wards.map((w) => (
                          <option key={w.code} value={w.code}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : null}
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-600">Địa chỉ chi tiết *</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    disabled={!!selectedAddressId}
                    className="input-field"
                  />
                </div>
                {!selectedAddressId ? (
                  <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveToAddressBook}
                      onChange={(e) => setSaveToAddressBook(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Lưu vào sổ địa chỉ cho lần sau
                  </label>
                ) : null}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4 uppercase text-sm">Phương thức vận chuyển</h2>
              <div className="border rounded p-4 flex justify-between items-center bg-pink-50 border-pink-200">
                <div>
                  <p className="font-bold text-gray-800">Giao hàng tiêu chuẩn</p>
                  <p className="text-sm text-gray-500">Dự kiến giao hàng: 3 - 5 ngày</p>
                </div>
                <span className="font-bold text-pink-600">30.000đ</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4 uppercase text-sm">Phương thức thanh toán</h2>
              <div className="flex flex-col gap-3">
                <label
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${
                    form.payment === 'sepay' ? 'border-pink-500 bg-pink-50' : ''
                  }`}
                >
                  <input
                    type="radio"
                    value="sepay"
                    checked={form.payment === 'sepay'}
                    onChange={() => setForm((f) => ({ ...f, payment: 'sepay' }))}
                    className="w-5 h-5"
                  />
                  <span className="text-gray-700 font-medium">Chuyển khoản ngân hàng (Mã QR)</span>
                </label>
                <label
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${
                    form.payment === 'cod' ? 'border-pink-500 bg-pink-50' : ''
                  }`}
                >
                  <input
                    type="radio"
                    value="cod"
                    checked={form.payment === 'cod'}
                    onChange={() => setForm((f) => ({ ...f, payment: 'cod' }))}
                    className="w-5 h-5"
                  />
                  <span className="text-gray-700 font-medium">Thanh toán khi nhận hàng (COD)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-20 border border-gray-100">
              <h2 className="font-bold text-gray-800 mb-4 uppercase text-sm border-b pb-2">
                Đơn hàng ({items.reduce((a, i) => a + i.quantity, 0)} sản phẩm)
              </h2>
              <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 relative">
                    <div className="relative">
                      <img src={item.image || 'https://via.placeholder.com/60'} className="w-16 h-20 object-cover border rounded shrink-0" alt="" />
                      <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-700 line-clamp-2">{item.title}</h3>
                      <p className="font-bold text-[#db2777] mt-1">{formatPrice(item.price * item.quantity)}đ</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed my-4" />
              <div className="space-y-2 mb-4">
                <div className="flex gap-2">
                  <input
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Nhập mã giảm giá"
                    disabled={!!appliedVoucher}
                    className="input-field flex-grow text-sm"
                  />
                  <button
                    type="button"
                    onClick={applyVoucher}
                    disabled={!voucherCode || !!appliedVoucher || isApplyingVoucher}
                    className="bg-pink-600 text-white px-4 rounded-lg font-bold text-sm hover:bg-pink-700 disabled:opacity-50"
                  >
                    {isApplyingVoucher ? '...' : 'Áp dụng'}
                  </button>
                </div>
                {voucherError ? <p className="text-red-500 text-xs">{voucherError}</p> : null}
                {voucherSuccess ? <p className="text-green-600 text-xs">{voucherSuccess}</p> : null}
              </div>
              <div className="bg-gray-50 p-3 rounded space-y-2 text-sm text-gray-600 border border-gray-100">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span className="font-medium">{formatPrice(subtotal)}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium">{formatPrice(shippingFee)}đ</span>
                </div>
                {voucherDiscount > 0 ? (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span className="font-medium">-{formatPrice(voucherDiscount)}đ</span>
                  </div>
                ) : null}
              </div>
              <div className="flex justify-between items-end text-xl font-bold text-[#C92127] pt-4 mt-2 border-t">
                <span className="text-base text-gray-800">Tổng thanh toán</span>
                <span>{formatPrice(finalTotal)}đ</span>
              </div>
              <button
                type="button"
                onClick={submitOrder}
                disabled={isLoading}
                className="w-full bg-[#C92127] text-white font-bold py-3.5 rounded-lg mt-6 hover:bg-red-700 transition shadow-lg uppercase disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                {isLoading ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showQRModal ? (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-pink-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Quét mã để thanh toán</h3>
              <button type="button" onClick={finishPayment} className="text-white/80 hover:text-white text-2xl">
                ×
              </button>
            </div>
            <div className="p-6 text-center space-y-4">
              <img
                src={getPaymentQrImageUrl(paymentInfo)}
                className="w-64 h-64 object-contain mx-auto border-2 border-pink-100 rounded-lg"
                alt="Mã QR thanh toán"
              />
              <div className="bg-gray-50 p-4 rounded-lg text-left text-sm space-y-3 border border-gray-200">
                <div className="flex justify-between">
                  <span>Số tiền:</span>
                  <span className="font-bold text-pink-600">{formatPrice(paymentInfo.amount)}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Nội dung:</span>
                  <span className="font-bold text-red-600">{paymentInfo.content}</span>
                </div>
              </div>
              <button type="button" onClick={finishPayment} className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg">
                Tôi đã thanh toán xong
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        .input-field { width: 100%; padding: 0.5rem 1rem; border: 1px solid #d1d5db; border-radius: 0.5rem; outline: none; }
        .input-field:disabled { background-color: #f3f4f6; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
