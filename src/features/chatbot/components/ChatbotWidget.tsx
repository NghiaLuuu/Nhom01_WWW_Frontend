import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  ArrowRight,
  Clock,
  Bus,
  CheckCircle2,
  AlertTriangle,
  Ticket as TicketIcon,
  CreditCard,
  Ban,
  RotateCcw,
  Check,
  ShieldCheck,
  MapPin,
  XCircle
} from 'lucide-react';
import { api } from '../../../services/api';

interface TripItem {
  tripId: number;
  routeName: string;
  departureLocation: string;
  arrivalLocation: string;
  departureTimeFormatted: string;
  priceFormatted: string;
  vehicleType: string;
  availableSeats: number;
}

interface DraftItem {
  idempotencyKey: string;
  tripId: number;
  routeName: string;
  departureTimeFormatted: string;
  vehicleType: string;
  seatNames: string[];
  totalPriceFormatted: string;
  summaryMessage: string;
}

interface PaymentItem {
  bookingId: number;
  bookingCode: string;
  transactionId: string;
  amountFormatted: string;
  qrBase64: string;
  qrPayload: string;
  expiresInSeconds: number;
  demoNote: string;
  routeName?: string;
  departureTimeFormatted?: string;
  seatNames?: string[];
}

interface TicketDetail {
  ticketId: number;
  ticketCode: string;
  seatName: string;
  floor: number;
  priceFormatted: string;
  status: string;
  qrCodeBase64: string;
}

interface TicketSuccessItem {
  bookingId: number;
  bookingCode: string;
  status: string;
  routeName: string;
  departureTimeFormatted: string;
  totalPriceFormatted: string;
  tickets: TicketDetail[];
}

interface BookingLookupItem {
  bookingId: number;
  bookingCode: string;
  routeName: string;
  departureLocation: string;
  arrivalLocation: string;
  departureTimeFormatted: string;
  vehicleType: string;
  seatNames: string[];
  ticketCount: number;
  totalPriceFormatted: string;
  status: string;
  createdAt?: string;
  createdAtFormatted?: string;
  canViewTicket?: boolean;
  isCancellable: boolean;
  nonCancellableReason?: string;
}

interface CancellationPreviewItem {
  confirmationToken: string;
  bookingId: number;
  bookingCode: string;
  routeName: string;
  departureTimeFormatted: string;
  vehicleType: string;
  seatNamesToCancel: string[];
  ticketCountToCancel: number;
  isPartialCancellation: boolean;
  remainingSeatNames: string[];
  originalAmountFormatted: string;
  feePercent: number;
  feeAmountFormatted: string;
  refundAmountFormatted: string;
  refundMethod: string;
  cancellationPolicy: string;
  expiresInSeconds: number;
  summaryMessage: string;
}

interface CancellationResultItem {
  success: boolean;
  message: string;
  bookingId: number;
  bookingCode: string;
  bookingStatus: string;
  cancelledSeats: string[];
  remainingSeats: string[];
  isPartialCancellation: boolean;
  refundAmountFormatted: string;
  cancellationFeeFormatted: string;
  refundStatus: string;
  refundTransactionId?: string;
  refundMethod?: string;
  cancelledAtFormatted: string;
}

interface DepartureOptionItem {
  departureLocation: string;
  arrivalLocation: string;
  departureDate: string;
  activeTripCount: number;
  totalAvailableSeats: number;
  minPrice: number;
  minPriceFormatted: string;
  earliestDepartureTimeFormatted: string;
  vehicleTypes: string[];
  command: string;
}

export interface SeatMapSeatItem {
  seatId: number;
  seatName?: string;
  seatNumber?: string;
  floor?: number;
  seatRow?: number;
  seatColumn?: number;
  seatType?: string;
  status: 'AVAILABLE' | 'BOOKED' | 'HELD' | string;
  price?: number;
  priceFormatted?: string;
}

export interface TripSeatMapItem {
  tripId: number;
  routeName?: string;
  departureLocation?: string;
  arrivalLocation?: string;
  departureTimeFormatted?: string;
  vehicleType?: string;
  unitPrice?: number;
  unitPriceFormatted?: string;
  requiredSeats?: number;
  passengerCount?: number;
  totalSeats?: number;
  availableSeats?: number;
  availableCount?: number;
  bookedCount?: number;
  heldCount?: number;
  floors?: number;
  seats: SeatMapSeatItem[];
}

export interface ActionPayload {
  action: string;
  tripId?: number;
  seatIds?: number[];
  seatNames?: string[];
  departureLocation?: string;
  passengerCount?: number;
  stateVersion?: number;
  idempotencyKey?: string;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  actionTripIds?: string[];
  cardType?: 'DEPARTURE_SELECTION' | 'TRIP_LIST' | 'SEAT_SELECTION' | 'SEAT_SELECTION_CARD' | 'BOOKING_CONFIRMATION' | 'DEMO_PAYMENT_QR' | 'TICKET_SUCCESS' | 'BOOKING_LOOKUP' | 'MY_BOOKINGS' | 'CANCELLATION_PREVIEW' | 'CANCELLATION_SUCCESS';
  trips?: TripItem[];
  draft?: DraftItem;
  payment?: PaymentItem;
  ticket?: TicketSuccessItem;
  bookings?: BookingLookupItem[];
  hasMore?: boolean;
  totalBookingsCount?: number;
  cancelPreview?: CancellationPreviewItem;
  cancelResult?: CancellationResultItem;
  tripId?: number;
  passengerCount?: number;
  departureOptions?: DepartureOptionItem[];
  seatMap?: TripSeatMapItem;
}

