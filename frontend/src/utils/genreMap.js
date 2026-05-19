export const genreMap = {
  fiction: { vi: 'Tiểu Thuyết', icon: 'https://cdn-icons-png.flaticon.com/512/2232/2232688.png' },
  'science-fiction': { vi: 'Viễn Tưởng', icon: 'https://cdn-icons-png.flaticon.com/512/2040/2040660.png' },
  mystery: { vi: 'Trinh Thám', icon: 'https://cdn-icons-png.flaticon.com/512/3079/3079120.png' },
  romance: { vi: 'Lãng Mạn', icon: 'https://cdn-icons-png.flaticon.com/512/1077/1077035.png' },
  horror: { vi: 'Kinh Dị', icon: 'https://cdn-icons-png.flaticon.com/512/3079/3079140.png' },
  'self-help': { vi: 'Kỹ Năng Sống', icon: 'https://cdn-icons-png.flaticon.com/512/3079/3079166.png' },
  business: { vi: 'Kinh Doanh', icon: 'https://cdn-icons-png.flaticon.com/512/2666/2666505.png' },
  history: { vi: 'Lịch Sử', icon: 'https://cdn-icons-png.flaticon.com/512/3389/3389081.png' },
  biography: { vi: 'Hồi Ký', icon: 'https://cdn-icons-png.flaticon.com/512/167/167755.png' },
  fantasy: { vi: 'Giả Tưởng', icon: 'https://cdn-icons-png.flaticon.com/512/3468/3468306.png' },
};

export function getGenreInfo(genre) {
  const info = genreMap[genre.genre_slug];
  return {
    viName: info ? info.vi : genre.genre_name,
    icon: info ? info.icon : 'https://cdn-icons-png.flaticon.com/512/29/29302.png',
  };
}
