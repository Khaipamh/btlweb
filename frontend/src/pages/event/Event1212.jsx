import { useEffect, useState } from 'react';
import CategoryNav from '@/components/user/CategoryNav';
import SuggestionsPage from '@/pages/SuggestionsPage';

const vouchers = [
  { value: '10K', condition: 'Đơn từ 120K' },
  { value: '15K', condition: 'Đơn từ 150K' },
  { value: '25K', condition: 'Đơn từ 250K' },
  { value: '50K', condition: 'Đơn từ 500K' },
];

const timeline = [
  { date: '12.12', title: 'DEAL KHỦNG', sub: 'SALE NGÀY ĐÔI' },
  { date: '15.12', title: 'DEAL VÀNG', sub: 'SALE GIỮA THÁNG' },
  { date: '25.12', title: 'DEAL HOT', sub: 'SALE CUỐI THÁNG' },
  { date: 'THỨ 4', title: 'FREESHIP', sub: 'NGẬP TRÀN' },
];

export default function Event1212() {
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
    <div className="bg-pink-600 min-h-screen font-sans pb-0">
      <div className="container mx-auto px-4 py-8">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-pink-800 to-pink-600 border-4 border-white/20">
          <div className="aspect-[3/1] flex items-center justify-center relative flex-col text-white p-8 text-center min-h-[280px]">
            <h1 className="text-[60px] md:text-[100px] font-black leading-none text-yellow-300">12.12</h1>
            <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-widest mb-6 bg-pink-900/50 px-8 py-2 rounded-full backdrop-blur-md border border-white/30 mt-4">
              Lễ Hội Mua Sắm Xanh
            </h2>
            <div className="flex gap-4 mb-6 items-center justify-center">
              <div className="flex flex-col items-center bg-white/10 p-3 rounded-xl border border-white/20 min-w-[80px]">
                <span className="text-3xl font-black">{countdown.h}</span>
                <span className="text-xs uppercase">Giờ</span>
              </div>
              <span className="text-2xl font-bold">:</span>
              <div className="flex flex-col items-center bg-white/10 p-3 rounded-xl border border-white/20 min-w-[80px]">
                <span className="text-3xl font-black">{countdown.m}</span>
                <span className="text-xs uppercase">Phút</span>
              </div>
              <span className="text-2xl font-bold">:</span>
              <div className="flex flex-col items-center bg-white/10 p-3 rounded-xl border border-white/20 min-w-[80px]">
                <span className="text-3xl font-black text-yellow-300">{countdown.s}</span>
                <span className="text-xs uppercase">Giây</span>
              </div>
            </div>
            <div className="flex gap-4 flex-wrap justify-center">
              <span className="bg-white text-pink-700 font-bold px-6 py-3 rounded-full shadow-lg">ĐỒNG GIÁ 120K</span>
              <span className="bg-yellow-400 text-red-600 font-bold px-6 py-3 rounded-full shadow-lg">VOUCHER 50%</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 mx-4 mb-4 rounded-xl border border-white/20">
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
      </div>
      <CategoryNav />
      <div className="container mx-auto px-4 pb-12 text-center text-white">
        <h2 className="text-3xl font-bold uppercase drop-shadow-md mb-8">Lịch Săn Deal</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {timeline.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 w-40 md:w-48 border-b-8 border-yellow-400 shadow-xl text-gray-800">
              <div className="text-4xl font-black text-pink-700 mb-1">{item.date}</div>
              <div className="text-sm font-bold uppercase">{item.title}</div>
              <div className="text-xs text-gray-500 uppercase">{item.sub}</div>
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
