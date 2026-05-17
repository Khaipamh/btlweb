import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { message } from 'antd';
import { useAuthStore } from '@/stores/authStore';
import api from '@/services/api';

export default function UserProfile() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ full_name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [pwd, setPwd] = useState({ old: '', new1: '', new2: '' });
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      setProfile({ full_name: user.full_name || '', phone: user.phone || '' });
    }
  }, [user]);

  const loadAddresses = async () => {
    try {
      const res = await api.get('/api/addresses');
      setAddresses(Array.isArray(res) ? res : []);
    } catch {
      setAddresses([]);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await api.get('/api/orders/my-orders', { params: { page: 1, limit: 20 } });
      const list = res?.data ?? res ?? [];
      setOrders(Array.isArray(list) ? list : []);
    } catch {
      setOrders([]);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (tab === 'address') loadAddresses();
    if (tab === 'orders') loadOrders();
  }, [tab, user]);

  if (!user) return <Navigate to="/" replace />;

  const saveProfile = async () => {
    setLoading(true);
    setMsg('');
    try {
      await api.put('/api/auth/me', { full_name: profile.full_name, phone: profile.phone });
      setUser({ ...user, full_name: profile.full_name, phone: profile.phone });
      setMsg('Đã lưu thành công.');
    } catch (e) {
      setMsg(e.response?.data?.message || 'Lỗi lưu hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (pwd.new1 !== pwd.new2) {
      message.warning('Mật khẩu mới không khớp');
      return;
    }
    try {
      await api.post('/api/auth/change-password', { oldPassword: pwd.old, newPassword: pwd.new1 });
      message.success('Đổi mật khẩu thành công');
      setPwd({ old: '', new1: '', new2: '' });
    } catch (e) {
      message.error(e.response?.data?.message || 'Lỗi đổi mật khẩu');
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-12">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <img
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}`}
                className="w-12 h-12 rounded-full object-cover border"
                alt=""
              />
              <div>
                <p className="text-xs text-gray-500">Tài khoản của</p>
                <p className="font-bold text-gray-800 truncate">{user.full_name}</p>
              </div>
            </div>
            <ul className="flex flex-col gap-2 text-sm">
              {['profile', 'address', 'orders'].map((t) => (
                <li key={t}>
                  <button
                    type="button"
                    onClick={() => setTab(t)}
                    className={`w-full text-left p-2 rounded cursor-pointer border-0 ${
                      tab === t ? 'font-bold text-[#C92127] bg-red-50' : 'text-gray-600 hover:text-[#C92127]'
                    }`}
                  >
                    {t === 'profile' ? 'Hồ Sơ Của Tôi' : t === 'address' ? 'Sổ Địa Chỉ' : 'Đơn Hàng Của Tôi'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="w-full md:w-3/4 bg-white rounded-lg shadow-sm p-8 border border-gray-100 min-h-[500px]">
          {tab === 'profile' ? (
            <div>
              <h1 className="text-2xl font-light text-gray-800 mb-6 border-b pb-4">Hồ Sơ Của Tôi</h1>
              <div className="flex flex-col gap-4 max-w-lg">
                <label className="text-sm text-gray-600">Họ Tên</label>
                <input
                  className="border border-gray-300 px-4 py-2 rounded"
                  value={profile.full_name}
                  onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                />
                <label className="text-sm text-gray-600">Số Điện Thoại</label>
                <input
                  className="border border-gray-300 px-4 py-2 rounded"
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={saveProfile}
                  className="bg-[#C92127] text-white px-8 py-2 rounded font-bold w-fit disabled:opacity-50"
                >
                  {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
                {msg ? <p className={msg.includes('Lỗi') ? 'text-red-600' : 'text-green-600'}>{msg}</p> : null}
              </div>
              <div className="mt-10 border-t pt-6">
                <h2 className="font-bold mb-4">Đổi mật khẩu</h2>
                <div className="flex flex-col gap-3 max-w-lg">
                  <input type="password" placeholder="Mật khẩu cũ" className="border rounded px-3 py-2" value={pwd.old} onChange={(e) => setPwd((p) => ({ ...p, old: e.target.value }))} />
                  <input type="password" placeholder="Mật khẩu mới" className="border rounded px-3 py-2" value={pwd.new1} onChange={(e) => setPwd((p) => ({ ...p, new1: e.target.value }))} />
                  <input type="password" placeholder="Nhập lại mật khẩu mới" className="border rounded px-3 py-2" value={pwd.new2} onChange={(e) => setPwd((p) => ({ ...p, new2: e.target.value }))} />
                  <button type="button" onClick={changePassword} className="bg-gray-700 text-white px-6 py-2 rounded font-bold w-fit">
                    Đổi mật khẩu
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          {tab === 'address' ? (
            <div>
              <h1 className="text-2xl font-bold mb-4">Sổ địa chỉ</h1>
              <ul className="space-y-2">
                {addresses.map((a) => (
                  <li key={a.address_id} className="border rounded p-3 text-sm">
                    <strong>{a.recipient_name}</strong> — {a.phone}
                    <br />
                    {a.address_detail}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {tab === 'orders' ? (
            <div>
              <h1 className="text-2xl font-bold mb-4">Đơn hàng</h1>
              <ul className="space-y-2 text-sm">
                {orders.map((o) => (
                  <li key={o.order_id} className="border rounded p-3 flex justify-between">
                    <span>#{o.order_id}</span>
                    <span>{o.order_status}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
