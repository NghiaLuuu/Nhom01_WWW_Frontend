import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../../../services/api';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  actionTripIds?: string[];
}

const QUICK_SUGGESTIONS = [
  'Xe Sài Gòn đi Đà Lạt',
  'Hà Nội đi Sapa sáng mai',
  'Xe Limousine giường đôi',
  'Giá vé Đà Nẵng đi Huế'
];

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [bubbleText, setBubbleText] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const anonId = localStorage.getItem('vexe_anon_id');
      if (anonId?.includes('dalat')) {
        setBubbleText("Em có chuyến Đà Lạt Limousine tối nay đúng gu bạn nè! ✨");
      } else if (anonId?.includes('nhatrang')) {
        setBubbleText("Em có chuyến Nha Trang giá ưu đãi cho gia đình nè! 🏖️");
      } else {
        setBubbleText("Cần em gợi ý chuyến xe phù hợp theo gu của bạn không? 🚌");
      }
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: '**Xin chào!** Em là trợ lý thông minh của **VEXE** 🚌.\nEm có thể giúp bạn tra cứu chuyến xe, so sánh giá vé và hỗ trợ đặt vé nhanh chóng.\n\n*Bạn muốn đi đâu hôm nay?*'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim()
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.post('/chatbot/ask', { message: textToSend.trim() });
      const botResponseText = res.data?.data?.response || res.data?.response || 'Xin lỗi, em chưa hiểu câu hỏi của bạn. Bạn vui lòng thử lại nhé!';
      
      const tripIdRegex = /#(\d+)/g;
      const foundTripIds: string[] = [];
      let match;
      while ((match = tripIdRegex.exec(botResponseText)) !== null) {
        if (!foundTripIds.includes(match[1])) {
          foundTripIds.push(match[1]);
        }
      }

      setMessages([
        ...nextMessages,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: botResponseText,
          actionTripIds: foundTripIds.length > 0 ? foundTripIds : undefined
        }
      ]);
    } catch {
      setMessages([
        ...nextMessages,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'Hệ thống đang bảo trì kết nối trợ lý. Bạn vui lòng sử dụng thanh tìm kiếm trực tiếp trên trang chủ nhé!'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      let isBullet = false;
      let cleanLine = line;

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        isBullet = true;
        cleanLine = line.trim().slice(2);
      }

      const parts = cleanLine.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={pIdx} className="italic text-slate-300">{part.slice(1, -1)}</em>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start space-x-1.5 my-0.5">
            <span className="text-cyan-400 font-bold">•</span>
            <span>{formattedParts}</span>
          </div>
        );
      }

      return (
        <span key={idx} className="block min-h-[1.2em]">
          {formattedParts}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Button with Smart Recommendation Bubble */}
      {!isOpen && (
        <div className="chat-widget fab fixed bottom-6 right-6 flex items-end gap-3 z-50">
          {bubbleText && (
            <div 
              onClick={() => setIsOpen(true)}
              className="cursor-pointer relative mb-1.5 hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 shadow-xl max-w-xs group hover:border-cyan-500 transition-colors"
            >
              <Sparkles size={16} className="text-cyan-400 shrink-0" />
              <span className="text-xs font-medium leading-snug">{bubbleText}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBubbleText(null);
                }}
                className="text-slate-400 hover:text-white p-0.5 rounded-full shrink-0 transition-colors"
                title="Đóng thông báo"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <button
            onClick={() => setIsOpen(true)}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center transition-colors group relative cursor-pointer"
            title="Mở trợ lý tư vấn vé xe"
          >
            <MessageSquare size={22} className="text-white" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[360px] sm:w-[420px] h-[540px] max-h-[85vh] bg-slate-850 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 flex flex-col z-50 overflow-hidden text-slate-100">
          {/* Header */}
          <div className="bg-slate-900 px-4 py-3.5 flex items-center justify-between text-white border-b border-slate-750">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-cyan-400">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                  Trợ Lý Tư Vấn VEXE
                  <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">Online</span>
                </h3>
                <p className="text-xs text-slate-400">Tra cứu lịch trình & gợi ý chuyến xe</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Thu nhỏ cửa sổ chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Suggestions */}
          <div className="bg-slate-900/60 px-3 py-2 flex items-center gap-1.5 overflow-x-auto border-b border-slate-700/80">
            <span className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1 shrink-0">
              <Sparkles size={12} /> Gợi ý:
            </span>
            {QUICK_SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                onClick={() => sendMessage(sug)}
                disabled={isTyping}
                className="text-[11px] whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-2.5 py-1 rounded-md border border-slate-650 border-slate-700 transition-colors shadow-2xs font-medium cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-900/80 space-y-3.5">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.sender === 'user' ? 'bg-blue-600 text-white ml-2' : 'bg-slate-800 text-cyan-400 border border-slate-700 mr-2'
                    }`}
                  >
                    {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none shadow-2xs'
                    }`}
                  >
                    <div>{renderFormattedText(msg.text)}</div>

                    {/* Action buttons if trip IDs found */}
                    {msg.actionTripIds && msg.actionTripIds.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-700 space-y-1.5">
                        {msg.actionTripIds.map((tripId) => (
                          <button
                            key={tripId}
                            onClick={() => {
                              setIsOpen(false);
                              window.location.href = `/search?tripId=${tripId}`;
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-1.5 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                          >
                            <span>👉 Xem chi tiết chuyến #{tripId}</span>
                            <ArrowRight size={13} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex flex-row max-w-[80%] items-center">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-slate-800 text-cyan-400 border border-slate-700 mr-2">
                    <Bot size={14} />
                  </div>
                  <div className="px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl rounded-tl-none shadow-2xs flex items-center space-x-1.5">
                    <span className="text-xs text-slate-400 font-medium">Đang soạn câu trả lời...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-slate-900 border-t border-slate-750">
            <form onSubmit={handleSend} className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi tìm xe, giá vé..."
                disabled={isTyping}
                className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 focus:border-cyan-400 rounded-lg outline-none transition-colors text-xs sm:text-sm text-white placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-9 h-9 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Gửi câu hỏi"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
