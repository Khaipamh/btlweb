import { useEffect, useState } from 'react';
import { EVENT_BANNERS } from '@/constants/eventBanners';
import CategoryNav from '@/components/user/CategoryNav';
import SuggestionsPage from '@/pages/SuggestionsPage';

const vouchers = [
  { value: '10K', condition: 'Đơn từ 120K — 1/6' },
  { value: '20K', condition: 'Đơn từ 200K — 6/6' },
  { value: '30K', condition: 'Đơn từ 300K' },
  { value: '50K', condition: 'Đơn từ 500K' },
];

const timeline = [
  { date: '01.06', title: 'THIẾU NHI', sub: 'QUÀ 1/6 — GIẢM SÂU', image: EVENT_BANNERS.childrenDay16 },
  { date: '06.06', title: 'SIÊU SALE', sub: 'MÙA HÈ — NGÀY 6/6', image: EVENT_BANNERS.summerSale66 },
  { date: 'HÈ 2026', title: 'SÁCH HOT', sub: 'SALE MÙA HÈ', image: EVENT_BANNERS.summerBooksSale },
  { date: 'THỨ 4', title: 'FREESHIP', sub: 'GIAO NHANH', image: EVENT_BANNERS.sidePromoSummer },
];

export default function EventSummerSale() {
  const [countdown, setCountdown] = useState({ h: '02', m: '45', s: '12' });

  useEffect(() => {
    let totalSeconds = 2 * 3600 + 45 * 60 + 12;
    const t = setInterval(() => {
      if (totalSeconds <= 0) {
        clearInterval(t);
        return;
      }
      totalSeconds -= 1;
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      setCountdown({
        h: h.toString().padStart(2, '0'),
        m: m.toString().padStart(2, '0'),
        s: s.toString().padStart(2, '0'),
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-gradient-to-b from-amber-400 via-orange-400 to-pink-500 min-h-screen font-sans pb-0">
      <div className="container mx-auto px-4 py-8">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/30 min-h-[320px]">
          <img
            src={EVENT_BANNERS.summerSale66}
            alt="Sale mùa hè 6/6"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-orange-600/85 via-pink-600/75 to-pink-700/90" />
          <div className="relative aspect-[3/1] flex items-center justify-center flex-col text-white p-8 text-center min-h-[280px]">
            <p className="text-sm md:text-lg font-bold uppercase tracking-[0.3em] text-yellow-200 mb-2">
              Sale mùa hè · 1/6 & 6/6
            </p>
            <h1 className="text-[48px] md:text-[90px] font-black leading-none text-yellow-300 drop-shadow-lg">
              6.6
            </h1>
            <h2 className="text-xl md:text-3xl font-bold uppercase tracking-widest mb-2 bg-white/15 px-8 py-2 rounded-full backdrop-blur-md border border-white/30 mt-2">
              Lễ hội mua sách mùa hè
            </h2>
            <p className="text-base md:text-lg text-white/90 mb-6 max-w-xl">
              Ưu đãi ngày Quốc tế Thiếu nhi <strong>1/6</strong> và siêu sale <strong>6/6</strong>
            </p>
            <div className="flex gap-4 mb-6 items-center justify-center">
              <div className="flex flex-col items-center bg-white/15 p-3 rounded-xl border border-white/25 min-w-[80px]">
                <span className="text-3xl font-black">{countdown.h}</span>
                <span className="text-xs uppercase">Giờ</span>
              </div>
              <span className="text-2xl font-bold">:</span>
              <div className="flex flex-col items-center bg-white/15 p-3 rounded-xl border border-white/25 min-w-[80px]">
                <span className="text-3xl font-black">{countdown.m}</span>
                <span className="text-xs uppercase">Phút</span>
              </div>
              <span className="text-2xl font-bold">:</span>
              <div className="flex flex-col items-center bg-white/15 p-3 rounded-xl border border-white/25 min-w-[80px]">
                <span className="text-3xl font-black text-yellow-300">{countdown.s}</span>
                <span className="text-xs uppercase">Giây</span>
              </div>
            </div>
            <div className="flex gap-4 flex-wrap justify-center">
              <span className="bg-white text-pink-700 font-bold px-6 py-3 rounded-full shadow-lg">QUÀ 1/6</span>
              <span className="bg-yellow-400 text-orange-800 font-bold px-6 py-3 rounded-full shadow-lg">SALE 6/6</span>
            </div>
          </div>
          <div className="relative bg-white/10 backdrop-blur-md p-4 mx-4 mb-4 rounded-xl border border-white/20">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {vouchers.map((v, index) => (
                <div key={index} className="bg-white flex rounded-lg overflow-hidden h-24 min-w-[260px] shadow-lg shrink-0">
                  <div className="p-3 flex-1 flex flex-col justify-center border-r border-dashed border-gray-200">
                    <h3 className="text-pink-700 font-bold text-lg">Giảm {v.value}</h3>
                    <p className="text-xs text-gray-500">{v.condition}</p>
                  </div>
                  <div className="w-20 flex items-center justify-center p-2 bg-pink-50">
                    <span className="text-xs font-bold bg-pink-600 text-white px-3 py-1.5 rounded">Lưu</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="relative rounded-2xl overflow-hidden shadow-lg h-40 md:h-48 border-2 border-white/50">
            <img src={EVENT_BANNERS.childrenDay16} alt="Sự kiện 1/6" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600/80 to-transparent flex items-center p-6">
              <div className="text-white">
                <span className="text-4xl font-black">1.6</span>
                <p className="font-bold uppercase text-sm mt-1">Ngày Quốc tế Thiếu nhi</p>
              </div>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-lg h-40 md:h-48 border-2 border-white/50">
            <img src={EVENT_BANNERS.summerBooksSale} alt="Siêu sale 6/6" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/80 to-transparent flex items-center p-6">
              <div className="text-white">
                <span className="text-4xl font-black">6.6</span>
                <p className="font-bold uppercase text-sm mt-1">Siêu sale mùa hè</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CategoryNav />
      <div className="container mx-auto px-4 pb-12 text-center text-white">
        <h2 className="text-3xl font-bold uppercase drop-shadow-md mb-8">Lịch săn deal mùa hè</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {timeline.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden w-44 md:w-52 border-b-8 border-yellow-400 shadow-xl text-gray-800"
            >
              <div className="h-24 overflow-hidden">
                <img src={item.image} alt={item.date} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="text-3xl font-black text-pink-700 mb-1">{item.date}</div>
                <div className="text-sm font-bold uppercase">{item.title}</div>
                <div className="text-xs text-gray-500 uppercase">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 bg-pink-50 pt-8 pb-0 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] relative z-10">
        <div className="container mx-auto px-4">
          <SuggestionsPage isEmbedded />
        </div>
      </div>
    </div>
  );
}
