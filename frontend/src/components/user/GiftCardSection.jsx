import { Link } from 'react-router-dom';
import { EVENT_BANNERS } from '@/constants/eventBanners';

const giftCards = [
  {
    id: 1,
    title: 'Phiếu quà 1/6 — Thiếu nhi',
    image: EVENT_BANNERS.childrenDay16,
  },
  {
    id: 2,
    title: 'Gift Card Sale mùa hè 6/6',
    image: EVENT_BANNERS.summerSale66,
  },
  {
    id: 3,
    title: 'Gift Card sách hot hè',
    image: EVENT_BANNERS.summerBooksSale,
  },
  {
    id: 4,
    title: 'Ưu đãi mùa hè 100K',
    image: EVENT_BANNERS.sidePromoSummer,
  },
];

export default function GiftCardSection() {
  return (
    <div className="container mx-auto mt-6 px-4">
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
          <img src="https://cdn-icons-png.flaticon.com/512/869/869636.png" className="w-6 h-6" alt="" />
          <h2 className="text-lg md:text-xl font-bold text-gray-800 uppercase">
            Phiếu quà tặng — Sale mùa hè 1/6 & 6/6
          </h2>
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
                <span className="absolute bottom-2 left-2 right-2 text-white text-xs font-bold bg-black/50 px-2 py-1 rounded truncate">
                  {card.title}
                </span>
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
