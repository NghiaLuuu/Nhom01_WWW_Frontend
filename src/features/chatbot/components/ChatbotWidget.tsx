import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { api } from '../../../services/api';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  actionTripId?: string | null;
}

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'bot', text: 'Xin chào! Tôi là trợ lý ảo AI của VEXE. Tôi có thể giúp gì cho bạn hôm nay? (Ví dụ: Tìm chuyến xe rẻ nhất đi Đà Lạt)' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Endpoint /api/chatbot/ask (Text-to-SQL backend)
      const res = await api.post('/chatbot/ask', { question: userMessage.text });
      
      let replyText = 'Xin lỗi, tôi không thể trả lời câu hỏi này lúc này.';
      if (res.data?.data?.answer) {
        replyText = res.data.data.answer;
      } else if (res.data?.answer) {
        replyText = res.data.answer;
      } else if (typeof res.data?.data === 'string') {
        replyText = res.data.data;
      } else if (typeof res.data === 'string') {
        replyText = res.data;
      }

      let actionTripId: string | null = null;
      const bookMatch = replyText.match(/\[\[BOOK_TRIP_ID:\s*(\d+)\s*\]\]/i);
      if (bookMatch) {
        actionTripId = bookMatch[1];
        replyText = replyText.replace(bookMatch[0], '').trim();
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: replyText,
        actionTripId: actionTripId
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      // Mock response if endpoint fails
      setTimeout(() => {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'Xin lỗi, hệ thống AI Chatbot đang bảo trì. Vui lòng thử lại sau.'
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
      return; // Skip the default setIsTyping(false) below since it's in setTimeout
    }
    setIsTyping(false);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 z-50 animate-bounce"
        >
          <MessageSquare size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-8">
          {/* Header */}
          <div className="bg-blue-600 px-4 py-3 flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <Bot size={24} />
              <div>
                <h3 className="font-bold text-sm">Trợ Lý AI - VEXE</h3>
                <p className="text-xs text-blue-100">Luôn sẵn sàng hỗ trợ</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-blue-100 text-blue-600 ml-2' : 'bg-gray-200 text-gray-600 mr-2'}`}>
                    {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'}`}>
                    {msg.text}
                    {msg.actionTripId && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <button 
                          onClick={() => {
                            setIsOpen(false);
                            window.location.href = `/search?tripId=${msg.actionTripId}`;
                          }}
                          className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors text-center block"
                        >
                          👉 Đặt vé & Thanh toán chuyến xe này
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex flex-row max-w-[80%]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200 text-gray-600 mr-2">
                    <Bot size={16} />
                  </div>
                  <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-200">
            <form onSubmit={handleSend} className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi..."
                className="flex-1 px-4 py-2.5 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl outline-none transition-all text-sm"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send size={18} className="ml-1" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
