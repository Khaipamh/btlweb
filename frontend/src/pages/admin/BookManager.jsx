import { useEffect, useRef, useState } from 'react';
import { Button, Card, Input, InputNumber, Modal, Popconfirm, Select, Table, Upload, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import api from '@/services/api';

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

function slugify(val) {
  if (!val) return '';
  return val
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const getImageUrl = (book) => {
  if (book.BookImages && book.BookImages.length > 0) return book.BookImages[0].book_image_url;
  return 'https://placehold.co/100x150?text=No+Image';
};

export default function BookManager() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [form, setForm] = useState({
    book_id: null,
    book_title: '',
    book_slug: '',
    isbn: '',
    description: '',
    price: 0,
    stock_quantity: 10,
    images: [],
    author_id: null,
    genre_id: null,
    publisher_id: null,
  });
  const debounceRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resBooks, resAuthors, resGenres, resPub] = await Promise.all([
        api.get('/api/books', {
          params: {
            search: searchText?.trim() || undefined,
            page: currentPage,
            limit: pageSize,
          },
        }),
        api.get('/api/books/authors'),
        api.get('/api/books/genres'),
        api.get('/api/books/publishers'),
      ]);

      const booksData = resBooks || [];
      const rows = Array.isArray(booksData) ? booksData : booksData.data || [];
      const tot = booksData.meta?.total ?? booksData.count ?? rows.length ?? 0;
      setBooks(rows);
      setTotal(tot);

      setAuthors(Array.isArray(resAuthors) ? resAuthors : resAuthors?.data || []);
      setGenres(Array.isArray(resGenres) ? resGenres : resGenres?.data || []);
      setPublishers(Array.isArray(resPub) ? resPub : resPub?.data || []);
    } catch {
      message.error('Lỗi kết nối máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchData();
    }, 400);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const openDialog = async (book = null) => {
    setEditing(!!book);
    setFileList([]);
    if (book) {
      try {
        const res = await api.get(`/api/books/${book.book_id || book.book_slug}`);
        const payload = res?.data !== undefined ? res.data : res;
        const data = payload.data || payload;
        setForm({
          book_id: data.book_id,
          book_title: data.book_title || '',
          book_slug: data.book_slug || '',
          isbn: data.isbn || '',
          price: data.price || 0,
          stock_quantity: data.stock_quantity || 0,
          description: data.description || data.book_description || data.book_summary || '',
          images: (data.BookImages || data.book_images || []).map((i) => i.book_image_url),
          author_id: data.author_id || data.Author?.author_id || null,
          genre_id: data.genre_id || data.Genre?.genre_id || null,
          publisher_id: data.publisher_id || data.Publisher?.publisher_id || null,
        });
      } catch {
        setForm({
          book_id: book.book_id,
          book_title: book.book_title || '',
          book_slug: book.book_slug || '',
          isbn: book.isbn || '',
          price: book.price || 0,
          stock_quantity: book.stock_quantity || 0,
          description: book.description || book.book_description || '',
          images: book.BookImages ? book.BookImages.map((img) => img.book_image_url) : [],
          author_id: book.author_id || book.Author?.author_id || null,
          genre_id: book.genre_id || book.Genre?.genre_id || null,
          publisher_id: book.publisher_id || book.Publisher?.publisher_id || null,
        });
      }
    } else {
      setForm({
        book_id: null,
        book_title: '',
        book_slug: '',
        isbn: '',
        description: '',
        price: 0,
        stock_quantity: 10,
        images: [],
        author_id: authors[0]?.author_id ?? null,
        genre_id: genres[0]?.genre_id ?? null,
        publisher_id: publishers[0]?.publisher_id ?? null,
      });
    }
    setOpen(true);
  };

  const save = async () => {
    if (!form.book_title) return message.warning('Nhập tên sách!');
    if (!form.isbn) return message.warning('Nhập ISBN!');
    if (!/^[0-9-]+$/.test(form.isbn)) return message.warning('ISBN chỉ gồm số và dấu gạch ngang!');

    setSubmitting(true);
    try {
      const hasFiles = fileList.length > 0;
      let payload;
      let config = {};

      if (hasFiles) {
        const fd = new FormData();
        Object.keys(form).forEach((key) => {
          if (key === 'images') return;
          if (form[key] !== null && form[key] !== undefined) fd.append(key, form[key]);
        });
        fileList.forEach((f) => {
          if (f.originFileObj) fd.append('images', f.originFileObj);
        });
        (form.images || []).forEach((url) => {
          if (url) fd.append('images', url);
        });
        payload = fd;
        config = { headers: { 'Content-Type': 'multipart/form-data' } };
      } else {
        payload = { ...form };
      }

      if (editing) await api.put(`/api/books/${form.book_id}`, payload, config);
      else await api.post('/api/books', payload, config);
      message.success('Đã lưu');
      setOpen(false);
      fetchData();
    } catch (e) {
      message.error(e.response?.data?.message || 'Đã xảy ra lỗi!');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/api/books/${id}`);
      message.success('Đã xóa');
      fetchData();
    } catch (e) {
      message.error(e.response?.data?.message || 'Xóa thất bại!');
    }
  };

  const setImageAt = (idx, val) => {
    setForm((f) => {
      const images = [...(f.images || [])];
      images[idx] = val;
      return { ...f, images };
    });
  };

  const addImageRow = () => setForm((f) => ({ ...f, images: [...(f.images || []), ''] }));
  const removeImageRow = (idx) =>
    setForm((f) => {
      const images = [...(f.images || [])];
      images.splice(idx, 1);
      return { ...f, images };
    });

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-800">Quản Lý Sách</h2>
        <div className="flex gap-2 flex-wrap">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên..."
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => openDialog()}>
            Thêm sách
          </Button>
        </div>
      </div>
      <Card bordered={false}>
        <Table
          rowKey="book_id"
          loading={loading}
          dataSource={books}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            onChange: (p, ps) => {
              setCurrentPage(p);
              setPageSize(ps);
            },
          }}
          columns={[
            { title: '#', width: 60, align: 'center', render: (_, __, i) => (currentPage - 1) * pageSize + i + 1 },
            {
              title: 'Ảnh',
              width: 90,
              align: 'center',
              render: (_, row) => <img src={getImageUrl(row)} alt="" className="w-12 h-16 object-cover rounded mx-auto" />,
            },
            {
              title: 'Sách',
              minWidth: 250,
              render: (_, row) => (
                <div>
                  <div className="font-bold text-base">{row.book_title}</div>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{row.Author?.author_name || '—'}</span>
                    <span className="text-xs bg-amber-50 px-2 py-0.5 rounded">{row.Genre?.genre_name || '—'}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2 line-clamp-2">{row.description || row.book_description || '—'}</div>
                  <div className="text-xs text-gray-400 mt-1">ISBN: {row.isbn || '---'}</div>
                </div>
              ),
            },
            {
              title: 'Giá',
              width: 120,
              align: 'right',
              render: (_, row) => <span className="text-red-600 font-bold">{formatCurrency(row.price)}</span>,
            },
            {
              title: 'Tồn',
              width: 100,
              align: 'center',
              render: (_, row) => (
                <span className={row.stock_quantity > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {row.stock_quantity}
                </span>
              ),
            },
            {
              title: 'Thao tác',
              width: 120,
              align: 'center',
              fixed: 'right',
              render: (_, row) => (
                <div className="flex justify-center gap-2">
                  <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => openDialog(row)} />
                  <Popconfirm title="Xóa sách này?" onConfirm={() => remove(row.book_id)}>
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </div>
              ),
            },
          ]}
        />
      </Card>
      <Modal
        title={editing ? 'Cập nhật sách' : 'Thêm sách mới'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={save}
        confirmLoading={submitting}
        width={720}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          <div>
            <div className="mb-1 text-sm">Tên sách</div>
            <Input
              value={form.book_title}
              onChange={(e) => {
                const t = e.target.value;
                setForm((f) => ({
                  ...f,
                  book_title: t,
                  book_slug: editing ? f.book_slug : slugify(t),
                }));
              }}
            />
          </div>
          <div>
            <div className="mb-1 text-sm">ISBN</div>
            <Input
              value={form.isbn}
              onChange={(e) => setForm((f) => ({ ...f, isbn: e.target.value.replace(/[^0-9-]/g, '') }))}
            />
          </div>
        </div>
        <div className="mt-3">
          <div className="mb-1 text-sm">Slug (tự động)</div>
          <Input value={form.book_slug} disabled />
        </div>
        <div className="mt-3">
          <div className="mb-1 text-sm">Mô tả</div>
          <Input.TextArea rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <div>
            <div className="mb-1 text-sm">Tác giả</div>
            <Select
              className="w-full"
              showSearch
              optionFilterProp="label"
              value={form.author_id}
              options={authors.map((a) => ({ value: a.author_id, label: a.author_name }))}
              onChange={(v) => setForm((f) => ({ ...f, author_id: v }))}
            />
          </div>
          <div>
            <div className="mb-1 text-sm">Thể loại</div>
            <Select
              className="w-full"
              showSearch
              optionFilterProp="label"
              value={form.genre_id}
              options={genres.map((g) => ({ value: g.genre_id, label: g.genre_name }))}
              onChange={(v) => setForm((f) => ({ ...f, genre_id: v }))}
            />
          </div>
          <div>
            <div className="mb-1 text-sm">NXB</div>
            <Select
              className="w-full"
              showSearch
              optionFilterProp="label"
              value={form.publisher_id}
              options={publishers.map((p) => ({ value: p.publisher_id, label: p.publisher_name }))}
              onChange={(v) => setForm((f) => ({ ...f, publisher_id: v }))}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <div className="mb-1 text-sm">Giá (VNĐ)</div>
            <InputNumber className="w-full" min={0} step={1000} value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v ?? 0 }))} />
          </div>
          <div>
            <div className="mb-1 text-sm">Tồn kho</div>
            <InputNumber
              className="w-full"
              min={0}
              value={form.stock_quantity}
              onChange={(v) => setForm((f) => ({ ...f, stock_quantity: v ?? 0 }))}
            />
          </div>
        </div>
        <div className="mt-3">
          <div className="mb-1 text-sm">Ảnh (URL)</div>
          {(form.images || []).map((url, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <Input value={url} placeholder="https://..." onChange={(e) => setImageAt(idx, e.target.value)} />
              <Button danger onClick={() => removeImageRow(idx)}>
                Xóa
              </Button>
            </div>
          ))}
          <Button size="small" onClick={addImageRow}>
            + Thêm URL ảnh
          </Button>
        </div>
        <div className="mt-3">
          <div className="mb-1 text-sm">Hoặc tải file (gửi kèm FormData)</div>
          <Upload
            multiple
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ fileList: fl }) => setFileList(fl)}
          >
            <Button icon={<UploadOutlined />}>Chọn file</Button>
          </Upload>
        </div>
      </Modal>
    </div>
  );
}
