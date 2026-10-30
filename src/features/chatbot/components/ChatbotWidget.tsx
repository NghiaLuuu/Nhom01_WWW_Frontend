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
      text: '**Xin chào!** Em là trợ lý AI thông minh của **VEXE** 🚌.\nEm có thể giúp anh/chị tìm chuyến xe, so sánh giá vé và hỗ trợ đặt vé nhanh chóng.\n\n*Anh/chị muốn đi đâu ạ?*'
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
      // Build conversation history for multi-turn RAG memory (last 6 messages)
      const historyPayload = nextMessages.slice(-6).map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const res = await api.post('/chatbot/ask', {
        question: userMessage.text,
        history: historyPayload
      });

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

      // Extract all [[BOOK_TRIP_ID:xxx]] tags from the answer
      const tripIds: string[] = [];
      const tagRegex = /\[\[BOOK_TRIP_ID:\s*(\d+)\s*\]\]/gi;
      let match: RegExpExecArray | null;
      while ((match = tagRegex.exec(replyText)) !== null) {
        if (!tripIds.includes(match[1])) {
          tripIds.push(match[1]);
        }
      }
      // Remove raw tags from display text
      replyText = replyText.replace(tagRegex, '').trim();

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: replyText,
        actionTripIds: tripIds.length > 0 ? tripIds : undefined
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setTimeout(() => {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'Xin lỗi, kết nối tới hệ thống AI đang gián đoạn. Bạn vui lòng thử lại sau giây lát ạ.'
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 500);
      return;
    }
    setIsTyping(false);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Simple, safe Markdown renderer for bold, lists, and line breaks
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      // Check for bullet points
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const cleanLine = isBullet ? line.trim().substring(2) : line;

      // Parse bold **text**
      const parts = cleanLine.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={pIdx} className="italic text-gray-700">{part.slice(1, -1)}</em>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start space-x-1.5 my-0.5">
            <span className="text-blue-500 font-bold">•</span>
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
        <div className="fixed bottom-6 right-6 flex items-end gap-3 z-50">
          {bubbleText && (
            <div 
              onClick={() => setIsOpen(true)}
              className="cursor-pointer relative mb-1.5 hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 text-white shadow-2xl shadow-cyan-950/50 animate-in fade-in slide-in-from-right-4 duration-300 max-w-xs group hover:border-cyan-400"
            >
              <Sparkles size={16} className="text-cyan-400 shrink-0 animate-pulse group-hover:scale-110 transition-transform" />
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
            className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 animate-bounce group relative"
            title="Mở trợ lý AI"
          >
            <MessageSquare size={26} className="group-hover:rotate-6 transition-transform text-white" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[360px] sm:w-[420px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 flex items-center justify-between text-white shadow-md">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles size={20} className="text-yellow-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide flex items-center gap-1.5">
                  Trợ Lý AI VEXE
                  <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-medium">pgvector</span>
                </h3>
                <p className="text-xs text-blue-100">Tư vấn lịch trình & đặt vé thông minh</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Suggestions */}
          <div className="bg-blue-50/60 px-3 py-2 flex items-center gap-1.5 overflow-x-auto border-b border-blue-100 no-scrollbar">
            <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 flex-shrink-0">
              <Sparkles size={12} /> Gợi ý:
            </span>
            {QUICK_SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                onClick={() => sendMessage(sug)}
                disabled={isTyping}
                className="text-[11px] whitespace-nowrap bg-white hover:bg-blue-600 hover:text-white text-blue-700 px-2.5 py-1 rounded-full border border-blue-200 transition-all shadow-2xs font-medium"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50/60 space-y-3.5 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      msg.sender === 'user' ? 'bg-blue-600 text-white ml-2' : 'bg-indigo-100 text-indigo-700 mr-2'
                    }`}
                  >
                    {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                        : 'bg-white border border-gray-200/80 text-gray-800 rounded-tl-none shadow-sm'
                    }`}
                  >
                    <div>{renderFormattedText(msg.text)}</div>

                    {/* Action buttons if trip IDs found */}
                    {msg.actionTripIds && msg.actionTripIds.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-1.5">
                        {msg.actionTripIds.map((tripId) => (
                          <button
                            key={tripId}
                            onClick={() => {
                              setIsOpen(false);
                              window.location.href = `/search?tripId=${tripId}`;
                            }}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-1.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                          >
                            <span>👉 Đặt vé chuyến xe #{tripId}</span>
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
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-indigo-100 text-indigo-700 mr-2">
                    <Bot size={14} />
                  </div>
                  <div className="px-4 py-2.5 bg-white border border-gray-200/80 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1.5">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <form onSubmit={handleSend} className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi tìm xe, giá vé..."
                disabled={isTyping}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl outline-none transition-all text-xs sm:text-sm"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center hover:opacity-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
