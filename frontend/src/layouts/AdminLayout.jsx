import { useMemo } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  ReadOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  HomeOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Sider, Header, Content } = Layout;

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey = useMemo(() => {
    const p = location.pathname;
    if (p.includes('/admin/dashboard')) return ['/admin/dashboard'];
    if (p.includes('/admin/books')) return ['/admin/books'];
    if (p.includes('/admin/categories')) return ['/admin/categories'];
    if (p.includes('/admin/authors')) return ['/admin/authors'];
    if (p.includes('/admin/inventory')) return ['/admin/inventory'];
    if (p.includes('/admin/orders')) return ['/admin/orders'];
    if (p.includes('/admin/payments')) return ['/admin/payments'];
    if (p.includes('/admin/vouchers')) return ['/admin/vouchers'];
    if (p.includes('/admin/posts')) return ['/admin/posts'];
    if (p.includes('/admin/users')) return ['/admin/users'];
    return ['/admin/dashboard'];
  }, [location.pathname]);

  const items = [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan & Doanh thu', onClick: () => navigate('/admin/dashboard') },
    {
      key: 'products',
      icon: <ReadOutlined />,
      label: 'Quản lý Sản phẩm',
      children: [
        { key: '/admin/books', label: 'Sách', onClick: () => navigate('/admin/books') },
        { key: '/admin/categories', label: 'Danh mục & Thể loại', onClick: () => navigate('/admin/categories') },
        { key: '/admin/authors', label: 'Tác giả', onClick: () => navigate('/admin/authors') },
        { key: '/admin/inventory', label: 'Xuất / Nhập kho', onClick: () => navigate('/admin/inventory') },
      ],
    },
    {
      key: 'sales',
      icon: <ShoppingCartOutlined />,
      label: 'Bán hàng',
      children: [
        { key: '/admin/orders', label: 'Đơn hàng', onClick: () => navigate('/admin/orders') },
        { key: '/admin/payments', label: 'Quản lý Thanh toán', onClick: () => navigate('/admin/payments') },
        { key: '/admin/vouchers', label: 'Mã giảm giá', onClick: () => navigate('/admin/vouchers') },
      ],
    },
    { key: '/admin/posts', icon: <FileTextOutlined />, label: 'Quản lý Bài viết', onClick: () => navigate('/admin/posts') },
    { key: '/admin/users', icon: <UserOutlined />, label: 'Quản lý Người dùng', onClick: () => navigate('/admin/users') },
    { key: '/', icon: <HomeOutlined />, label: 'Về trang bán hàng', onClick: () => navigate('/') },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider width={220} theme="dark" className="shadow-xl">
        <div className="h-16 flex items-center justify-center border-b border-gray-700 bg-[#002140] shrink-0">
          <span className="text-xl font-bold tracking-wider text-white">
            SAHAFA <span className="text-yellow-400">ADMIN</span>
          </span>
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={selectedKey} defaultOpenKeys={['products', 'sales']} items={items} />
      </Sider>
      <Layout>
        <Header className="bg-white shadow-sm flex items-center justify-between px-6 h-16 leading-none">
          <span className="text-gray-500 font-medium">Trang quản trị hệ thống Sahafa Bookstore</span>
          <Link to="/" className="text-blue-600 text-sm font-medium">
            Ra cửa hàng
          </Link>
        </Header>
        <Content className="m-6 p-6 bg-gray-100 min-h-[calc(100vh-112px)]">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
