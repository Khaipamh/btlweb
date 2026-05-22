import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Modal, Popconfirm, Select, Table, Tag, message } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import api from '@/services/api';

function slugFromTitle(title) {
  if (!title) return '';
  let str = title.toLowerCase();
  str = str.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/g, 'a');
  str = str.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/g, 'e');
  str = str.replace(/i|í|ì|ỉ|ĩ|ị/g, 'i');
  str = str.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/g, 'o');
  str = str.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/g, 'u');
  str = str.replace(/ý|ỳ|ỷ|ỹ|ỵ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/\s+/g, '-');
  str = str.replace(/[^\w-]+/g, '');
  return str;
}

export default function PostManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    post_id: null,
    title: '',
    post_slug: '',
    thumbnail_url: '',
    content: '',
    category_id: null,
    status: 'published',
  });

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => {
      const title = (p.title || '').toLowerCase();
      const slug = (p.post_slug || '').toLowerCase();
      return title.includes(q) || slug.includes(q);
    });
  }, [posts, searchText]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/posts?status=all');
      const list = Array.isArray(res) ? res : res?.data || res?.rows || [];
      setPosts(list);
    } catch {
      message.error('Lỗi tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const viewPost = (post) => {
    window.open(`/news/${post.post_slug}`, '_blank');
  };

  const openDialog = (row = null) => {
    setEditing(!!row);
    if (row) {
      setForm({
        post_id: row.post_id,
        title: row.title || '',
        post_slug: row.post_slug || '',
        thumbnail_url: row.thumbnail_url || '',
        content: row.content || '',
        category_id: row.category_id ?? null,
        status: row.status || 'published',
      });
    } else {
      setForm({
        post_id: null,
        title: '',
        post_slug: '',
        thumbnail_url: '',
        content: '',
        category_id: null,
        status: 'published',
      });
    }
    setOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.post_slug) return message.warning('Nhập tiêu đề và slug!');
    setSubmitting(true);
    try {
      if (editing) await api.put(`/api/posts/${form.post_id}`, form);
      else await api.post('/api/posts', form);
      message.success('Đã lưu');
      setOpen(false);
      fetchPosts();
    } catch (e) {
      message.error(e.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/api/posts/${id}`);
      message.success('Đã xóa');
      fetchPosts();
    } catch {
      message.error('Lỗi khi xóa');
    }
  };

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Bài Viết</h2>
        <div className="flex gap-2 flex-wrap">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tiêu đề, slug..."
            style={{ width: 250 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchPosts} loading={loading}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openDialog()}>
            Viết bài mới
          </Button>
        </div>
      </div>
      <Card bordered={false}>
        <Table
          rowKey="post_id"
          loading={loading}
          dataSource={filtered}
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: 'Ảnh',
              width: 100,
              align: 'center',
              render: (_, row) => (
                <img
                  src={row.thumbnail_url || 'https://via.placeholder.com/150'}
                  alt=""
                  className="w-20 h-14 object-cover rounded border mx-auto"
                />
              ),
            },
            {
              title: 'Bài viết',
              minWidth: 250,
              render: (_, row) => (
                <div>
                  <button
                    type="button"
                    className="font-bold text-base text-left text-gray-800 hover:text-pink-600"
                    onClick={() => viewPost(row)}
                  >
                    {row.title}
                  </button>
                  <div className="flex gap-2 flex-wrap mt-1">
                    <Tag>/{row.post_slug}</Tag>
                    {row.Category ? <Tag>{row.Category.category_name}</Tag> : null}
                  </div>
                </div>
              ),
            },
            {
              title: 'Trạng thái',
              width: 120,
              align: 'center',
              render: (_, row) => (
                <Tag color={row.status === 'published' ? 'success' : 'warning'}>
                  {row.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                </Tag>
              ),
            },
            {
              title: 'Hành động',
              width: 160,
              align: 'center',
              fixed: 'right',
              render: (_, row) => (
                <>
                  <Button size="small" type="primary" ghost icon={<EyeOutlined />} onClick={() => viewPost(row)} className="mr-1" />
                  <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => openDialog(row)} className="mr-1" />
                  <Popconfirm title="Xóa bài viết này?" onConfirm={() => remove(row.post_id)}>
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </>
              ),
            },
          ]}
        />
      </Card>
      <Modal
        title={editing ? 'Cập nhật bài viết' : 'Viết bài mới'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={save}
        confirmLoading={submitting}
        width={800}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          <div className="md:col-span-2">
            <div className="mb-1 text-sm">Tiêu đề</div>
            <Input
              value={form.title}
              placeholder="Tiêu đề..."
              onChange={(e) => {
                const title = e.target.value;
                setForm((f) => ({
                  ...f,
                  title,
                  post_slug: editing ? f.post_slug : slugFromTitle(title),
                }));
              }}
            />
          </div>
          <div>
            <div className="mb-1 text-sm">Trạng thái</div>
            <Select
              className="w-full"
              value={form.status}
              options={[
                { value: 'published', label: 'Công khai' },
                { value: 'draft', label: 'Bản nháp' },
              ]}
              onChange={(v) => setForm((f) => ({ ...f, status: v }))}
            />
          </div>
        </div>
        <div className="mt-3">
          <div className="mb-1 text-sm">Slug</div>
          <Input
            addonBefore="sahafa.com/news/"
            value={form.post_slug}
            onChange={(e) => setForm((f) => ({ ...f, post_slug: e.target.value }))}
          />
        </div>
        <div className="mt-3">
          <div className="mb-1 text-sm">Ảnh bìa (URL)</div>
          <Input
            value={form.thumbnail_url}
            placeholder="https://..."
            onChange={(e) => setForm((f) => ({ ...f, thumbnail_url: e.target.value }))}
          />
          {form.thumbnail_url ? (
            <div className="mt-2 p-2 border rounded bg-gray-50 h-40 flex items-center justify-center">
              <img src={form.thumbnail_url} alt="" className="max-h-full object-contain" />
            </div>
          ) : null}
        </div>
        <div className="mt-3">
          <div className="mb-1 text-sm">Nội dung</div>
          <Input.TextArea rows={8} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
}
