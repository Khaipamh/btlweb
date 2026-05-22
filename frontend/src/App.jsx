import { Navigate, Route, Routes } from 'react-router-dom';
import { message } from 'antd';
import UserLayout from '@/layouts/UserLayout';
import AdminLayout from '@/layouts/AdminLayout';
import { useAuthStore } from '@/stores/authStore';

import Home from '@/pages/Home';
import EventSummerSale from '@/pages/event/EventSummerSale';
import Cart from '@/pages/Cart';
import CheckoutPage from '@/pages/CheckoutPage';
import TrendingPage from '@/pages/TrendingPage';
import SuggestionsPage from '@/pages/SuggestionsPage';
import BooksListing from '@/pages/BooksListing';
import BookDetail from '@/pages/BookDetail';
import GiftCardPage from '@/pages/event/GiftCardPage';
import VoucherPage from '@/pages/event/VoucherPage';
import AttendancePage from '@/pages/event/AttendancePage';
import FlashSalePage from '@/pages/event/FlashSalePage';
import NewArrivalsPage from '@/pages/event/NewArrivalsPage';
import SecondHandPage from '@/pages/event/SecondHandPage';
import ForeignBooksPage from '@/pages/event/ForeignBooksPage';
import MangaPage from '@/pages/event/MangaPage';
import TermPage from '@/pages/TermPage';
import CategoryDetail from '@/pages/CategoryDetail';
import About from '@/pages/About';
import StoreSystem from '@/pages/StoreSystem';
import UserProfile from '@/pages/UserProfile';
import OrderHistoryPage from '@/pages/OrderHistoryPage';
import BlogPage from '@/pages/BlogPage';
import PostDetail from '@/pages/PostDetail';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';

import DashboardPage from '@/pages/admin/DashboardPage';
import AuthorManager from '@/pages/admin/AuthorManager';
import BookManager from '@/pages/admin/BookManager';
import CategoryManager from '@/pages/admin/CategoryManager';
import InventoryManager from '@/pages/admin/InventoryManager';
import OrderManager from '@/pages/admin/OrderManager';
import VoucherManager from '@/pages/admin/VoucherManager';
import TransactionManager from '@/pages/admin/TransactionManager';
import PostManager from '@/pages/admin/PostManager';
import UserManager from '@/pages/admin/UserManager';

function AdminGate() {
  const user = useAuthStore((s) => s.user);
  if (!user) {
    message.warning('Vui lòng đăng nhập để vào trang quản trị.');
    return <Navigate to="/" replace />;
  }
  if (!['admin', 'employee'].includes(user.role)) {
    message.error('Bạn không có quyền truy cập trang này.');
    return <Navigate to="/" replace />;
  }
  return <AdminLayout />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        <Route index element={<Home />} />
        <Route path="event-summer-66" element={<EventSummerSale />} />
        <Route path="event-1212" element={<Navigate to="/event-summer-66" replace />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="trending" element={<TrendingPage />} />
        <Route path="suggestions" element={<SuggestionsPage />} />
        <Route path="books" element={<BooksListing />} />
        <Route path="books/:slug" element={<BookDetail />} />
        <Route path="gift-card" element={<GiftCardPage />} />
        <Route path="vouchers" element={<VoucherPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="flash-sale" element={<FlashSalePage />} />
        <Route path="new-arrivals" element={<NewArrivalsPage />} />
        <Route path="second-hand" element={<SecondHandPage />} />
        <Route path="foreign-books" element={<ForeignBooksPage />} />
        <Route path="manga" element={<MangaPage />} />
        <Route path="policy/:slug" element={<TermPage />} />
        <Route path="category/:id" element={<CategoryDetail />} />
        <Route path="about" element={<About />} />
        <Route path="store-system" element={<StoreSystem />} />
        <Route path="user/profile" element={<UserProfile />} />
        <Route path="user/orders" element={<OrderHistoryPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/:slug" element={<PostDetail />} />
        <Route path="news/:slug" element={<PostDetail />} />
        <Route path="login" element={<Login />} />
      </Route>

      <Route path="/admin" element={<AdminGate />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="authors" element={<AuthorManager />} />
        <Route path="books" element={<BookManager />} />
        <Route path="categories" element={<CategoryManager />} />
        <Route path="inventory" element={<InventoryManager />} />
        <Route path="orders" element={<OrderManager />} />
        <Route path="vouchers" element={<VoucherManager />} />
        <Route path="payments" element={<TransactionManager />} />
        <Route path="posts" element={<PostManager />} />
        <Route path="users" element={<UserManager />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
