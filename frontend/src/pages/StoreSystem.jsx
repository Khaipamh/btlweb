export default function StoreSystem() {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-pink-600 mb-2 uppercase">Hệ Thống Nhà Sách Sahafa</h1>
          <p className="text-gray-600">Tìm nhà sách gần bạn nhất để trải nghiệm không gian văn hóa đọc</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col lg:flex-row min-h-[500px] border border-gray-200">
          <div className="w-full lg:w-1/3 border-r border-gray-200 p-4">
            <h3 className="font-bold text-gray-800 mb-2">Sahafa Store Hà Nội</h3>
            <p className="text-sm text-gray-600 mb-2">Đang cập nhật địa chỉ...</p>
            <p className="text-xs text-gray-500">Hotline: 1900 636469 · 8:00 - 22:00</p>
          </div>
          <div className="w-full lg:w-2/3 bg-gray-200 min-h-[400px]">
            <iframe
              title="map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096814183571!2d105.85017607504866!3d21.02881188778021!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab9bd9861ca1%3A0xe7887f7b72ca17a9!2zSOG7kyBHxrDGoW0!5e0!3m2!1svi!2s!4v1703000000000!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '400px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
