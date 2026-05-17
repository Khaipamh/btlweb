import { Link } from 'react-router-dom';
import SuggestionsPage from '@/pages/SuggestionsPage';

export default function MangaPage() {
  return (
    <div className="bg-[#F0F8FF] min-h-screen pb-10">
      <div className="bg-blue-600 text-white py-12 text-center border-b-8 border-black">
        <h1 className="text-5xl md:text-7xl font-black uppercase drop-shadow-lg">Manga World</h1>
        <p className="mt-4 text-blue-100 font-bold">Khám phá truyện tranh bản quyền</p>
      </div>
      <div className="container mx-auto px-4 py-8 text-center">
        <Link to="/books" className="inline-block bg-blue-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700">
          Xem tất cả sách
        </Link>
      </div>
      <div className="mt-8 bg-blue-50 pt-8 pb-0 rounded-t-[3rem]">
        <div className="container mx-auto px-4">
          <SuggestionsPage isEmbedded />
        </div>
      </div>
    </div>
  );
}
