import { Link } from 'react-router-dom';
import SuggestionsPage from '@/pages/SuggestionsPage';

export default function MangaPage() {
  return (
    <div className="bg-[#fdf2f8] min-h-screen pb-10">
      <div className="bg-pink-600 text-white py-12 text-center border-b-8 border-black">
        <h1 className="text-5xl md:text-7xl font-black uppercase drop-shadow-lg">Manga World</h1>
        <p className="mt-4 text-pink-100 font-bold">Khám phá truyện tranh bản quyền</p>
      </div>
      <div className="container mx-auto px-4 py-8 text-center">
        <Link to="/books" className="inline-block bg-pink-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-pink-700">
          Xem tất cả sách
        </Link>
      </div>
      <div className="mt-8 bg-pink-50 pt-8 pb-0 rounded-t-[3rem]">
        <div className="container mx-auto px-4">
          <SuggestionsPage isEmbedded />
        </div>
      </div>
    </div>
  );
}
