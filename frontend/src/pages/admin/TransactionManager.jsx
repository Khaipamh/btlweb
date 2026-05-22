import { useEffect, useRef, useState } from 'react';
import { Button, Card, Input, Popconfirm, Table, Tag, message } from 'antd';
import { SearchOutlined, ReloadOutlined, ThunderboltOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@/services/api';

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

const formatDate = (dateString) => (dateString ? new Date(dateString).toLocaleString('vi-VN') : '...');

const getTxId = (tx) => tx.transaction_id ?? tx.payment_id ?? tx.id ?? '...';

export default function TransactionManager() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const debounceRef = useRef(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/payment/transactions', {
        params: {
          page: currentPage,
          limit: pageSize,
          search: searchText?.trim() || undefined,
        },
      });

      if (Array.isArray(res)) {
        setTransactions(res);
        setTotal(res.meta?.total ?? res.length);
      } else {
        setTransactions([]);
        setTotal(0);
      }
    } catch (e) {
      console.error(e);
      message.error('Không thể tải lịch sử giao dịch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchTransactions();
    }, 400);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const handleApprove = async (row) => {
    const id = getTxId(row);
    if (!id || id === '...') return message.error('Không tìm thấy mã giao dịch!');
    try {
      await api.put(`/api/payment/transactions/${id}/approve`);
      message.success('Đã duyệt thanh toán!');
      fetchTransactions();
    } catch (e) {
      message.error(e.response?.data?.message || 'Lỗi khi duyệt');
    }
  };

  const handleDelete = async (row) => {
    const id = getTxId(row);
    if (!id || id === '...') return message.error('Không tìm thấy mã giao dịch!');
    try {
      await api.delete(`/api/payment/transactions/${id}`);
      message.success('Đã xóa giao dịch!');
      fetchTransactions();
    } catch (e) {
      message.error(e.response?.data?.message || 'Lỗi khi xóa');
    }
  };

  const createFakeTransaction = async () => {
    setCreating(true);
    try {
      await api.post('/api/payment/transactions/fake');
      message.success('Đã tạo giao dịch test!');
      fetchTransactions();
    } catch (e) {
      message.error(e.response?.data?.message || 'Lỗi tạo GD test!');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Giao Dịch</h2>
        <div className="flex gap-2 flex-wrap">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Mã GD, đơn, tên..."
            style={{ width: 340 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchTransactions} loading={loading}>
            Làm mới
          </Button>
          <Button icon={<ThunderboltOutlined />} loading={creating} onClick={createFakeTransaction}>
            Tạo GD test
          </Button>
        </div>
      </div>
      <Card bordered={false}>
        <Table
          rowKey={(r) => String(getTxId(r))}
          loading={loading}
          dataSource={transactions}
          scroll={{ x: 800 }}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            onChange: (p, ps) => {
              setCurrentPage(p);
              setPageSize(ps);
            },
          }}
          columns={[
            {
              title: 'Mã GD',
              width: 110,
              align: 'center',
              render: (_, row) => <span className="font-mono text-gray-600">#{getTxId(row)}</span>,
            },
            {
              title: 'Khách',
              minWidth: 200,
              render: (_, row) => (
                <div>
                  <div className="font-bold">{row.User?.full_name || 'Khách vãng lai'}</div>
                  <div className="text-xs text-gray-400">{row.User?.email || '...'}</div>
                </div>
              ),
            },
            {
              title: 'Đơn',
              width: 120,
              render: (_, row) => <Tag>Đơn #{row.order_id}</Tag>,
            },
            {
              title: 'Số tiền',
              width: 160,
              align: 'right',
              render: (_, row) => (
                <span className="font-bold text-green-600">
                  {formatCurrency(row.amount || row.Order?.final_amount || 0)}
                </span>
              ),
            },
            {
              title: 'Phương thức',
              width: 140,
              align: 'center',
              render: (_, row) => {
                const m = row.payment_method;
                if (m === 'bank_transfer') return <Tag color="magenta">Chuyển khoản</Tag>;
                if (m === 'COD' || m === 'cod') return <Tag color="orange">COD</Tag>;
                return <Tag>{m}</Tag>;
              },
            },
            {
              title: 'Thời gian',
              width: 170,
              render: (_, row) => formatDate(row.created_at),
            },
            {
              title: 'Trạng thái',
              width: 120,
              align: 'center',
              render: (_, row) => {
                if (row.status === 'success') return <Tag color="success">Thành công</Tag>;
                if (row.status === 'pending') return <Tag color="warning">Chờ duyệt</Tag>;
                return <Tag color="error">Thất bại</Tag>;
              },
            },
            {
              title: 'Hành động',
              width: 200,
              align: 'center',
              fixed: 'right',
              render: (_, row) => (
                <div className="flex justify-center gap-2 flex-wrap">
                  {row.status === 'pending' ? (
                    <Popconfirm title="Xác nhận đã nhận tiền?" onConfirm={() => handleApprove(row)}>
                      <Button size="small" type="primary" icon={<CheckOutlined />}>
                        Duyệt
                      </Button>
                    </Popconfirm>
                  ) : null}
                  <Popconfirm title="Xóa giao dịch này?" onConfirm={() => handleDelete(row)}>
                    <Button size="small" danger icon={<DeleteOutlined />}>
                      Xóa
                    </Button>
                  </Popconfirm>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
