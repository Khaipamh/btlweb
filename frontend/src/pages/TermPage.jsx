import { Link, useParams } from 'react-router-dom';
import { policiesData } from '@/data/policiesData';

const menuItems = [
  { name: 'Điều khoản sử dụng', slug: 'dieu-khoan-su-dung' },
  { name: 'Chính sách bảo mật', slug: 'chinh-sach-bao-mat' },
  { name: 'Bảo mật thanh toán', slug: 'bao-mat-thanh-toan' },
  { name: 'Chính sách đổi trả', slug: 'chinh-sach-doi-tra' },
];

export default function TermPage() {
  const { slug } = useParams();
  const current = policiesData[slug] || { title: 'Không tìm thấy', content: '<p>Trang này không tồn tại.</p>', updatedAt: '' };

  return (
    <div className="bg-gray-50 py-8 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <div className="bg-white p-4 rounded-lg shadow-sm sticky top-4">
              <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Chính sách</h3>
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.slug}>
                    <Link
                      to={`/policy/${item.slug}`}
                      className={`block px-3 py-2 rounded transition-colors ${
                        slug === item.slug ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="w-full md:w-3/4">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
              <article className="prose max-w-none text-gray-700">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 pb-4 border-b">{current.title}</h1>
                <div className="policy-content space-y-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: current.content }} />
                {current.updatedAt ? (
                  <div className="mt-8 pt-4 border-t text-sm text-gray-500 italic">Cập nhật lần cuối: {current.updatedAt}</div>
                ) : null}
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
