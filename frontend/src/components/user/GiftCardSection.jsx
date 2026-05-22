import { Link } from 'react-router-dom';

const giftCards = [
  {
    id: 1,
    title: 'Christmas Gift Card 200K',
    image: 'https://placehold.co/600x375/166534/FFF?text=Christmas+Gift+Card',
  },
  {
    id: 2,
    title: 'Gift Card 200K',
    image: 'https://placehold.co/600x375/991b1b/FFF?text=Gift+Card+200K',
  },
  {
    id: 3,
    title: 'Gift Card Premium',
    image: 'https://placehold.co/600x375/0f172a/FFF?text=Gift+Card+Premium',
  },
  {
    id: 4,
    title: 'Gift Card 100K',
    image: 'https://placehold.co/600x375/475569/FFF?text=Winter+100K',
  },
];

export default function GiftCardSection() {
  return (
    <div className="container mx-auto mt-6 px-4">
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
          <img src="https://cdn-icons-png.flaticon.com/512/3595/3595827.png" className="w-6 h-6" alt="" />
          <h2 className="text-lg md:text-xl font-bold text-gray-800 uppercase">Phiếu quà tặng - Gift Card</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {giftCards.map((card) => (
            <div key={card.id} className="rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 group">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={card.image}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  alt={card.title}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            to="/gift-card"
            className="inline-block bg-[#db2777] text-white px-12 py-2.5 rounded-lg font-bold shadow-md hover:bg-pink-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            Xem Thêm
          </Link>
        </div>
      </div>
    </div>
  );
}
