import { useEffect, useRef, useState } from 'react';
import { Button, Card, Input, Modal, Popconfirm, Table, Tag, message } from 'antd';
import { SearchOutlined, EyeOutlined, PrinterOutlined, ThunderboltOutlined } from '@ant-design/icons';
import api from '@/services/api';

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

const formatStatus = (status) => {
  const map = {
    pending: 'Chờ Xử Lý',
    processing: 'Đang Xử Lý',
    shipped: 'Đang Giao',
    delivered: 'Đã Giao',
    cancelled: 'Đã Hủy',
  };
  return map[status] || status;
};

const getStatusColor = (status) => {
  const map = {
    pending: 'warning',
    processing: 'processing',
    shipped: 'warning',
    delivered: 'success',
    cancelled: 'default',
  };
  return map[status] || 'default';
};

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const debounceRef = useRef(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/orders/admin', {
        params: {
          page: currentPage,
          limit: pageSize,
          search: searchText?.trim() || undefined,
        },
      });

      let rows = [];
      let tot = 0;
      if (Array.isArray(res)) {
        rows = res;
        tot = res.meta?.total ?? res.length ?? 0;
      } else if (res?.rows) {
        rows = res.rows;
        tot = res.count ?? 0;
      } else if (Array.isArray(res?.data)) {
        rows = res.data;
        tot = res.meta?.total ?? 0;
      }

      setOrders(rows);
      setTotal(tot);
    } catch (e) {
      console.error(e);
      message.error('Lỗi tải đơn hàng!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchOrders();
    }, 400);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/api/orders/admin/${id}`, { order_status: newStatus });
      message.success('Trạng thái đã cập nhật!');
      fetchOrders();
    } catch {
      message.error('Cập nhật thất bại!');
    }
  };

  const handleDelete = async (orderId) => {
    try {
      await api.delete(`/api/orders/admin/${orderId}`);
      message.success('Đơn hàng đã xóa!');
      fetchOrders();
    } catch (e) {
      message.error(e.response?.data?.message || 'Lỗi khi xóa đơn hàng!');
    }
  };

  const createFakeOrder = async () => {
    setCreating(true);
    try {
      await api.post('/api/orders/admin/fake');
      message.success('Đã tạo đơn thử nghiệm!');
      fetchOrders();
    } catch {
      message.error('Lỗi khi tạo đơn thử nghiệm!');
    } finally {
      setCreating(false);
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const printInvoice = () => {
    if (!selectedOrder) return;
    const order = selectedOrder;
    const itemsHtml = (order.OrderItems || [])
      .map(
        (item) => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.Book?.book_title || ''}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(item.unit_price)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(item.subtotal)}</td>
        </tr>
    `
      )
      .join('');

    const invoiceHtml = `
        <html>
        <head><title>Hóa Đơn #${order.order_id}</title></head>
        <body style="font-family: sans-serif; padding: 20px;">
            <h1 style="text-align:center">Nhà Sách Poiseidon</h1>
            <p style="text-align:center">Mã Đơn #${order.order_id} — ${new Date(order.created_at).toLocaleString('vi-VN')}</p>
            <table style="width:100%; border-collapse:collapse; margin-top:16px">
                <thead><tr><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <p style="text-align:right; margin-top:16px; font-size:18px; font-weight:bold">Tổng: ${formatCurrency(order.final_amount)}</p>
            <script>window.onload=function(){window.print()}<\/script>
        </body></html>`;

    const w = window.open('', '_blank');
    w.document.write(invoiceHtml);
    w.document.close();
  };

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-800">Quản Lý Đơn Hàng</h2>
        <div className="flex gap-2 flex-wrap">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Mã đơn, tên, SĐT..."
            style={{ width: 320 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button icon={<ThunderboltOutlined />} loading={creating} onClick={createFakeOrder}>
            Tạo đơn thử
          </Button>
        </div>
      </div>
      <Card bordered={false}>
        <Table
          rowKey="order_id"
          loading={loading}
          dataSource={orders}
          scroll={{ x: 900 }}
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
              title: 'ID',
              width: 90,
              align: 'center',
              render: (_, row) => <span className="font-bold text-gray-600">#{row.order_id}</span>,
            },
            {
              title: 'Khách hàng',
              minWidth: 200,
              render: (_, row) => (
                <div>
                  <span className="font-bold">{row.User?.full_name || 'Khách Vãng Lai'}</span>
                  <div className="text-xs text-gray-400">
                    {row.User?.email} — {row.User?.phone || '...'}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 bg-gray-50 p-1 rounded border border-dashed">
                    {typeof row.Address === 'object' ? row.Address?.address_detail : row.shipping_address}
                  </div>
                </div>
              ),
            },
            {
              title: 'Tổng',
              width: 130,
              align: 'right',
              render: (_, row) => (
                <div>
                  <div className="text-red-600 font-bold">{formatCurrency(row.final_amount || row.total_amount)}</div>
                  {row.voucher_id ? <div className="text-xs text-green-600">Đã dùng voucher</div> : null}
                </div>
              ),
            },
            {
              title: 'Trạng thái',
              width: 140,
              align: 'center',
              render: (_, row) => (
                <Tag color={getStatusColor(row.order_status)}>{formatStatus(row.order_status)}</Tag>
              ),
            },
            {
              title: 'Thanh toán',
              width: 160,
              align: 'center',
              render: (_, row) => (
                <div>
                  <Tag color={row.payment_status === 'paid' ? 'success' : 'default'}>
                    {row.payment_status === 'paid' ? 'Đã TT' : 'Chưa TT'}
                  </Tag>
                  <div className="text-xs text-gray-400 mt-1 uppercase">{row.payment_method || '...'}</div>
                  {row.Transactions?.length ? (
                    <div className="border-t pt-1 mt-1 text-xs">
                      {row.Transactions.map((tx) => (
                        <div key={tx.transaction_id}>
                          #{tx.transaction_id} {tx.status === 'success' ? '✔' : '⏳'}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ),
            },
            {
              title: 'Hành động',
              width: 200,
              align: 'center',
              fixed: 'right',
              render: (_, row) => (
                <div className="flex flex-col gap-2">
                  <Button size="small" icon={<EyeOutlined />} onClick={() => viewOrderDetails(row)}>
                    Chi tiết
                  </Button>
                  {row.order_status === 'pending' ? (
                    <Button size="small" type="primary" onClick={() => updateStatus(row.order_id, 'processing')}>
                      Duyệt đơn
                    </Button>
                  ) : null}
                  {row.order_status === 'processing' ? (
                    <Button size="small" onClick={() => updateStatus(row.order_id, 'shipped')}>
                      Gửi hàng
                    </Button>
                  ) : null}
                  {row.order_status === 'shipped' ? (
                    <Button size="small" type="primary" ghost onClick={() => updateStatus(row.order_id, 'delivered')}>
                      Đã giao
                    </Button>
                  ) : null}
                  {['pending', 'processing'].includes(row.order_status) ? (
                    <Popconfirm title="Hủy đơn?" onConfirm={() => updateStatus(row.order_id, 'cancelled')}>
                      <Button size="small" danger>
                        Hủy
                      </Button>
                    </Popconfirm>
                  ) : null}
                  <Popconfirm title="Xóa vĩnh viễn đơn này?" onConfirm={() => handleDelete(row.order_id)}>
                    <Button size="small" danger type="text">
                      Xóa
                    </Button>
                  </Popconfirm>
                </div>
              ),
            },
          ]}
        />
      </Card>
      <Modal
        title="Chi tiết đơn hàng"
        open={detailsOpen}
        onCancel={() => setDetailsOpen(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailsOpen(false)}>
            Đóng
          </Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={printInvoice}>
            In hóa đơn
          </Button>,
        ]}
      >
        {selectedOrder ? (
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <div>
                <div className="font-bold text-lg">Đơn #{selectedOrder.order_id}</div>
                <div className="text-sm text-gray-500">
                  {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}
                </div>
              </div>
              <div className="text-right">
                <Tag color={getStatusColor(selectedOrder.order_status)}>{formatStatus(selectedOrder.order_status)}</Tag>
                <div className="text-sm font-bold text-red-600 mt-1">{formatCurrency(selectedOrder.final_amount)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded">
              <div>
                <div className="font-bold mb-1">Khách</div>
                <div>{selectedOrder.User?.full_name}</div>
                <div className="text-sm text-gray-500">{selectedOrder.User?.email}</div>
                <div className="text-sm text-gray-500">{selectedOrder.User?.phone}</div>
              </div>
              <div>
                <div className="font-bold mb-1">Giao hàng</div>
                <div className="font-bold">{selectedOrder.Address?.recipient_name}</div>
                <div className="text-sm">{selectedOrder.Address?.phone}</div>
                <div className="text-sm text-gray-600">
                  {selectedOrder.Address?.address_detail || selectedOrder.shipping_address}
                </div>
              </div>
            </div>
            <Table
              size="small"
              bordered
              rowKey={(r) => `${r.book_id}-${r.quantity}`}
              dataSource={selectedOrder.OrderItems || []}
              pagination={false}
              columns={[
                { title: 'Sách', dataIndex: ['Book', 'book_title'], key: 't' },
                {
                  title: 'Đơn giá',
                  align: 'right',
                  render: (_, r) => formatCurrency(r.unit_price),
                },
                { title: 'SL', dataIndex: 'quantity', width: 60, align: 'center' },
                {
                  title: 'Thành tiền',
                  align: 'right',
                  render: (_, r) => formatCurrency(r.subtotal),
                },
              ]}
            />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
