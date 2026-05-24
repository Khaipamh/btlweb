import { useEffect, useState } from 'react';
import { message } from 'antd';
import { useAuthStore } from '@/stores/authStore';
import api from '@/services/api';

export default function LoginModal({ initialTab = 'login', onClose }) {
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const authError = useAuthStore((s) => s.error);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [tempPasswordResult, setTempPasswordResult] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ full_name: '', email: '', password: '' });

  useEffect(() => {
    setActiveTab(initialTab);
    setForgotEmail('');
    setTempPasswordResult('');
  }, [initialTab]);

  const handleClose = () => onClose();

  const resetForgotState = () => {
    setForgotEmail('');
    setTempPasswordResult('');
  };

  const switchToForgot = () => {
    setActiveTab('forgot');
    resetForgotState();
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      message.warning('Vui lòng nhập email');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/auth/forgot-password', { email: forgotEmail });
      if (res && res.success) {
        setTempPasswordResult(res.newPassword || res.data?.newPassword || '');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Email không tồn tại hoặc lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const autoLoginWithNewPassword = () => {
    setLoginForm((f) => ({ ...f, email: forgotEmail, password: tempPasswordResult }));
    setActiveTab('login');
    setTimeout(() => resetForgotState(), 500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await login(loginForm.email, loginForm.password);
      if (success) {
        message.success('Đăng nhập thành công!');
        handleClose();
      } else {
        message.error(authError || 'Đăng nhập thất bại');
      }
    } catch {
      message.error('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/;
    if (registerForm.password.length < 8) {
      message.warning('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    if (!passwordRegex.test(registerForm.password)) {
      message.warning('Mật khẩu cần chữ hoa, chữ thường, số và ký tự đặc biệt (vd: Abc12345!)');
      return;
    }
    setLoading(true);
    try {
      const success = await register(registerForm);
      const errMsg = useAuthStore.getState().error;
      if (success) {
        message.success('Đăng ký và đăng nhập thành công!');
        handleClose();
      } else {
        message.error(errMsg || authError || 'Đăng ký thất bại');
      }
    } catch {
      message.error('Lỗi kết nối server. Kiểm tra backend đang chạy tại cổng 3000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden relative animate-fade-in">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {activeTab !== 'forgot' ? (
          <div className="flex border-b">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-4 font-bold text-center transition relative ${
                activeTab === 'login' ? 'text-pink-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Đăng nhập
              {activeTab === 'login' ? <div className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-600" /> : null}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-4 font-bold text-center transition relative ${
                activeTab === 'register' ? 'text-pink-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Đăng ký
              {activeTab === 'register' ? <div className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-600" /> : null}
            </button>
          </div>
        ) : (
          <div className="py-4 border-b text-center font-bold text-gray-800 text-lg relative bg-gray-50">
            {!tempPasswordResult ? (
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-pink-600 text-sm flex items-center gap-1 font-normal"
              >
                ← Quay lại
              </button>
            ) : null}
            {tempPasswordResult ? 'Cấp Lại Thành Công' : 'Khôi Phục Mật Khẩu'}
          </div>
        )}

        <div className="p-6">
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-1">Email</label>
                <input
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                  type="email"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none focus:border-pink-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-1">Mật khẩu</label>
                <div className="relative">
                  <input
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none focus:border-pink-500 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-pink-600"
                  >
                    {showPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
                <div className="text-right mt-1">
                  <button type="button" onClick={switchToForgot} className="text-xs text-red-500 hover:underline">
                    Quên mật khẩu?
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-pink-600 text-white font-bold py-2.5 rounded-md hover:bg-pink-700 transition shadow-md disabled:bg-pink-300 mt-2"
              >
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </form>
          ) : null}

          {activeTab === 'register' ? (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-1">Họ và tên</label>
                <input
                  value={registerForm.full_name}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, full_name: e.target.value }))}
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none focus:border-pink-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-1">Email</label>
                <input
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))}
                  type="email"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none focus:border-pink-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-1">Mật khẩu</label>
                <div className="relative">
                  <input
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))}
                    type={showRegisterPassword ? 'text' : 'password'}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none focus:border-pink-500 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-pink-600"
                  >
                    {showRegisterPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt (vd: <strong>Abc12345!</strong>)
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-pink-600 text-white font-bold py-2.5 rounded-md hover:bg-pink-700 transition shadow-md disabled:bg-pink-300 mt-2"
              >
                {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
              </button>
            </form>
          ) : null}

          {activeTab === 'forgot' ? (
            <div>
              {!tempPasswordResult ? (
                <form onSubmit={(e) => { e.preventDefault(); handleForgotPassword(); }} className="flex flex-col gap-4">
                  <p className="text-sm text-gray-600 text-center mb-2">
                    Nhập email đã đăng ký để hệ thống cấp lại mật khẩu ngẫu nhiên mới cho bạn.
                  </p>
                  <div>
                    <label className="block text-gray-600 text-sm font-medium mb-1">Email của bạn</label>
                    <input
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      type="email"
                      className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none focus:border-pink-500 transition"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-red-600 text-white font-bold py-2.5 rounded-md hover:bg-red-700 transition shadow-md disabled:bg-red-300 mt-2"
                  >
                    {loading ? 'Đang xử lý...' : 'Lấy Lại Mật Khẩu'}
                  </button>
                </form>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">✓</div>
                  <p className="text-gray-800 font-bold">Thành công!</p>
                  <p className="text-sm text-gray-600">Mật khẩu mới của bạn là:</p>
                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg py-3 px-6 text-xl font-mono font-bold text-red-600 w-full break-all">
                    {tempPasswordResult}
                  </div>
                  <button
                    type="button"
                    onClick={autoLoginWithNewPassword}
                    className="w-full bg-pink-600 text-white font-bold py-2.5 rounded-md hover:bg-pink-700 transition shadow-md mt-2"
                  >
                    Đăng Nhập Ngay
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {activeTab !== 'forgot' || !tempPasswordResult ? (
            <div className="mt-6 text-center text-xs text-gray-500">
              Bằng việc tiếp tục, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của Poiseidon.
            </div>
          ) : null}
        </div>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.2s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
