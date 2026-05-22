export default function About() {
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl font-bold text-pink-600 mb-4">Về Sahafa Bookstore</h1>
              <div className="w-20 h-1 bg-yellow-400 mb-6" />
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                &quot;Sách là ngọn đèn sáng bất diệt của trí tuệ con người.&quot;
              </p>
              <p className="text-gray-600 leading-relaxed text-justify">
                Thành lập năm 2024, Sahafa.com mang trong mình sứ mệnh lan tỏa văn hóa đọc đến với thế hệ trẻ Việt Nam. Chúng tôi không chỉ bán sách, chúng tôi trao gửi tri thức và những giấc mơ.
              </p>
            </div>
            <div className="md:w-1/2 bg-pink-100 h-64 md:h-auto relative min-h-[280px]">
              <img
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                className="absolute inset-0 w-full h-full object-cover"
                alt="About Sahafa"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { border: 'border-pink-500', num: '1', title: 'Sách Thật 100%', text: 'Cam kết phân phối sách bản quyền từ các NXB uy tín hàng đầu Việt Nam.' },
            { border: 'border-yellow-400', num: '2', title: 'Giao Nhanh', text: 'Đóng gói cẩn thận, giao hàng nhanh để sách đến tay bạn nguyên vẹn nhất.' },
            { border: 'border-red-500', num: '3', title: 'Tận Tâm', text: 'Đội ngũ hỗ trợ nhiệt tình, luôn lắng nghe và giải quyết mọi thắc mắc của độc giả.' },
          ].map((c) => (
            <div key={c.num} className={`bg-white p-6 rounded-xl shadow-sm text-center border-t-4 ${c.border}`}>
              <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                {c.num}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{c.title}</h3>
              <p className="text-gray-600 text-sm">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