const QUICK_SUGGESTIONS = [
  'Hủy giúp tôi 2 vé đi Đà Lạt tối mai',
  'Đặt giúp tôi 2 vé đi Đà Lạt tối mai',
  'Xem đơn đặt vé của tôi',
  'Xe Sài Gòn đi Đà Lạt'
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
        setBubbleText("Cần em hỗ trợ tìm chuyến, đặt vé hoặc hủy vé nhanh không? 🚌");
      }
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: '**Xin chào!** Em là trợ lý AI thông minh của **VEXE** 🚌.\nEm có thể giúp anh/chị tra cứu chuyến xe, đặt vé, xem vé đã mua hoặc **tự động hỗ trợ hủy vé & hoàn tiền** trực tiếp ngay trong chat.\n\n*Gợi ý câu hỏi:*\n- *"Các chuyến xe khởi hành vào ngày mai"*\n- *"Xe Sài Gòn đi Đà Lạt"*\n- *"Xem đơn đặt vé của tôi"*\n- *"Đặt giúp tôi 2 vé đến Đà Lạt ngày mai"*\n- *"Hủy vé đến Đà Lạt"*'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState<string>(() => {
    let sid = localStorage.getItem('ai_booking_session_id');
    if (!sid) {
      sid = 'session_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      localStorage.setItem('ai_booking_session_id', sid);
    }
    return sid;
  });

  // Persistent Booking Session State
  const [selectedDeparture, setSelectedDeparture] = useState<string | null>(() => {
    return localStorage.getItem('ai_booking_departure') || null;
  });
  const [selectedTripId, setSelectedTripId] = useState<number | null>(() => {
    const val = localStorage.getItem('ai_booking_trip_id');
    return val ? Number(val) : null;
  });
  const [passengerCount, setPassengerCount] = useState<number>(() => {
    const val = localStorage.getItem('ai_booking_passenger_count');
    return val ? Number(val) : 2;
  });
  const [stateVersion, setStateVersion] = useState<number>(() => {
    const val = localStorage.getItem('ai_booking_state_version');
    return val ? Number(val) : 1;
  });

  useEffect(() => {
    if (selectedDeparture) localStorage.setItem('ai_booking_departure', selectedDeparture);
    else localStorage.removeItem('ai_booking_departure');
  }, [selectedDeparture]);

  useEffect(() => {
    if (selectedTripId) localStorage.setItem('ai_booking_trip_id', String(selectedTripId));
    else localStorage.removeItem('ai_booking_trip_id');
  }, [selectedTripId]);

  useEffect(() => {
    localStorage.setItem('ai_booking_passenger_count', String(passengerCount));
  }, [passengerCount]);

  useEffect(() => {
    localStorage.setItem('ai_booking_state_version', String(stateVersion));
  }, [stateVersion]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const sendMessage = async (textToSend: string, actionPayload?: ActionPayload) => {
    if ((!textToSend.trim() && !actionPayload?.action) || isTyping) return;

    let displayText = textToSend.trim();
    if (displayText.startsWith('SELECT_DEPARTURE:')) {
      displayText = `Chọn khởi hành từ ${displayText.substring(17)}`;
    } else if (displayText.startsWith('SELECT_TRIP:')) {
      displayText = `Chọn chuyến xe #${displayText.substring(12)}`;
    } else if (displayText.startsWith('SELECT_SEATS:')) {
      displayText = `Chọn ghế: ${displayText.substring(13)}`;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: displayText
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsTyping(true);

    try {
      const historyPayload = nextMessages.slice(-8).map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const lower = textToSend.toLowerCase();
      const isCancelRequest = lower.includes('hủy') || lower.includes('giữ lại vé')
        || lower.startsWith('select_booking_to_cancel') || lower.startsWith('confirm_cancellation')
        || lower.startsWith('keep_tickets');

      const requestPayload: any = {
        question: textToSend.trim(),
        sessionId: sessionId,
        conversationId: sessionId,
        history: historyPayload
      };

      if (actionPayload) {
        if (actionPayload.action) requestPayload.action = actionPayload.action;
        if (actionPayload.tripId) requestPayload.tripId = actionPayload.tripId;
        if (actionPayload.seatIds) requestPayload.seatIds = actionPayload.seatIds;
        if (actionPayload.seatNames) requestPayload.seatNames = actionPayload.seatNames;
        if (actionPayload.departureLocation) requestPayload.departureLocation = actionPayload.departureLocation;
        if (actionPayload.passengerCount) requestPayload.passengerCount = actionPayload.passengerCount;
        if (actionPayload.stateVersion) requestPayload.stateVersion = actionPayload.stateVersion;
        if (actionPayload.idempotencyKey) requestPayload.idempotencyKey = actionPayload.idempotencyKey;
      }

      let res;
      try {
        res = await api.post('/chatbot/ask', requestPayload);
      } catch {
        if (isCancelRequest) {
          res = await api.post('/chatbot/cancellation-assistant', requestPayload);
        } else {
          res = await api.post('/chatbot/booking-assistant', requestPayload);
        }
      }

      const resData = res.data?.data || res.data || {};
      let replyText = resData.answer || 'Xin lỗi, em chưa thể xử lý yêu cầu lúc này. Anh/chị vui lòng thử lại nhé!';

      // Extract all [[BOOK_TRIP_ID:xxx]] tags if present
      const tripIds: string[] = [];
      const tagRegex = /\[\[BOOK_TRIP_ID:\s*(\d+)\s*\]\]/gi;
      let match: RegExpExecArray | null;
      while ((match = tagRegex.exec(replyText)) !== null) {
        if (!tripIds.includes(match[1])) {
          tripIds.push(match[1]);
        }
      }
      replyText = replyText.replace(tagRegex, '').trim();

      // Synchronize booking session state from backend
      if (resData.actionData) {
        if (resData.actionData.stateVersion) setStateVersion(resData.actionData.stateVersion);
        if (resData.actionData.passengerCount) setPassengerCount(resData.actionData.passengerCount);
        if (resData.actionData.tripId) setSelectedTripId(resData.actionData.tripId);
        if (resData.actionData.departureLocation) setSelectedDeparture(resData.actionData.departureLocation);
      }
      if (resData.stateVersion) setStateVersion(resData.stateVersion);
      if (resData.passengerCount && resData.passengerCount > 0) setPassengerCount(resData.passengerCount);
      if (resData.tripId) setSelectedTripId(resData.tripId);
      const seatMapRequiredSeats = resData.seatMap?.passengerCount || resData.seatMap?.requiredSeats;
      if (seatMapRequiredSeats && seatMapRequiredSeats > 0) setPassengerCount(seatMapRequiredSeats);

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: replyText,
        actionTripIds: tripIds.length > 0 ? tripIds : undefined,
        cardType: resData.cardType,
        trips: resData.trips,
        draft: resData.draft,
        payment: resData.payment,
        ticket: resData.ticket,
        bookings: resData.bookings,
        hasMore: resData.hasMore,
        totalBookingsCount: resData.totalBookingsCount,
        cancelPreview: resData.preview,
        cancelResult: resData.result,
        tripId: resData.tripId,
        passengerCount: resData.passengerCount,
        departureOptions: resData.departureOptions,
        seatMap: resData.seatMap
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setTimeout(() => {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'Xin lỗi, kết nối tới hệ thống AI đang gián đoạn. Quý khách vui lòng thử lại sau giây lát ạ.'
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

  // Safe Markdown renderer for bold, italics, bullets, code
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const cleanLine = isBullet ? line.trim().substring(2) : line;

      const parts = cleanLine.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={pIdx} className="italic text-gray-700">{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={pIdx} className="bg-gray-100 text-blue-700 px-1 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
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
        <div className="chat-widget fab fixed bottom-6 right-6 flex items-end gap-3 z-50">
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
            className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group relative shadow-blue-500/30"
            title="Mở trợ lý AI"
          >
            <MessageSquare size={22} className="group-hover:rotate-6 transition-transform text-white" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </span>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[360px] sm:w-[440px] h-[590px] max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 flex items-center justify-between text-white shadow-md">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles size={20} className="text-yellow-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide flex items-center gap-1.5">
                  Trợ Lý AI VEXE
                  <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-medium">Đặt & Hủy Vé</span>
                </h3>
                <p className="text-xs text-blue-100">Hỗ trợ đặt vé, QR demo & hủy vé tự động</p>
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
          <div className="flex-1 p-3.5 overflow-y-auto bg-slate-50/60 space-y-3.5 custom-scrollbar">
            {messages.map((msg, index) => {
              const isLatestMessage = index === messages.length - 1;
              return (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[92%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      msg.sender === 'user' ? 'bg-blue-600 text-white ml-2' : 'bg-indigo-100 text-indigo-700 mr-2'
                    }`}
                  >
                    {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                        : 'bg-white border border-gray-200/80 text-gray-800 rounded-tl-none shadow-sm'
                    }`}
                  >
                    <div>{renderFormattedText(msg.text)}</div>

                    {/* CARD TYPE 0: DEPARTURE SELECTION */}
                    {msg.departureOptions && msg.departureOptions.length > 0 && (
                      <DepartureSelectionCard
                        options={msg.departureOptions}
                        selectedDeparture={selectedDeparture}
                        disabled={isTyping}
                        onSelect={(depLoc) => {
                          setSelectedDeparture(depLoc);
                          sendMessage(`SELECT_DEPARTURE:${depLoc}`, {
                            action: 'SELECT_DEPARTURE',
                            departureLocation: depLoc,
                            passengerCount,
                            stateVersion
                          });
                        }}
                      />
                    )}

                    {/* CARD TYPE 1: TRIP LIST */}
                    {msg.trips && msg.trips.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-2">
                        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                          <Bus size={12} className="text-blue-600" /> Các chuyến xe có thể đặt:
                        </div>
                        {msg.trips.slice(0, 3).map((trip) => {
                          const isThisTripSelected = selectedTripId === trip.tripId;
                          const isBookable = trip.availableSeats > 0;
                          return (
                            <div
                              key={trip.tripId}
                              className={`border rounded-xl p-2.5 text-xs transition-all ${
                                isThisTripSelected
                                  ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-300'
                                  : 'bg-slate-50 border-gray-200 hover:border-blue-400'
                              }`}
                            >
                              <div className="flex justify-between items-start font-semibold text-gray-900">
                                <span>{trip.departureLocation} → {trip.arrivalLocation}</span>
                                <span className="text-blue-600 font-bold">{trip.priceFormatted}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-500 mt-1 text-[11px]">
                                <span className="flex items-center gap-1"><Clock size={11} /> {trip.departureTimeFormatted}</span>
                                <span>•</span>
                                <span>{trip.vehicleType}</span>
                                <span>•</span>
                                <span className={isBookable ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>
                                  {isBookable ? `Còn ${trip.availableSeats} chỗ` : 'Hết chỗ'}
                                </span>
                              </div>
                              {isThisTripSelected ? (
                                <div className="mt-2 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg font-bold text-xs bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <Check size={13} className="text-emerald-700" />
                                  <span>Đã chọn chuyến này (#{trip.tripId})</span>
                                </div>
                              ) : isBookable ? (
                                <button
                                  disabled={isTyping}
                                  onClick={() => {
                                    setSelectedTripId(trip.tripId);
                                    sendMessage(`SELECT_TRIP:${trip.tripId}`, {
                                      action: 'SELECT_TRIP',
                                      tripId: trip.tripId,
                                      passengerCount,
                                      stateVersion
                                    });
                                  }}
                                  className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-1.5 px-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1 shadow-2xs transition-colors"
                                >
                                  <span>Chọn chuyến này</span>
                                  <ArrowRight size={12} />
                                </button>
                              ) : (
                                <div className="mt-1 text-[10px] text-red-500 italic text-right">Chuyến xe đã hết vé</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* CARD TYPE 2: SEAT SELECTION PROMPT */}
                    {msg.cardType === 'SEAT_SELECTION' && (
                      <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-2">
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-2.5 text-xs text-indigo-900">
                          <div className="font-semibold flex items-center gap-1 mb-1">
                            <Sparkles size={13} className="text-indigo-600" />
                            Đề xuất chọn ghế thông minh
                          </div>
                          <p className="text-[11px] text-indigo-700 mb-2">
                            Bạn có muốn em tự động tìm {passengerCount > 1 ? `${passengerCount} ghế liền kề cạnh nhau` : 'vị trí ghế tốt nhất'} trên cùng một tầng không?
                          </p>
                          <div className="flex gap-2">
                            {passengerCount > 1 && (
                              <button
                                disabled={isTyping}
                                onClick={() => {
                                  sendMessage(`Có, chọn ${passengerCount} ghế cạnh nhau`, {
                                    action: 'AUTO_ADJACENT_SEATS',
                                    tripId: msg.tripId || selectedTripId || undefined,
                                    passengerCount,
                                    stateVersion
                                  });
                                }}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-1.5 px-2.5 rounded-lg font-semibold text-xs transition-colors shadow-2xs"
                              >
                                Có, chọn {passengerCount} ghế cạnh nhau
                              </button>
                            )}
                            <button
                              disabled={isTyping}
                              onClick={() => {
                                sendMessage("Tôi muốn tự chọn vị trí ghế", {
                                  action: 'MANUAL_SEAT_MAP',
                                  tripId: msg.tripId || selectedTripId || undefined,
                                  passengerCount,
                                  stateVersion
                                });
                              }}
                              className={`${passengerCount > 1 ? '' : 'w-full'} bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-700 border border-gray-300 py-1.5 px-2.5 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1`}
                            >
                              <span>Tự chọn ghế</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CARD TYPE 2.5: INTERACTIVE SEAT SELECTION CARD */}
                    {(msg.cardType === 'SEAT_SELECTION_CARD' || msg.seatMap) && msg.seatMap && (
                      <SeatSelectionCard
                        seatMap={msg.seatMap}
                        requiredPassengerCount={passengerCount}
                        disabled={isTyping}
                        onConfirmSeats={(seatIds, seatNames) => {
                          sendMessage(`SELECT_SEATS:${seatNames.join(',')}`, {
                            action: 'SELECT_SEATS',
                            tripId: msg.seatMap?.tripId || selectedTripId || undefined,
                            seatIds,
                            seatNames,
                            passengerCount,
                            stateVersion
                          });
                        }}
                      />
                    )}

                    {/* CARD TYPE 3: BOOKING CONFIRMATION CARD */}
                    {msg.draft && (
                      <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-2">
                        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-950">
                          <div className="font-bold flex items-center justify-between text-amber-900 mb-1.5">
                            <div className="flex items-center gap-1">
                              <CheckCircle2 size={14} className="text-amber-600" />
                              <span>XÁC NHẬN THÔNG TIN ĐẶT VÉ</span>
                            </div>
                            <span className="text-[10px] bg-amber-200/70 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                              Chờ xác nhận
                            </span>
                          </div>
                          <div className="space-y-1 text-[11px] text-gray-700">
                            <div><strong>Tuyến:</strong> {msg.draft.routeName}</div>
                            <div><strong>Khởi hành:</strong> {msg.draft.departureTimeFormatted}</div>
                            <div><strong>Loại xe:</strong> {msg.draft.vehicleType}</div>
                            <div><strong>Ghế đã chọn:</strong> <span className="font-bold text-blue-700">{msg.draft.seatNames?.join(', ')}</span></div>
                            <div className="text-sm font-bold text-red-600 mt-1">Tổng tiền: {msg.draft.totalPriceFormatted}</div>
                          </div>
                          {isLatestMessage ? (
                            <div className="mt-2.5 flex flex-col gap-1.5">
                              <button
                                disabled={isTyping}
                                onClick={() => {
                                  sendMessage("Xác nhận và thanh toán", {
                                    action: 'CONFIRM_BOOKING',
                                    tripId: msg.draft?.tripId || selectedTripId || undefined,
                                    idempotencyKey: msg.draft?.idempotencyKey,
                                    stateVersion
                                  });
                                }}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-1.5 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                              >
                                <CreditCard size={13} />
                                <span>Xác nhận và thanh toán</span>
                              </button>
                              <div className="flex gap-1.5">
                                <button
                                  disabled={isTyping}
                                  onClick={() => {
                                    sendMessage("Tôi muốn đổi chuyến xe khác", {
                                      action: 'SELECT_DEPARTURE',
                                      departureLocation: selectedDeparture || undefined,
                                      passengerCount,
                                      stateVersion
                                    });
                                  }}
                                  className="flex-1 bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-700 border border-gray-300 py-1 px-2 rounded-lg text-xs transition-colors"
                                >
                                  Thay đổi
                                </button>
                                <button
                                  disabled={isTyping}
                                  onClick={() => {
                                    sendMessage("Hủy đặt vé", {
                                      action: 'CANCEL_BOOKING',
                                      stateVersion
                                    });
                                  }}
                                  className="bg-white hover:bg-red-50 disabled:opacity-50 text-red-600 border border-red-200 py-1 px-2 rounded-lg text-xs transition-colors flex items-center gap-1"
                                >
                                  <Ban size={11} /> Hủy
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 text-[10px] text-gray-400 italic">(Đã hoàn tất bước xác nhận)</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CARD TYPE 4: DEMO PAYMENT QR CARD */}
                    {msg.payment && (
                      <DemoPaymentCard
                        payment={msg.payment}
                        onSimulateSuccess={(bookingId, txnId) => {
                          sendMessage(`SIMULATE_PAYMENT:${bookingId}:${txnId}`, {
                            action: 'SIMULATE_PAYMENT',
                            tripId: bookingId,
                            idempotencyKey: txnId,
                            stateVersion
                          });
                        }}
                        onCancel={(bookingId) => {
                          sendMessage(`CANCEL_BOOKING:${bookingId}`, {
                            action: 'CANCEL_BOOKING',
                            tripId: bookingId,
                            stateVersion
                          });
                        }}
                      />
                    )}

                    {/* CARD TYPE 5: TICKET SUCCESS CARD */}
                    {msg.ticket && (
                      <TicketSuccessCard ticket={msg.ticket} />
                    )}

                    {/* CARD TYPE 6A: MY BOOKINGS (RECENT 3 BOOKINGS WITH ROUTER NAVIGATION) */}
                    {msg.cardType === 'MY_BOOKINGS' && msg.bookings && msg.bookings.length > 0 && (
                      <MyBookingsCard
                        bookings={msg.bookings}
                        hasMore={msg.hasMore}
                      />
                    )}

                    {/* CARD TYPE 6B: BOOKING LOOKUP FOR CANCELLATION */}
                    {msg.cardType !== 'MY_BOOKINGS' && msg.bookings && msg.bookings.length > 0 && (
                      <BookingLookupCard
                        bookings={msg.bookings}
                        onSelectBooking={(bId) => sendMessage(`SELECT_BOOKING_TO_CANCEL:${bId}`)}
                      />
                    )}

                    {/* CARD TYPE 7: CANCELLATION PREVIEW CARD */}
                    {msg.cancelPreview && (
                      <CancellationPreviewCard
                        preview={msg.cancelPreview}
                        onConfirm={(token, bId) => sendMessage(`CONFIRM_CANCELLATION:${token}:${bId}`)}
                        onKeep={() => sendMessage("Giữ lại vé")}
                      />
                    )}

                    {/* CARD TYPE 8: CANCELLATION SUCCESS CARD */}
                    {msg.cancelResult && (
                      <CancellationSuccessCard result={msg.cancelResult} />
                    )}

                    {/* Action buttons if trip IDs found in legacy reply */}
                    {msg.actionTripIds && msg.actionTripIds.length > 0 && !msg.trips && (
                      <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-1.5">
                        {msg.actionTripIds.map((tripId) => (
                          <button
                            key={tripId}
                            onClick={() => sendMessage(`SELECT_TRIP:${tripId}`)}
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
              );
            })}

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
                placeholder="Nhập yêu cầu: 'Hủy vé đi Đà Lạt', 'Đặt vé'..."
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

// SUBCOMPONENT: Departure Selection Card (Auto list departure options)
const DepartureSelectionCard: React.FC<{
  options: DepartureOptionItem[];
  selectedDeparture: string | null;
  disabled: boolean;
  onSelect: (departureLocation: string) => void;
}> = ({ options, selectedDeparture, disabled, onSelect }) => {
  return (
    <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-2">
      <div className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
        <MapPin size={13} className="text-blue-600" />
        <span>Chọn điểm khởi hành phù hợp:</span>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {options.map((opt, idx) => {
          const isSelected = selectedDeparture?.toLowerCase() === opt.departureLocation?.toLowerCase();
          return (
            <div
              key={idx}
              className={`border rounded-xl p-2.5 text-xs transition-all ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-300 shadow-xs'
                  : 'bg-slate-50 border-gray-200 hover:border-blue-400 hover:shadow-2xs'
              }`}
            >
              <div className="flex justify-between items-start font-semibold text-gray-900">
                <span className="flex items-center gap-1 text-blue-900">
                  <MapPin size={12} className="text-red-500 shrink-0" />
                  {opt.departureLocation} → {opt.arrivalLocation}
                </span>
                <span className="text-blue-600 font-bold">{opt.minPriceFormatted}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-gray-500 mt-1.5 text-[11px]">
                <span className="flex items-center gap-1">
                  <Clock size={11} className="text-gray-400" /> Sớm nhất: <strong className="text-gray-700">{opt.earliestDepartureTimeFormatted}</strong>
                </span>
                <span>•</span>
                <span className="text-indigo-600 font-medium">
                  {opt.activeTripCount} chuyến xe
                </span>
                <span>•</span>
                <span className="text-emerald-600 font-medium">
                  Còn {opt.totalAvailableSeats} chỗ
                </span>
              </div>
              {opt.vehicleTypes?.length > 0 && (
                <div className="text-[10px] text-gray-400 mt-0.5">
                  Xe: {opt.vehicleTypes.join(', ')}
                </div>
              )}
              {isSelected ? (
                <div className="mt-2 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg font-bold text-xs bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Check size={14} className="text-emerald-700" />
                  <span>Đã chọn điểm đi</span>
                </div>
              ) : (
                <button
                  disabled={disabled}
                  onClick={() => onSelect(opt.departureLocation)}
                  className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-1.5 px-2.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                >
                  <span>Chọn khởi hành từ {opt.departureLocation}</span>
                  <ArrowRight size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// SUBCOMPONENT: Interactive Seat Selection Card (Styling & layout aligned with booking seat map)
const SeatSelectionCard: React.FC<{
  seatMap: TripSeatMapItem;
  requiredPassengerCount: number;
  disabled: boolean;
  onConfirmSeats: (seatIds: number[], seatNames: string[]) => void;
}> = ({ seatMap, requiredPassengerCount, disabled, onConfirmSeats }) => {
  const targetCount = requiredPassengerCount > 0
    ? requiredPassengerCount
    : (seatMap.passengerCount || seatMap.requiredSeats || 1);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [activeFloor, setActiveFloor] = useState<number>(1);

  const allSeats: SeatMapSeatItem[] = seatMap.seats || [];

  // Helper to reliably retrieve seat name
  const getSeatName = (seat: SeatMapSeatItem, fallbackIdx: number): string => {
    if (seat.seatName && String(seat.seatName).trim()) return String(seat.seatName).trim();
    if (seat.seatNumber && String(seat.seatNumber).trim()) return String(seat.seatNumber).trim();
    const floorPrefix = seat.floor === 2 ? 'B' : 'A';
    return `${floorPrefix}${fallbackIdx + 1}`;
  };

  // Group seats by floor or split into two decks like in booking
  const floor1Raw = allSeats.filter(s => s.floor === 1);
  const floor2Raw = allSeats.filter(s => s.floor === 2);
  const isSleeper = Boolean(seatMap.vehicleType && /giường|sleeper/i.test(seatMap.vehicleType));
  const splitIntoDecks = floor2Raw.length > 0 || (seatMap.floors && seatMap.floors > 1) || (allSeats.length > 18 && isSleeper) || allSeats.length > 24;

  let lowerDeck: SeatMapSeatItem[] = [];
  let upperDeck: SeatMapSeatItem[] = [];

  if (floor2Raw.length > 0) {
    lowerDeck = floor1Raw.length > 0 ? floor1Raw : allSeats.filter(s => s.floor !== 2);
    upperDeck = floor2Raw;
  } else if (splitIntoDecks) {
    const half = Math.ceil(allSeats.length / 2);
    lowerDeck = allSeats.slice(0, half);
    upperDeck = allSeats.slice(half);
  } else {
    lowerDeck = allSeats;
    upperDeck = [];
  }

  const currentDeckSeats = activeFloor === 2 && upperDeck.length > 0 ? upperDeck : lowerDeck;

  const handleToggleSeat = (seat: SeatMapSeatItem) => {
    if (seat.status !== 'AVAILABLE' || disabled) return;

    if (selectedSeatIds.includes(seat.seatId)) {
      setSelectedSeatIds(prev => prev.filter(id => id !== seat.seatId));
    } else {
      if (selectedSeatIds.length < targetCount) {
        setSelectedSeatIds(prev => [...prev, seat.seatId]);
      } else if (targetCount === 1) {
        // Single seat mode: Replace selection directly
        setSelectedSeatIds([seat.seatId]);
      } else {
        // Multi seat mode: rotate selection by replacing oldest selected seat
        setSelectedSeatIds(prev => [...prev.slice(1), seat.seatId]);
      }
    }
  };

  const selectedSeatObjects = allSeats.filter(s => selectedSeatIds.includes(s.seatId));
  const selectedSeatNames = selectedSeatObjects.map((s, idx) => getSeatName(s, idx));

  const unitPrice = seatMap.unitPrice || (allSeats.length > 0 && allSeats[0].price) || 0;
  const totalPrice = selectedSeatIds.length * unitPrice;
  const totalPriceFormatted = new Intl.NumberFormat('vi-VN').format(totalPrice) + ' đ';

  const totalCapacity = seatMap.totalSeats || allSeats.length || 36;
  const availableSeats = seatMap.availableCount ?? seatMap.availableSeats ?? allSeats.filter(s => s.status === 'AVAILABLE').length;

  const lowerSelectedCount = lowerDeck.filter(s => selectedSeatIds.includes(s.seatId)).length;
  const upperSelectedCount = upperDeck.filter(s => selectedSeatIds.includes(s.seatId)).length;

  return (
    <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-2.5">
      <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-3.5 shadow-sm">
        {/* Header: Sơ đồ ghế và thông tin xe */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <div className="space-y-0.5">
            <div className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
              <Bus size={14} className="text-blue-600" />
              <span>SƠ ĐỒ CHỖ NGỒI (CHUYẾN #{seatMap.tripId})</span>
            </div>
            <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
              <span>{seatMap.vehicleType || 'Xe khách'}</span>
              <span>•</span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full text-[10px]">
                Còn {availableSeats}/{totalCapacity} chỗ
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
              Cần chọn: {targetCount} vé
            </span>
          </div>
        </div>

        {/* Legend (Giống giao diện đặt vé) */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] font-medium text-gray-600 py-2 px-2 bg-gray-50/80 rounded-xl border border-gray-100 mt-2.5">
          <div className="flex items-center space-x-1.5">
            <div className="w-3.5 h-3.5 rounded-md border-2 border-gray-300 bg-white"></div>
            <span>Ghế trống</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-blue-600 border border-blue-700 shadow-2xs"></div>
            <span className="text-blue-700 font-bold">Đang chọn ({selectedSeatIds.length}/{targetCount})</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-gray-100 border border-gray-300"></div>
            <span className="text-gray-400">Đã đặt / Đang giữ chỗ</span>
          </div>
        </div>

        {/* Deck tabs if multi-deck (Tầng 1 (Dưới) / Tầng 2 (Trên)) */}
        {splitIntoDecks && upperDeck.length > 0 && (
          <div className="flex gap-1.5 mt-2.5 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveFloor(1)}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                activeFloor === 1
                  ? 'bg-white text-blue-700 shadow-xs border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>Tầng 1 (Dưới) ({lowerDeck.length} chỗ)</span>
              {lowerSelectedCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {lowerSelectedCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveFloor(2)}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                activeFloor === 2
                  ? 'bg-white text-blue-700 shadow-xs border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>Tầng 2 (Trên) ({upperDeck.length} chỗ)</span>
              {upperSelectedCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {upperSelectedCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Seat Map Panel (Deck Header + 3 Columns Bus Grid) */}
        <div className="mt-2.5 p-3 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-gray-100">
            <h4 className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>{splitIntoDecks ? (activeFloor === 1 ? 'Tầng 1 (Dưới)' : 'Tầng 2 (Trên)') : 'Sơ đồ ghế xe'}</span>
            </h4>
            <span className="text-[11px] text-gray-400 font-mono">
              {currentDeckSeats.length} chỗ • 3 dãy
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto custom-scrollbar p-0.5">
            <div className="grid grid-cols-3 gap-2.5">
              {currentDeckSeats.map((seat, idx) => {
                const isSelected = selectedSeatIds.includes(seat.seatId);
                const isBooked = seat.status === 'BOOKED';
                const isHeld = seat.status === 'HELD';
                const isSelectable = seat.status === 'AVAILABLE';
                const seatName = getSeatName(seat, idx);

                return (
                  <button
                    key={seat.seatId}
                    type="button"
                    disabled={!isSelectable || disabled}
                    onClick={() => handleToggleSeat(seat)}
                    className={`
                      relative h-12 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition-all duration-150 cursor-pointer
                      ${isBooked
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                        : isHeld
                        ? 'bg-amber-50 text-amber-700 cursor-not-allowed border border-amber-300'
                        : isSelected
                        ? 'bg-blue-600 text-white border-2 border-blue-700 shadow-md shadow-blue-500/30 scale-105 z-10'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600 shadow-2xs'
                      }
                    `}
                    title={`Ghế ${seatName} (${seat.status === 'AVAILABLE' ? (seat.priceFormatted || seatMap.unitPriceFormatted || 'Còn trống') : isBooked ? 'Đã đặt' : 'Tạm giữ'})`}
                  >
                    <span>{seatName}</span>
                    {isBooked && (
                      <span className="text-[9px] text-gray-400 font-normal leading-tight">Đã đặt</span>
                    )}
                    {isHeld && (
                      <span className="text-[9px] text-amber-600 font-normal leading-tight">Tạm giữ</span>
                    )}
                    {isSelected && (
                      <>
                        <span className="text-[9px] text-blue-100 font-medium leading-tight">Đang chọn</span>
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white"></span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selection Summary and Confirm Button (Giống thanh tiếp tục đặt vé) */}
        <div className="mt-3 pt-2.5 border-t border-gray-200 space-y-2">
          <div className="flex justify-between items-baseline text-xs">
            <div className="space-y-0.5">
              <span className="text-gray-500 text-[11px] block">
                Ghế đã chọn ({selectedSeatIds.length}/{targetCount}):
              </span>
              <strong className="text-blue-700 text-xs font-bold font-mono">
                {selectedSeatNames.length > 0 ? selectedSeatNames.join(', ') : 'Chưa chọn chỗ nào'}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-gray-400 block">Tổng tiền giữ chỗ:</span>
              <span className="font-black text-base text-blue-600">
                {totalPriceFormatted}
              </span>
            </div>
          </div>

          {selectedSeatIds.length < targetCount && (
            <div className="text-[11px] text-amber-800 bg-amber-50 py-1.5 px-2.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
              <span>👉</span>
              <span>Vui lòng chọn thêm <strong>{targetCount - selectedSeatIds.length}</strong> ghế nữa để đủ {targetCount} vé.</span>
            </div>
          )}

          <button
            type="button"
            disabled={selectedSeatIds.length === 0 || disabled}
            onClick={() => onConfirmSeats(selectedSeatIds, selectedSeatNames)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <CheckCircle2 size={15} />
            <span>Xác nhận chọn {selectedSeatIds.length || targetCount} ghế này</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// SUBCOMPONENT: My Bookings Card (Displays 3 most recent bookings with status and router navigation)
const MyBookingsCard: React.FC<{
  bookings: BookingLookupItem[];
  hasMore?: boolean;
}> = ({ bookings }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={11} className="mr-1 text-emerald-600" />
            Đã thanh toán
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Bus size={11} className="mr-1 text-blue-600" />
            Đã hoàn thành
          </span>
        );
      case 'PENDING_PAYMENT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={11} className="mr-1 text-amber-600" />
            Chờ thanh toán
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={11} className="mr-1 text-rose-600" />
            Đã hủy
          </span>
        );
      case 'CANCEL_REQUESTED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Clock size={11} className="mr-1 text-purple-600" />
            Đang yêu cầu hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
            {status || 'Không xác định'}
          </span>
        );
    }
  };

  return (
    <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-2.5">
      <div className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TicketIcon size={13} className="text-blue-600" />
          <span>Đơn đặt vé gần đây</span>
        </div>
        <span className="text-[10px] text-gray-400 font-normal">
          {bookings.length} đơn mới nhất
        </span>
      </div>

      <div className="space-y-2">
        {bookings.map((b) => {
          const canView = b.canViewTicket || b.status?.toUpperCase() === 'PAID' || b.status?.toUpperCase() === 'COMPLETED';
          return (
            <div
              key={b.bookingId}
              className="bg-white border border-gray-200 hover:border-blue-400 rounded-xl p-3 text-xs shadow-2xs transition-all space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">MÃ ĐƠN</div>
                  <div className="font-extrabold text-blue-700 text-xs font-mono">
                    {b.bookingCode || `#${b.bookingId}`}
                  </div>
                </div>
                {getStatusBadge(b.status)}
              </div>

              <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 space-y-1">
                <div className="font-bold text-gray-900 text-xs flex items-center justify-between">
                  <span>{b.routeName}</span>
                  {b.vehicleType && (
                    <span className="text-[10px] font-normal text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                      {b.vehicleType}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-600">
                  <Clock size={11} className="text-gray-400 shrink-0" />
                  <span>Khởi hành: <strong>{b.departureTimeFormatted}</strong></span>
                </div>
                <div className="text-[11px] text-gray-600">
                  <span>Ghế: </span>
                  <span className="font-semibold text-gray-800">
                    {b.seatNames && b.seatNames.length > 0 ? b.seatNames.join(', ') : 'Chưa có thông tin ghế'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-xs">
                  <span className="text-gray-500 text-[11px]">Tổng tiền: </span>
                  <span className="font-bold text-red-600">{b.totalPriceFormatted}</span>
                </div>

                {canView && (
                  <button
                    type="button"
                    onClick={() => navigate(`/bookings/${b.bookingId}/e-ticket`)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-1 px-2.5 rounded-lg font-semibold text-[11px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    title="Xem vé điện tử"
                  >
                    <TicketIcon size={11} />
                    <span>Xem vé</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => navigate('/booking')}
        className="w-full mt-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer group"
      >
        <span>Xem thêm</span>
        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};

// SUBCOMPONENT: Booking Lookup Card for Cancellation Selection
const BookingLookupCard: React.FC<{
  bookings: BookingLookupItem[];
  onSelectBooking: (bookingId: number) => void;
}> = ({ bookings, onSelectBooking }) => {
  const navigate = useNavigate();
  return (
    <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-2">
      <div className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
        <TicketIcon size={12} className="text-blue-600" /> Danh sách đơn đặt vé của bạn:
      </div>
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {bookings.map((b) => (
          <div key={b.bookingId} className="bg-slate-50 border border-gray-200 rounded-xl p-2.5 text-xs hover:border-blue-400 transition-all">
            <div className="flex justify-between items-start font-semibold text-gray-900">
              <span>{b.routeName}</span>
              <span className="font-bold text-blue-700">{b.totalPriceFormatted}</span>
            </div>
            <div className="text-gray-500 text-[11px] mt-1 space-y-0.5">
              <div>Mã đơn: <span className="font-mono text-gray-700">{b.bookingCode || `#${b.bookingId}`}</span></div>
              <div className="flex items-center gap-1"><Clock size={11} /> {b.departureTimeFormatted}</div>
              <div>Ghế: <span className="font-semibold text-gray-800">{b.seatNames?.join(', ')}</span></div>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (b.bookingId) {
                    navigate(`/bookings/${b.bookingId}/e-ticket`);
                  }
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-2.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
              >
                <TicketIcon size={12} />
                <span>Xem vé điện tử</span>
              </button>
              {b.isCancellable && (
                <button
                  type="button"
                  onClick={() => onSelectBooking(b.bookingId)}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-1.5 px-2.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Yêu cầu hủy vé đơn này"
                >
                  <span>Hủy vé</span>
                  <ArrowRight size={11} />
                </button>
              )}
            </div>
            {!b.isCancellable && b.nonCancellableReason && (
              <div className="mt-1.5 text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                ℹ️ {b.nonCancellableReason}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// SUBCOMPONENT: Cancellation Preview Card with Live Countdown
const CancellationPreviewCard: React.FC<{
  preview: CancellationPreviewItem;
  onConfirm: (token: string, bookingId: number) => void;
  onKeep: () => void;
}> = ({ preview, onConfirm, onKeep }) => {
  const [secondsLeft, setSecondsLeft] = useState(preview.expiresInSeconds || 300);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfirm = () => {
    if (isSubmitting || secondsLeft === 0) return;
    setIsSubmitting(true);
    onConfirm(preview.confirmationToken, preview.bookingId);
  };

  return (
    <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-2.5">
      <div className="bg-gradient-to-b from-rose-50 to-red-50 border border-rose-300 rounded-2xl p-3 text-xs shadow-sm">
        {/* Banner */}
        <div className="bg-rose-600 text-white text-[10px] font-bold py-1 px-2 rounded-lg text-center tracking-wide flex items-center justify-center gap-1 shadow-2xs">
          <AlertTriangle size={13} />
          <span>XÁC NHẬN HỦY VÉ & HOÀN TIỀN DỰ KIẾN</span>
        </div>

        {/* Booking Details */}
        <div className="mt-2.5 bg-white p-2.5 rounded-xl border border-rose-200 space-y-1 text-[11px] text-gray-800">
          <div className="font-bold text-gray-900 text-xs">{preview.routeName}</div>
          <div className="text-gray-500">Mã đơn: <span className="font-mono font-semibold">{preview.bookingCode || `#${preview.bookingId}`}</span></div>
          <div className="text-gray-500">Khởi hành: <span className="font-medium text-gray-800">{preview.departureTimeFormatted}</span></div>
          <div className="text-gray-700">
            Ghế yêu cầu hủy: <span className="font-bold text-red-600">{preview.seatNamesToCancel?.join(', ')}</span> ({preview.ticketCountToCancel} vé {preview.isPartialCancellation ? '- Hủy một phần' : '- Toàn bộ đơn'})
          </div>
          {preview.isPartialCancellation && preview.remainingSeatNames?.length > 0 && (
            <div className="text-emerald-700 text-[10px]">
              Ghế tiếp tục giữ lại: <span className="font-bold">{preview.remainingSeatNames.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Financial Breakdown */}
        <div className="mt-2.5 bg-white p-2.5 rounded-xl border border-rose-200 text-[11px] space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">Tổng tiền vé hủy:</span>
            <span className="font-semibold text-gray-900">{preview.originalAmountFormatted}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>Phí hủy ({preview.feePercent}%):</span>
            <span className="font-bold">-{preview.feeAmountFormatted}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-gray-100">
            <span className="font-bold text-gray-900">Số tiền hoàn lại:</span>
            <span className="font-bold text-sm text-emerald-600">{preview.refundAmountFormatted}</span>
          </div>
          <div className="text-[10px] text-gray-500 italic pt-0.5">
            Chính sách: {preview.cancellationPolicy}
          </div>
        </div>

        {/* Timer */}
        <div className="mt-2 flex justify-between items-center text-[10px] text-rose-800 font-medium">
          <span className="flex items-center gap-1"><Clock size={11} /> Hiệu lực bản xác nhận:</span>
          <span className={`font-mono font-bold ${secondsLeft < 60 ? 'text-red-600 animate-pulse' : 'text-rose-900'}`}>
            {secondsLeft > 0 ? formatTimer(secondsLeft) : 'Đã hết hạn!'}
          </span>
        </div>

        {/* Buttons */}
        <div className="mt-2.5 flex flex-col gap-1.5">
          <button
            onClick={handleConfirm}
            disabled={secondsLeft === 0 || isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            <Check size={14} />
            <span>{isSubmitting ? 'Đang xử lý...' : 'Xác nhận hủy vé'}</span>
          </button>
          <button
            onClick={onKeep}
            disabled={isSubmitting}
            className="w-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 py-1.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
          >
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Giữ lại vé</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// SUBCOMPONENT: Cancellation Success Card
const CancellationSuccessCard: React.FC<{ result: CancellationResultItem }> = ({ result }) => {
  const navigate = useNavigate();
  return (
    <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-2">
      <div className="bg-gradient-to-b from-teal-50 to-emerald-50 border border-emerald-300 rounded-2xl p-3 text-xs shadow-sm">
        <div className="bg-emerald-600 text-white text-[11px] font-bold py-1.5 px-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 shadow-2xs">
          <CheckCircle2 size={14} />
          <span>HỦY VÉ & HOÀN TIỀN MÔ PHỎNG THÀNH CÔNG!</span>
        </div>

        <div className="mt-2.5 bg-white p-2.5 rounded-xl border border-emerald-200 text-[11px] space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">Mã đơn:</span>
            <span className="font-mono font-bold text-gray-900">{result.bookingCode || `#${result.bookingId}`}</span>
          </div>
          <div>Ghế đã hủy: <span className="font-bold text-red-600">{result.cancelledSeats?.join(', ')}</span></div>
          {result.remainingSeats?.length > 0 && (
            <div>Ghế tiếp tục giữ lại: <span className="font-bold text-blue-600">{result.remainingSeats.join(', ')}</span></div>
          )}
          <div className="flex justify-between pt-1 border-t border-gray-100">
            <span className="text-gray-500">Số tiền hoàn lại:</span>
            <span className="font-bold text-emerald-600">{result.refundAmountFormatted}</span>
          </div>
          {result.refundTransactionId && (
            <div className="text-[10px] text-gray-500 font-mono">
              Mã GD Hoàn: {result.refundTransactionId}
            </div>
          )}
          <div className="text-[10px] text-gray-500">
            Thời gian: {result.cancelledAtFormatted}
          </div>
        </div>

        <div className="text-[10px] text-emerald-800 bg-emerald-100/70 p-2 rounded-xl border border-emerald-200/80 mt-2">
          ✓ Chỗ ngồi đã được giải phóng trở lại sơ đồ xe cho khách khác đặt.
        </div>

        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => {
              navigate('/bookings');
            }}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Xem lịch sử vé của tôi</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// SUBCOMPONENT: Demo Payment Card with Live Timer
const DemoPaymentCard: React.FC<{
  payment: PaymentItem;
  onSimulateSuccess: (bookingId: number, txnId: string) => void;
  onCancel: (bookingId: number) => void;
}> = ({ payment, onSimulateSuccess, onCancel }) => {
  const [secondsLeft, setSecondsLeft] = useState(payment.expiresInSeconds || 300);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSimulate = () => {
    if (isSubmitting || secondsLeft === 0) return;
    setIsSubmitting(true);
    onSimulateSuccess(payment.bookingId, payment.transactionId);
  };

  return (
    <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-2.5">
      <div className="bg-gradient-to-b from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-3 text-xs shadow-sm">
        {/* Banner Warning & Status Badge */}
        <div className="flex flex-col gap-1.5">
          <div className="bg-amber-500 text-white text-[10px] font-bold py-1 px-2 rounded-lg text-center tracking-wide flex items-center justify-center gap-1 shadow-2xs">
            <AlertTriangle size={13} />
            <span>THANH TOÁN MÔ PHỎNG — KHÔNG CHUYỂN TIỀN THẬT</span>
          </div>
          <div className="flex justify-between items-center px-1">
            <span className="text-[11px] font-bold text-amber-900">MÃ THANH TOÁN QR</span>
            <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
              ĐÃ GIỮ CHỖ — CHỜ THANH TOÁN
            </span>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="mt-2.5 bg-white p-2.5 rounded-xl border border-amber-200 shadow-inner flex flex-col items-center">
          <img
            src={payment.qrBase64}
            alt="Mã QR Demo Payment"
            className="w-40 h-40 object-contain rounded-lg border border-gray-100"
          />
          <div className="text-[10px] text-gray-500 font-mono mt-1 text-center">
            Mã GD: <span className="font-semibold text-gray-800">{payment.transactionId}</span>
          </div>
        </div>

        {/* Meta Info */}
        <div className="mt-2.5 space-y-1 text-[11px] text-gray-800">
          <div className="flex justify-between">
            <span className="text-gray-500">Mã đơn đặt vé:</span>
            <span className="font-bold text-gray-900">{payment.bookingCode || `#${payment.bookingId}`}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Tổng tiền thanh toán:</span>
            <span className="font-bold text-sm text-red-600">{payment.amountFormatted}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-amber-200/60">
            <span className="text-gray-500 flex items-center gap-1">
              <Clock size={11} className="text-amber-600" /> Thời gian giữ chỗ:
            </span>
            <span className={`font-mono font-bold ${secondsLeft < 60 ? 'text-red-600 animate-pulse' : 'text-amber-800'}`}>
              {formatTimer(secondsLeft)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 space-y-1.5">
          <button
            onClick={handleSimulate}
            disabled={secondsLeft === 0 || isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            <CheckCircle2 size={14} />
            <span>{isSubmitting ? 'Đang xử lý thanh toán...' : 'Mô phỏng thanh toán thành công'}</span>
          </button>
          <button
            onClick={() => onCancel(payment.bookingId)}
            disabled={isSubmitting}
            className="w-full bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-700 border border-gray-300 py-1.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
          >
            <X size={12} /> Hủy thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

// SUBCOMPONENT: Ticket Success Card
const TicketSuccessCard: React.FC<{ ticket: TicketSuccessItem }> = ({ ticket }) => {
  const navigate = useNavigate();
  return (
    <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-2">
      <div className="bg-gradient-to-b from-emerald-50 to-teal-50 border border-emerald-300 rounded-2xl p-3 text-xs shadow-sm">
        {/* Success Header */}
        <div className="bg-emerald-600 text-white text-[11px] font-bold py-1.5 px-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 shadow-2xs">
          <CheckCircle2 size={14} />
          <span>VÉ ĐIỆN TỬ ĐÃ PHÁT HÀNH THÀNH CÔNG!</span>
        </div>

        {/* Route Details */}
        <div className="mt-2.5 bg-white p-2.5 rounded-xl border border-emerald-200 text-[11px] space-y-1">
          <div className="font-bold text-gray-900 text-xs">{ticket.routeName}</div>
          <div className="text-gray-500 flex items-center gap-1">
            <Clock size={11} /> Khởi hành: <span className="font-medium text-gray-800">{ticket.departureTimeFormatted}</span>
          </div>
          <div className="text-gray-500">
            Mã đơn: <span className="font-mono font-semibold text-emerald-700">{ticket.bookingCode}</span>
          </div>
          <div className="font-bold text-emerald-800 pt-1 border-t border-gray-100">
            Tổng tiền: {ticket.totalPriceFormatted}
          </div>
        </div>

        {/* Tickets List with Dedicated QR codes */}
        {ticket.tickets && ticket.tickets.length > 0 && (
          <div className="mt-2 space-y-2">
            <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <TicketIcon size={12} /> Danh sách vé điện tử ({ticket.tickets.length} vé):
            </div>
            {ticket.tickets.map((t) => (
              <div
                key={t.ticketId || t.ticketCode}
                onClick={() => {
                  if (ticket.bookingId) {
                    navigate(`/bookings/${ticket.bookingId}/e-ticket`);
                  }
                }}
                className="bg-white border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2.5 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer"
                title="Nhấn để xem vé điện tử chi tiết"
              >
                {t.qrCodeBase64 && (
                  <img
                    src={t.qrCodeBase64}
                    alt={`Vé ${t.ticketCode}`}
                    className="w-16 h-16 object-contain rounded border border-gray-100 shrink-0"
                  />
                )}
                <div className="flex-1 text-[11px] space-y-0.5">
                  <div className="font-bold text-gray-900 flex items-center justify-between">
                    <span>Ghế: <span className="text-blue-600 text-xs">{t.seatName}</span></span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-semibold">Tầng {t.floor}</span>
                  </div>
                  <div className="text-gray-500 font-mono text-[10px]">Mã vé: {t.ticketCode}</div>
                  <div className="text-gray-700 font-medium">{t.priceFormatted}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action: View Tickets */}
        <div className="mt-2.5 space-y-1.5">
          <button
            type="button"
            onClick={() => {
              if (ticket.bookingId) {
                navigate(`/bookings/${ticket.bookingId}/e-ticket`);
              } else {
                navigate('/bookings');
              }
            }}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <TicketIcon size={14} />
            <span>Xem vé điện tử</span>
          </button>
          <button
            type="button"
            onClick={() => {
              navigate('/bookings');
            }}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 py-1.5 px-3 rounded-xl font-medium text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Xem danh sách vé đã mua</span>
          </button>
        </div>
      </div>
    </div>
  );
};
