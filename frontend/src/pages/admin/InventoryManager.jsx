import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Modal, Table, Tag, message } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '@/services/api';

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

const getImageUrl = (book) =>
  book.BookImages && book.BookImages.length > 0 ? book.BookImages[0].book_image_url : 'https://placehold.co/100x150';

export default function InventoryManager() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [importQuantity, setImportQuantity] = useState(10);

  const filteredBooks = useMemo(() => {
    const q = (searchText || '').trim().toLowerCase();
    if (!q) return books;
    return books.filter((b) => (b.book_title || '').toLowerCase().includes(q));
  }, [books, searchText]);

  const lowStockCount = filteredBooks.filter((b) => b.stock_quantity < 10).length;
  const safeStockCount = filteredBooks.filter((b) => b.stock_quantity >= 10).length;
  const totalValue = filteredBooks.reduce(
    (sum, b) => sum + (Number(b.price || 0) * Number(b.stock_quantity || 0)),
    0
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/books');
      const list = Array.isArray(res) ? res : res?.data || res?.rows || [];
      setBooks(list);
    } catch {
      message.error('Lỗi tải dữ liệu kho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openImportDialog = (book) => {
    setSelectedBook(book);
    setImportQuantity(10);
    setOpen(true);
  };

  const handleImport = async () => {
    if (!selectedBook) return;
    setSubmitting(true);
    try {
      await api.post('/api/books/import', {
        book_id: selectedBook.book_id,
        quantity: importQuantity,
      });
      message.success(`Đã nhập thêm ${importQuantity} cuốn!`);
      setOpen(false);
      fetchData();
    } catch {
      message.error('Lỗi khi nhập hàng!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Nhập Kho</h2>
        <div className="flex gap-2 flex-wrap">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên sách..."
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button type="primary" icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            Làm mới
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-l-4 border-red-500">
          <div className="text-gray-500 text-xs uppercase font-bold">Sắp hết (&lt; 10)</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {lowStockCount} <span className="text-sm text-gray-400">cuốn</span>
          </div>
        </Card>
        <Card className="border-l-4 border-green-500">
          <div className="text-gray-500 text-xs uppercase font-bold">Tồn an toàn</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {safeStockCount} <span className="text-sm text-gray-400">cuốn</span>
          </div>
        </Card>
        <Card className="border-l-4 border-blue-500">
          <div className="text-gray-500 text-xs uppercase font-bold">Tổng giá trị kho</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(totalValue)}</div>
        </Card>
      </div>
      <Card bordered={false}>
        <Table
          rowKey="book_id"
          loading={loading}
          dataSource={filteredBooks}
          scroll={{ y: 500 }}
          pagination={{ pageSize: 20 }}
          columns={[
            { title: '#', width: 60, align: 'center', render: (_, __, i) => i + 1 },
            {
              title: 'Sách',
              minWidth: 250,
              render: (_, row) => (
                <div className="flex items-center gap-3">
                  <img src={getImageUrl(row)} alt="" className="w-10 h-14 object-cover rounded border" />
                  <div>
                    <div className="font-bold text-gray-700">{row.book_title}</div>
                    <div className="text-xs text-gray-400">ISBN: {row.isbn || 'N/A'}</div>
                  </div>
                </div>
              ),
            },
            {
              title: 'Tồn kho',
              width: 150,
              align: 'center',
              sorter: (a, b) => a.stock_quantity - b.stock_quantity,
              render: (_, row) => (
                <Tag color={row.stock_quantity < 10 ? 'error' : 'success'}>{row.stock_quantity}</Tag>
              ),
            },
            {
              title: 'Hành động',
              width: 150,
              align: 'center',
              fixed: 'right',
              render: (_, row) => (
                <Button type="primary" ghost size="small" icon={<PlusOutlined />} onClick={() => openImportDialog(row)}>
                  Nhập hàng
                </Button>
              ),
            },
          ]}
        />
      </Card>
      <Modal
        title="Phiếu nhập hàng"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleImport}
        confirmLoading={submitting}
        width={400}
      >
        {selectedBook ? (
          <div className="text-center mb-4">
            <div className="font-bold text-lg">{selectedBook.book_title}</div>
            <div className="text-gray-500">
              Tồn hiện tại: <span className="font-bold text-black">{selectedBook.stock_quantity}</span>
            </div>
          </div>
        ) : null}
        <div className="mt-4">
          <div className="mb-1 text-sm">Số lượng nhập thêm</div>
          <Input
            type="number"
            min={1}
            step={10}
            size="large"
            value={importQuantity}
            onChange={(e) => setImportQuantity(Number(e.target.value) || 1)}
          />
        </div>
      </Modal>
    </div>
  );
}
