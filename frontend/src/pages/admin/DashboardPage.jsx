import { useEffect, useState } from 'react';
import { Card, Radio, Spin } from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '@/services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [stats, setStats] = useState({
    periodRevenue: 0,
    periodOrders: 0,
    totalUsers: 0,
    totalBooks: 0,
    totalTitles: 0,
    totalAuthors: 0,
    totalPublishers: 0,
    totalPosts: 0,
  });
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  const periodLabel =
    filterPeriod === 'week' ? '(Tuần Này)' : filterPeriod === 'year' ? '(Năm Nay)' : '(Tháng Này)';

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/stats/dashboard', { params: { period: filterPeriod } });
      const payload = res && res.data !== undefined ? res.data : res;
      const data = payload && payload.data !== undefined ? payload.data : payload;
      if (data) {
        setStats({
          periodRevenue: data.periodRevenue ?? 0,
          periodOrders: data.periodOrders ?? 0,
          totalUsers: data.totalUsers ?? 0,
          totalBooks: data.totalBooks ?? 0,
          totalTitles: data.totalTitles ?? 0,
          totalAuthors: data.totalAuthors ?? 0,
          totalPublishers: data.totalPublishers ?? 0,
          totalPosts: data.totalPosts ?? 0,
        });
        const chartArr = data.chartData || [];
        setChartData({
          labels: chartArr.map((item) => item.label),
          datasets: [
            {
              label: 'Doanh Thu (VND)',
              backgroundColor: '#409EFF',
              data: chartArr.map((item) => item.value),
            },
          ],
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterPeriod]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
  };

  return (
    <Spin spinning={loading}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card title={`Doanh Thu ${periodLabel}`} bordered={false}>
          <div className="text-2xl font-extrabold text-gray-800">{formatCurrency(stats.periodRevenue)}</div>
        </Card>
        <Card title={`Đơn Hàng ${periodLabel}`} bordered={false}>
          <div className="text-3xl font-extrabold text-gray-800">{stats.periodOrders}</div>
        </Card>
        <Card title="Khách Hàng" bordered={false}>
          <div className="text-3xl font-extrabold text-gray-800">{stats.totalUsers}</div>
        </Card>
        <Card title="Kho Hàng" bordered={false}>
          <div className="text-3xl font-extrabold text-gray-800">
            {stats.totalBooks} <span className="text-sm font-normal text-gray-500">sản phẩm</span>
          </div>
          <div className="text-xs text-gray-400 mt-2">{stats.totalTitles} đầu sách</div>
        </Card>
      </div>
      <Card title="Biểu Đồ Doanh Thu" bordered={false} className="mb-8">
        <div className="flex justify-end mb-4">
          <Radio.Group value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)} buttonStyle="solid">
            <Radio.Button value="week">Tuần</Radio.Button>
            <Radio.Button value="month">Tháng</Radio.Button>
            <Radio.Button value="year">Năm</Radio.Button>
          </Radio.Group>
        </div>
        <div className="h-[400px]">
          {chartData.labels.length > 0 ? <Bar data={chartData} options={chartOptions} /> : <p className="text-gray-400 text-center py-20">Không có dữ liệu</p>}
        </div>
      </Card>
      <h3 className="text-lg font-bold text-gray-700 mb-4 px-2 border-l-4 border-blue-500">Thông Tin Hệ Thống</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card size="small">Tác Giả: <strong>{stats.totalAuthors}</strong></Card>
        <Card size="small">NXB: <strong>{stats.totalPublishers}</strong></Card>
        <Card size="small">Bài Viết: <strong>{stats.totalPosts}</strong></Card>
        <Card size="small">Đầu Sách: <strong>{stats.totalTitles}</strong></Card>
      </div>
    </Spin>
  );
}
