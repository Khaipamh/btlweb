import { useEffect, useState } from 'react';
import { Button, Card, Input, Modal, Table, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@/services/api';

export default function CategoryManager() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ genre_id: null, genre_name: '', genre_slug: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/books/genres');
      const body = res?.data ?? res;
      const list = Array.isArray(body) ? body : body?.data || [];
      setGenres(list);
    } catch {
      message.error('Lỗi tải thể loại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openDialog = (row = null) => {
    setEditing(!!row);
    if (row) setForm({ genre_id: row.genre_id, genre_name: row.genre_name, genre_slug: row.genre_slug });
    else setForm({ genre_id: null, genre_name: '', genre_slug: '' });
    setOpen(true);
  };

  const save = async () => {
    if (!form.genre_name) return message.warning('Nhập tên thể loại');
    setSubmitting(true);
    try {
      if (editing) await api.put(`/api/books/genres/${form.genre_id}`, form);
      else await api.post('/api/books/genres', form);
      message.success('Đã lưu');
      setOpen(false);
      load();
    } catch (e) {
      message.error(e.response?.data?.message || 'Lỗi');
    } finally {
      setSubmitting(false);
    }
  };

  const del = async (id) => {
    try {
      await api.delete(`/api/books/genres/${id}`);
      message.success('Đã xóa');
      load();
    } catch (e) {
      message.error(e.response?.data?.message || 'Không xóa được');
    }
  };

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between mb-4">
        <h2 className="text-xl font-bold">Danh mục &amp; Thể loại</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openDialog()}>
          Thêm
        </Button>
      </div>
      <Card bordered={false}>
        <Table
          rowKey="genre_id"
          loading={loading}
          dataSource={genres}
          columns={[
            { title: 'ID', dataIndex: 'genre_id', width: 80 },
            { title: 'Tên', dataIndex: 'genre_name' },
            { title: 'Slug', dataIndex: 'genre_slug' },
            {
              title: 'Thao tác',
              width: 140,
              render: (_, row) => (
                <>
                  <Button size="small" icon={<EditOutlined />} onClick={() => openDialog(row)} className="mr-2" />
                  <Button size="small" danger icon={<DeleteOutlined />} onClick={() => del(row.genre_id)} />
                </>
              ),
            },
          ]}
        />
      </Card>
      <Modal title={editing ? 'Sửa thể loại' : 'Thêm thể loại'} open={open} onCancel={() => setOpen(false)} onOk={save} confirmLoading={submitting}>
        <div className="space-y-3 mt-2">
          <Input placeholder="Tên" value={form.genre_name} onChange={(e) => setForm((f) => ({ ...f, genre_name: e.target.value }))} />
          <Input placeholder="Slug" value={form.genre_slug} onChange={(e) => setForm((f) => ({ ...f, genre_slug: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
}
