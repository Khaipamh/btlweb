import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/user/Navbar';
import Footer from '@/components/user/Footer';
import ChatBot from '@/components/user/ChatBot';
import LoginModal from '@/components/user/LoginModal';
import { useUiStore } from '@/stores/uiStore';
import { useCartStore } from '@/stores/cartStore';

export default function UserLayout() {
  const loginModalOpen = useUiStore((s) => s.loginModalOpen);
  const loginModalTab = useUiStore((s) => s.loginModalTab);
  const closeLoginModal = useUiStore((s) => s.closeLoginModal);
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <div className="flex min-h-screen flex-col font-sans text-gray-800 bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <ChatBot />
      {loginModalOpen ? (
        <LoginModal initialTab={loginModalTab} onClose={closeLoginModal} />
      ) : null}
    </div>
  );
}
