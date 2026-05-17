import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Modal, Table, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import api from '@/services/api';

function slugify(val) {
  if (!val) return '';
  return val
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

export default function AuthorManager() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ author_id: null, author_name: '', author_slug: '' });

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return authors;
    return authors.filter((a) => (a.author_name || '').toLowerCase().includes(q));
  }, [authors, searchText]);

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/books/authors');
      const payload = res && res.data !== undefined ? res.data : res;
      setAuthors(Array.isArray(payload) ? payload : payload?.data || []);
    } catch {
      message.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const openDialog = (row = null) => {
    setEditing(!!row);
    if (row) setForm({ author_id: row.author_id, author_name: row.author_name, author_slug: row.author_slug });
    else setForm({ author_id: null, author_name: '', author_slug: '' });
    setOpen(true);
  };

  const save = async () => {
    if (!form.author_name) return message.warning('Chưa nhập tên!');
    setSubmitting(true);
    try {
      if (editing) await api.put(`/api/books/authors/${form.author_id}`, form);
      else await api.post('/api/books/authors', form);
      message.success('Thành công!');
      setOpen(false);
      fetchAuthors();
    } catch (e) {
      message.error(e.response?.data?.message || 'Lỗi lưu');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/api/books/authors/${id}`);
      message.success('Đã xóa');
      fetchAuthors();
    } catch (e) {
      message.error(e.response?.data?.message || 'Không thể xóa');
    }
  };

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Tác giả</h2>
        <div className="flex gap-2">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên..."
            style={{ width: 280 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openDialog()}>
            Thêm
          </Button>
        </div>
      </div>
      <Card bordered={false}>
        <Table
          rowKey="author_id"
          loading={loading}
          dataSource={filtered}
          pagination={{ pageSize: 10 }}
          columns={[
            { title: '#', width: 60, render: (_, __, i) => i + 1 },
            { title: 'Tên', dataIndex: 'author_name' },
            { title: 'Slug', dataIndex: 'author_slug' },
            {
              title: 'Hành động',
              width: 140,
              render: (_, row) => (
                <>
                  <Button size="small" icon={<EditOutlined />} onClick={() => openDialog(row)} className="mr-2" />
                  <Button size="small" danger icon={<DeleteOutlined />} onClick={() => remove(row.author_id)} />
                </>
              ),
            },
          ]}
        />
      </Card>
      <Modal
        title={editing ? 'Sửa Tác giả' : 'Thêm Tác giả'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={save}
        confirmLoading={submitting}
      >
        <div className="mt-2 space-y-3">
          <div>
            <div className="mb-1 text-sm">Tên tác giả</div>
            <Input
              value={form.author_name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({ ...f, author_name: name, author_slug: editing ? f.author_slug : slugify(name) }));
              }}
            />
          </div>
          <div>
            <div className="mb-1 text-sm">Slug</div>
            <Input value={form.author_slug} disabled />
          </div>
        </div>
      </Modal>
    </div>
  );
}
