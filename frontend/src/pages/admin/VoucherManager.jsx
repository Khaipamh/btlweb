import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Input,
  Modal,
  Popconfirm,
  Table,
  Tag,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '@/services/api';

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

function getStatusInfo(voucher) {
  const now = new Date();
  const start = new Date(voucher.start_at);
  const end = new Date(voucher.end_at);
  if (now < start) return { text: 'Chưa bắt đầu', color: 'warning' };
  if (now > end) return { text: 'Đã kết thúc', color: 'default' };
  if (voucher.usage_limit <= 0) return { text: 'Hết lượt', color: 'error' };
  return { text: 'Đang diễn ra', color: 'success' };
}

export default function VoucherManager() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [form, setForm] = useState({
    voucher_id: null,
    code: '',
    discount_type: 'fixed',
    value: 10000,
    min_order_value: 50000,
    usage_limit: 100,
    start_at: null,
    end_at: null,
  });

  const filtered = useMemo(() => {
    const q = searchText.trim().toUpperCase();
    if (!q) return vouchers;
    return vouchers.filter((v) => (v.code || '').toUpperCase().includes(q));
  }, [vouchers, searchText]);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/vouchers/admin');
      const list = Array.isArray(res) ? res : res?.data || res?.rows || [];
      setVouchers(list);
    } catch {
      message.error('Lỗi tải danh sách voucher!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const openDialog = (row = null) => {
    setEditing(!!row);
    if (row) {
      setForm({
        voucher_id: row.voucher_id,
        code: row.code,
        discount_type: row.discount_type || 'fixed',
        value: row.value ?? 10000,
        min_order_value: row.min_order_value ?? 0,
        usage_limit: row.usage_limit ?? 100,
        start_at: row.start_at,
        end_at: row.end_at,
      });
      if (row.start_at && row.end_at) {
        setDateRange([dayjs(row.start_at), dayjs(row.end_at)]);
      } else setDateRange(null);
    } else {
      const now = dayjs();
      const next = dayjs().add(7, 'day');
      setForm({
        voucher_id: null,
        code: '',
        discount_type: 'fixed',
        value: 10000,
        min_order_value: 50000,
        usage_limit: 100,
        start_at: null,
        end_at: null,
      });
      setDateRange([now, next]);
    }
    setOpen(true);
  };

  const save = async () => {
    if (!form.code) return message.warning('Chưa nhập mã code!');
    if (!dateRange || dateRange.length < 2) return message.warning('Chưa chọn thời gian!');
    const payload = {
      ...form,
      discount_type: 'fixed',
      start_at: dateRange[0].toISOString(),
      end_at: dateRange[1].toISOString(),
    };
    setSubmitting(true);
    try {
      if (editing) await api.put(`/api/vouchers/${form.voucher_id}`, payload);
      else await api.post('/api/vouchers', payload);
      message.success('Đã lưu');
      setOpen(false);
      fetchVouchers();
    } catch (e) {
      message.error(e.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/api/vouchers/${id}`);
      message.success('Đã xóa voucher!');
      fetchVouchers();
    } catch {
      message.error('Lỗi khi xóa!');
    }
  };

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Mã Giảm Giá</h2>
        <div className="flex gap-2 flex-wrap">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo mã..."
            style={{ width: 250 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchVouchers} loading={loading}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openDialog()}>
            Tạo Voucher
          </Button>
        </div>
      </div>
      <Card bordered={false}>
        <Table
          rowKey="voucher_id"
          loading={loading}
          dataSource={filtered}
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: 'Mã',
              width: 180,
              render: (_, row) => (
                <div>
                  <div className="font-bold text-red-600 tracking-wider">{row.code}</div>
                  <div className="text-xs text-gray-400">GIẢM TIỀN MẶT</div>
                </div>
              ),
            },
            {
              title: 'Giá trị',
              width: 180,
              render: (_, row) => (
                <div>
                  <div className="font-bold text-green-600 text-lg">-{formatCurrency(row.value)}</div>
                  <div className="text-xs text-gray-500 mt-1">Đơn tối thiểu: {formatCurrency(row.min_order_value)}</div>
                </div>
              ),
            },
            {
              title: 'Thời gian',
              minWidth: 220,
              render: (_, row) => (
                <div className="text-sm">
                  <div>{formatDate(row.start_at)}</div>
                  <div className="text-gray-500">→ {formatDate(row.end_at)}</div>
                </div>
              ),
            },
            {
              title: 'Trạng thái',
              width: 140,
              align: 'center',
              render: (_, row) => {
                const s = getStatusInfo(row);
                return <Tag color={s.color}>{s.text}</Tag>;
              },
            },
            { title: 'Lượt', width: 80, align: 'center', dataIndex: 'usage_limit' },
            {
              title: 'Hành động',
              width: 120,
              align: 'center',
              fixed: 'right',
              render: (_, row) => (
                <>
                  <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => openDialog(row)} className="mr-2" />
                  <Popconfirm title="Xóa voucher này?" onConfirm={() => remove(row.voucher_id)}>
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </>
              ),
            },
          ]}
        />
      </Card>
      <Modal
        title={editing ? 'Sửa Voucher' : 'Tạo Voucher Mới'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={save}
        confirmLoading={submitting}
        width={560}
      >
        <div className="space-y-3 mt-2">
          <div>
            <div className="mb-1 text-sm">Mã Code</div>
            <Input
              value={form.code}
              disabled={editing}
              placeholder="VD: SALE50K"
              onChange={(e) =>
                setForm((f) => ({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, '') }))
              }
            />
            {editing ? <div className="text-xs text-gray-400 mt-1">Không thể sửa mã code</div> : null}
          </div>
          <div>
            <div className="mb-1 text-sm">Số tiền giảm (VNĐ)</div>
            <Input
              type="number"
              min={1000}
              step={5000}
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <div className="mb-1 text-sm">Đơn tối thiểu (VNĐ)</div>
            <Input
              type="number"
              min={0}
              step={10000}
              value={form.min_order_value}
              onChange={(e) => setForm((f) => ({ ...f, min_order_value: Number(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <div className="mb-1 text-sm">Số lượng phát hành</div>
            <Input
              type="number"
              min={1}
              value={form.usage_limit}
              onChange={(e) => setForm((f) => ({ ...f, usage_limit: Number(e.target.value) || 1 }))}
            />
          </div>
          <div>
            <div className="mb-1 text-sm">Thời gian áp dụng</div>
            <DatePicker.RangePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              value={dateRange}
              onChange={(v) => setDateRange(v)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
