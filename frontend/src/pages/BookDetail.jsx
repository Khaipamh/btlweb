import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import api from '@/services/api';
import SuggestionsPage from '@/pages/SuggestionsPage';

const formatPrice = (value) => new Intl.NumberFormat('vi-VN').format(value);

function getImageUrl(url) {
  if (!url) return 'https://placehold.co/400x600?text=No+Image';
  if (url.startsWith('http')) return url;
  const base = api?.defaults?.baseURL || '';
  return `${base}${url}`;
}

export default function BookDetail() {
  const { slug } = useParams();
  const addToCart = useCartStore((s) => s.addToCart);
  const [quantity, setQuantity] = useState(1);
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchBookDetail = async (idOrSlug) => {
    if (!idOrSlug) return;
    setIsLoading(true);
    setBook(null);
    setSelectedImage(null);
    try {
      const data = await api.get(`/api/books/${idOrSlug}`);
      if (data) {
        if (data.BookImages && data.BookImages.length > 0) {
          data.BookImages.forEach((img) => {
            img.book_image_url = getImageUrl(img.book_image_url);
          });
        }
        setBook(data);
        if (data.BookImages && data.BookImages.length > 0) {
          setSelectedImage(data.BookImages[0].book_image_url);
        } else if (data.image) {
          setSelectedImage(getImageUrl(data.image));
        }
      }
    } catch (error) {
      console.error('Lỗi tải thông tin sách:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setQuantity(1);
    fetchBookDetail(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const getProductData = () => {
    if (!book) return null;
    return {
      id: book.book_id,
      title: book.book_title,
      price: book.price,
      image: selectedImage || null,
    };
  };

  const handleAddToCart = async () => {
    const product = getProductData();
    if (product) {
      const success = await addToCart(product, quantity);
      if (success) alert('Đã thêm vào giỏ hàng thành công!');
    }
  };

  const handleBuyNow = async () => {
    const product = getProductData();
    if (product) {
      await addToCart(product, quantity);
      window.location.href = '/checkout';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
          <Link to="/" className="hover:text-[#C92127]">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate">{book?.book_title || 'Đang tải...'}</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20 bg-white rounded-xl shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
          </div>
        ) : null}

        {book ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4 md:p-8 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-5 lg:col-span-4">
                <div className="border rounded-lg overflow-hidden relative group p-2 mb-4 bg-white">
                  <img
                    src={selectedImage || 'https://placehold.co/400x600?text=No+Image'}
                    className="w-full h-auto object-contain max-h-[400px] mx-auto transition-opacity duration-300"
                    alt={book.book_title}
                  />
                </div>
                {book.BookImages?.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {book.BookImages.map((img, index) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => setSelectedImage(img.book_image_url)}
                        className={`w-20 h-20 shrink-0 border-2 rounded-md cursor-pointer overflow-hidden transition-all ${
                          selectedImage === img.book_image_url ? 'border-[#C92127] opacity-100' : 'border-transparent opacity-60'
                        }`}
                      >
                        <img src={img.book_image_url} className="w-full h-full object-cover" alt="" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-4">
                <h1 className="text-2xl md:text-3xl font-medium text-gray-800 leading-tight">{book.book_title}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex text-yellow-400">★★★★★</div>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500">Đã bán {book.total_sold || 0}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-pink-600 font-medium">{book.stock_quantity > 0 ? 'Còn hàng' : 'Hết hàng'}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg flex items-end gap-3 mt-2">
                  <span className="text-3xl font-bold text-[#C92127]">{formatPrice(book.price)} đ</span>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 mb-4 max-w-md mt-2">
                  <div>Mã sản phẩm</div>
                  <div className="font-medium text-black">SP{book.book_id}</div>
                  <div>Tác giả</div>
                  <div className="font-medium text-pink-600">{book.Author?.author_name || 'Đang cập nhật'}</div>
                  <div>Nhà xuất bản</div>
                  <div className="font-medium text-black">{book.Publisher?.publisher_name || 'Đang cập nhật'}</div>
                </div>
                <div className="mt-2 border-t pt-6">
                  <span className="font-bold text-gray-700 block mb-3">Số lượng:</span>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center border border-gray-300 w-max rounded-md h-[44px]">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-4 hover:bg-gray-100 text-gray-600 h-full font-bold"
                      >
                        -
                      </button>
                      <span className="w-14 text-center font-bold text-gray-700 border-l border-r border-gray-100 leading-[44px]">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="px-4 hover:bg-gray-100 text-gray-600 h-full font-bold"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={book.stock_quantity <= 0}
                      className="h-[44px] border-2 border-[#C92127] text-[#C92127] font-bold rounded-lg hover:bg-red-50 transition px-6 disabled:opacity-50"
                    >
                      Thêm vào giỏ
                    </button>
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      disabled={book.stock_quantity <= 0}
                      className="h-[44px] bg-[#C92127] text-white font-bold rounded-lg hover:bg-red-700 transition px-8 disabled:opacity-50 shadow-md"
                    >
                      Mua Ngay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {book ? (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-xl font-bold uppercase border-b pb-3 mb-4 text-gray-800">Mô tả sản phẩm</h3>
            <div className="text-gray-700 leading-relaxed space-y-3 text-justify">
              <p>{book.description || 'Đang cập nhật mô tả...'}</p>
            </div>
          </div>
        ) : null}

        {!isLoading && !book ? (
          <div className="text-center py-20 bg-white rounded-lg">
            <p className="text-gray-500 mb-4 text-lg">Không tìm thấy sách này.</p>
            <Link to="/" className="text-pink-600 hover:underline font-medium">
              Quay lại trang chủ
            </Link>
          </div>
        ) : null}
      </div>

      <div className="bg-white border-t border-gray-100 pt-8 pb-4">
        <div className="container mx-auto px-4">
          <SuggestionsPage isEmbedded />
        </div>
      </div>
    </div>
  );
}
