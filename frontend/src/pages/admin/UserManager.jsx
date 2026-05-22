import { useEffect, useState } from 'react';
import { Button, Card, Input, Modal, Popconfirm, Radio, Select, Table, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import api from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

const getRoleName = (role) => {
  switch (role) {
    case 'admin':
      return 'Admin';
    case 'employee':
      return 'Nhân viên';
    default:
      return 'Khách hàng';
  }
};

const getRoleColor = (role) => {
  switch (role) {
    case 'admin':
      return 'red';
    case 'employee':
      return 'orange';
    default:
      return 'magenta';
  }
};

export default function UserManager() {
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === 'admin';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    user_id: null,
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
  });

  const fetchData = async (page = pagination.page) => {
    setLoading(true);
    try {
      const res = await api.get('/api/users', {
        params: {
          page,
          limit: pagination.limit,
          search: searchText || undefined,
          role: filterRole || undefined,
        },
      });

      let finalData = [];
      let finalTotal = 0;
      const raw = res;

      if (Array.isArray(raw)) {
        finalData = raw;
        finalTotal = raw.meta?.total ?? raw.length ?? 0;
      } else if (raw?.data && Array.isArray(raw.data)) {
        finalData = raw.data;
        finalTotal = raw.meta?.total ?? raw.pagination?.total ?? 0;
      } else if (raw?.rows && Array.isArray(raw.rows)) {
        finalData = raw.rows;
        finalTotal = raw.count ?? 0;
      }

      setUsers(finalData);
      setPagination((p) => ({ ...p, page, total: finalTotal }));
    } catch {
      message.error('Lỗi tải danh sách users');
      setUsers([]);
      setPagination((p) => ({ ...p, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) setFilterRole('customer');
  }, [isAdmin]);

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional on filter change
  }, [filterRole]);

  const openDialog = (user = null) => {
    setEditing(!!user);
    if (user) {
      setForm({
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        password: '',
        phone: user.phone || '',
        role: user.role,
      });
    } else {
      setForm({
        user_id: null,
        full_name: '',
        email: '',
        password: '',
        phone: '',
        role: 'customer',
      });
    }
    setOpen(true);
  };

  const save = async () => {
    if (!form.full_name || !form.email || (!editing && !form.password)) {
      return message.warning('Vui lòng điền đủ thông tin');
    }
    setSubmitting(true);
    try {
      if (editing) await api.put(`/api/users/${form.user_id}`, form);
      else await api.post('/api/users', form);
      message.success('Thành công');
      setOpen(false);
      fetchData(pagination.page);
    } catch (e) {
      message.error(e.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/api/users/${id}`);
      message.success('Đã xóa');
      fetchData(pagination.page);
    } catch (e) {
      message.error(e.response?.data?.message || 'Không thể xóa');
    }
  };

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Người dùng</h2>
        <div className="flex gap-2 flex-wrap items-center">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tên, email, SĐT..."
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={() => fetchData(1)}
          />
          {isAdmin ? (
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => openDialog()}>
              Thêm User
            </Button>
          ) : null}
        </div>
      </div>
      <div className="mb-4">
        <Radio.Group value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <Radio.Button value="">Tất cả</Radio.Button>
          {isAdmin ? <Radio.Button value="admin">Admin</Radio.Button> : null}
          {isAdmin ? <Radio.Button value="employee">Nhân viên</Radio.Button> : null}
          <Radio.Button value="customer">Khách hàng</Radio.Button>
        </Radio.Group>
      </div>
      <Card bordered={false}>
        <Table
          rowKey="user_id"
          loading={loading}
          dataSource={users}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: false,
            onChange: (p) => fetchData(p),
          }}
          columns={[
            {
              title: '#',
              width: 60,
              align: 'center',
              render: (_, __, i) => (pagination.page - 1) * pagination.limit + i + 1,
            },
            {
              title: 'Họ tên',
              minWidth: 180,
              render: (_, row) => (
                <div>
                  <div className="font-bold">{row.full_name}</div>
                  <div className="text-xs text-gray-400">{row.email}</div>
                </div>
              ),
            },
            { title: 'SĐT', dataIndex: 'phone', width: 140 },
            {
              title: 'Vai trò',
              width: 120,
              align: 'center',
              render: (_, row) => <Tag color={getRoleColor(row.role)}>{getRoleName(row.role)}</Tag>,
            },
            {
              title: 'Ngày tạo',
              width: 150,
              align: 'center',
              render: (_, row) => (row.created_at ? new Date(row.created_at).toLocaleDateString('vi-VN') : ''),
            },
            ...(isAdmin
              ? [
                  {
                    title: 'Hành động',
                    width: 140,
                    align: 'center',
                    fixed: 'right',
                    render: (_, row) => (
                      <div className="flex justify-center gap-2">
                        <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => openDialog(row)} />
                        {row.user_id !== currentUser?.user_id ? (
                          <Popconfirm title="Xóa người dùng này?" onConfirm={() => remove(row.user_id)}>
                            <Button size="small" danger icon={<DeleteOutlined />} disabled={row.role === 'admin'} />
                          </Popconfirm>
                        ) : null}
                      </div>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </Card>
      <Modal
        title={editing ? 'Cập nhật User' : 'Thêm User'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={save}
        confirmLoading={submitting}
        width={500}
      >
        <div className="space-y-3 mt-2">
          <Input placeholder="Họ tên" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
          <Input placeholder="Email" value={form.email} disabled={editing} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Input.Password
            placeholder={editing ? 'Để trống nếu không đổi' : 'Mật khẩu'}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
          <Input placeholder="SĐT" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <Select
            className="w-full"
            value={form.role}
            options={[
              { value: 'customer', label: 'Khách hàng' },
              { value: 'employee', label: 'Nhân viên' },
              { value: 'admin', label: 'Admin' },
            ]}
            onChange={(v) => setForm((f) => ({ ...f, role: v }))}
          />
        </div>
      </Modal>
    </div>
  );
}
