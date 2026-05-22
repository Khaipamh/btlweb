import SuggestionsPage from '@/pages/SuggestionsPage';

const englishBooks = [
  { id: 1, title: 'Mindset For IELTS - Level 1 Student Book', price: 437000, oldPrice: 461000, discount: 5, image: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_36793.jpg' },
  { id: 2, title: 'English Grammar in Use - 4th Edition', price: 188000, oldPrice: 198000, discount: 5, image: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244878332.jpg' },
];

export default function ForeignBooksPage() {
  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      <div className="bg-indigo-700 text-white py-12 text-center">
        <h1 className="text-4xl font-black uppercase">Ngoại văn</h1>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {englishBooks.map((book) => (
            <div key={book.id} className="bg-white rounded-lg p-3 shadow">
              <div className="relative pt-[120%] mb-2 bg-gray-50 rounded-lg overflow-hidden">
                <img src={book.image} className="absolute inset-0 w-full h-full object-contain p-3" alt="" />
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">-{book.discount}%</div>
              </div>
              <h3 className="text-sm font-bold text-gray-800 line-clamp-2 h-10">{book.title}</h3>
              <div className="text-red-600 font-bold mt-1">{book.price.toLocaleString('vi-VN')}đ</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 bg-pink-50 pt-8 pb-0 rounded-t-[3rem]">
        <div className="container mx-auto px-4">
          <SuggestionsPage isEmbedded />
        </div>
      </div>
    </div>
  );
}
