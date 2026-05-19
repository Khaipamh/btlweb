import { useEffect, useRef, useState } from 'react';
import api from '@/services/api';

function formatMessage(text) {
  if (!text) return '';
  let formatted = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/^\s*-\s+(.*)$/gm, '• $1');
  formatted = formatted.replace(/\n/g, '<br>');
  return formatted;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Chào bạn! Cần tìm sách gì cứ hỏi mình nha 👇', isUser: false },
  ]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!userInput.trim()) return;
    const text = userInput;
    setMessages((m) => [...m, { text, isUser: true }]);
    setUserInput('');
    setLoading(true);
    try {
      const res = await api.post('/api/chat', { message: text });
      setMessages((m) => [
        ...m,
        { text: res.reply || res.data?.reply || 'Không có phản hồi.', isUser: false },
      ]);
    } catch {
      setMessages((m) => [...m, { text: 'Lỗi kết nối rồi huhu.', isUser: false }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen ? (
        <div className="bg-white shadow-2xl rounded-lg w-80 h-96 flex flex-col mb-4 overflow-hidden border border-gray-200 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-blue-600 p-3 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <span>💬</span>
              <span className="font-bold">Trợ lý ảo Sahafa</span>
            </div>
            <button type="button" className="cursor-pointer hover:text-gray-200" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>
          <div ref={messagesContainerRef} className="flex-1 p-3 overflow-y-auto bg-gray-50 flex flex-col gap-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[85%] p-2 rounded-lg text-sm leading-relaxed shadow-sm ${
                  msg.isUser
                    ? 'bg-blue-500 text-white self-end rounded-br-none'
                    : 'bg-white text-gray-800 self-start border border-gray-200 rounded-bl-none'
                }`}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
              />
            ))}
            {loading ? (
              <div className="self-start bg-gray-100 text-gray-500 text-xs rounded-lg p-2">Đang trả lời...</div>
            ) : null}
          </div>
          <div className="p-2 border-t border-gray-100 bg-white flex gap-2 items-center">
            <input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Nhập tin nhắn..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!userInput.trim() || loading}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
            >
              ➤
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg transition-all hover:scale-105 flex items-center justify-center ring-4 ring-blue-100"
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
}
