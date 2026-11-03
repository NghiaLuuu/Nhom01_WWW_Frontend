import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Download, 
  ArrowLeft, 
  QrCode, 
  Share2, 
  MapPin, 
  Clock, 
  Bus, 
  ShieldCheck, 
  Sparkles, 
  Printer, 
  Calendar,
  Ticket,
  ChevronRight
} from 'lucide-react';
import { PostBookingRecommendations } from '../components/PostBookingRecommendations';

// Fallback demo booking details for robust rendering and testing
const FALLBACK_BOOKING = {
  bookingId: 'VX-889922',
  customerName: 'Nguyễn Văn An',
  customerPhone: '0909123456',
  customerEmail: 'khachhang@vexe.vn',
  departureLocation: 'TP. Hồ Chí Minh (Bến xe Miền Đông mới)',
  arrivalLocation: 'Nha Trang (Bến xe Phía Nam)',
  departureTime: new Date(Date.now() + 3600000 * 4).toISOString(),
  vehicleType: 'Limousine VIP 24 Phòng',
  licensePlate: '79B-028.99',
  seats: ['A02', 'A03'],
  totalPrice: 540000,
  paymentMethod: 'VietQR 24/7 (Đã tất toán)'
};

export const BookingSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use state data if available; otherwise use robust demo fallback
  const bookingDetails = location.state?.bookingDetails 
    ? {
        ...FALLBACK_BOOKING,
        ...location.state.bookingDetails,
        bookingId: location.state.bookingDetails.bookingCode || location.state.bookingDetails.bookingId || 'VX-889922'
      } 
    : FALLBACK_BOOKING;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 font-sans pb-28 pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-6 pb-4 border-b border-slate-800">
          <span className="hover:text-cyan-400 cursor-pointer" onClick={() => navigate('/')}>Trang chủ</span>
          <ChevronRight size={14} className="text-slate-600" />
          <span className="hover:text-cyan-400 cursor-pointer" onClick={() => navigate('/search')}>Tìm chuyến</span>
          <ChevronRight size={14} className="text-slate-600" />
          <span className="text-emerald-400 font-semibold">Đặt vé thành công</span>
        </div>

        {/* Celebratory Banner */}
        <div className="text-center mb-8 space-y-3">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
              <CheckCircle2 size={36} />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
            <Sparkles size={12} className="text-emerald-400" />
            <span>Giao dịch hoàn tất • Xác nhận giữ chỗ 100%</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Chúc mừng bạn đã đặt vé thành công!
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
            Mã vé điện tử đã được kích hoạt trên hệ thống máy chủ và gửi bản sao tới Email{' '}
            <strong className="text-cyan-400 font-semibold">{bookingDetails.customerEmail}</strong>.
          </p>
        </div>

        {/* Digital Boarding Pass Ticket Container */}
        <div className="rounded-2xl bg-slate-800 border border-slate-700 shadow-sm overflow-hidden mb-8">
          
          {/* Ticket Header Bar */}
          <div className="px-6 sm:px-8 py-5 border-b border-slate-700 bg-slate-850/50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                <Ticket size={20} />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">Thẻ Lên Xe Điện Tử (E-Boarding Pass)</div>
                <div className="text-sm sm:text-base font-bold text-white tracking-wide">VEXE VIP EXPRESS LINES</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Mã đặt vé (Booking PNR)</div>
                <div className="text-lg sm:text-xl font-bold text-cyan-400 font-mono tracking-wider">
                  {bookingDetails.bookingId}
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Main Body: 2 Columns */}
          <div className="flex flex-col lg:flex-row items-stretch">
            
            {/* Left Portion: Journey Details */}
            <div className="flex-1 p-6 sm:p-8 space-y-6">
              
              {/* Route Trajectory Visualizer */}
              <div className="flex items-center justify-between sm:justify-start sm:space-x-10 pb-6 border-b border-slate-700">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-cyan-400 font-semibold tracking-wider">Điểm khởi hành</span>
                  <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                    {new Date(bookingDetails.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                    <MapPin size={13} className="text-cyan-400 shrink-0" />
                    <span>{bookingDetails.departureLocation}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(bookingDetails.departureTime).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                <div className="flex flex-col items-center px-4 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 mb-1">~6h 30m</span>
                  <div className="relative flex items-center w-20 sm:w-28">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0 ring-2 ring-cyan-500/20"></div>
                    <div className="flex-1 h-0.5 bg-slate-600 mx-1"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 shrink-0 ring-2 ring-indigo-500/20"></div>
                  </div>
                  <span className="text-[9px] text-emerald-400 mt-1 uppercase font-semibold">Chạy thẳng</span>
                </div>

                <div className="space-y-1 text-right sm:text-left">
                  <span className="text-[10px] uppercase font-mono text-indigo-400 font-semibold tracking-wider">Điểm đến</span>
                  <div className="text-xl sm:text-2xl font-bold text-slate-200 font-mono">
                    {new Date(new Date(bookingDetails.departureTime).getTime() + 6.5 * 3600000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center justify-end sm:justify-start gap-1.5 text-xs font-medium text-white">
                    <MapPin size={13} className="text-indigo-400 shrink-0" />
                    <span>{bookingDetails.arrivalLocation}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Dự kiến cùng ngày</div>
                </div>
              </div>

              {/* 4-Cell Passenger & Vehicle Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Hành khách</span>
                  <div className="font-semibold text-white text-sm">{bookingDetails.customerName}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Số điện thoại</span>
                  <div className="font-mono font-semibold text-slate-200 text-sm">{bookingDetails.customerPhone}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Vị trí ghế đã giữ</span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {bookingDetails.seats.map((s: string) => (
                      <span key={s} className="px-2.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-mono font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Phương tiện vận chuyển</span>
                  <div className="font-semibold text-white text-sm">{bookingDetails.vehicleType}</div>
                  <div className="text-[10px] font-mono text-cyan-400">{bookingDetails.licensePlate}</div>
                </div>
              </div>

              {/* Payment Summary & Policy Guarantee */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-700 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Tổng số tiền đã thanh toán:</span>
                  <span className="text-xl sm:text-2xl font-bold text-cyan-400 font-mono">
                    {formatCurrency(bookingDetails.totalPrice)}
                  </span>
                  <span className="text-[10px] text-emerald-400 ml-2 font-medium">✓ Đã xác thực thành công</span>
                </div>

                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span>Bảo hiểm chuyến đi 100.000.000đ/khách</span>
                </div>
              </div>

            </div>

            {/* Right Portion: QR Check-in Boarding Stub */}
            <div className="lg:w-[280px] p-6 sm:p-8 bg-slate-900 border-t lg:border-t-0 lg:border-l-2 lg:border-dashed border-slate-700 flex flex-col items-center justify-between text-center relative">
              
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-semibold">
                  MÃ QUÉT LÊN XE (QR CHECK-IN)
                </span>
                <p className="text-[11px] text-slate-400">
                  Đưa mã này cho tài xế hoặc phụ xe khi lên xe để check-in tức thì
                </p>
              </div>

              {/* High-tech QR Code Box */}
              <div className="my-5 p-3 rounded-xl bg-white shadow-sm border border-slate-300 relative group">
                <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer corner finders */}
                  <rect x="5" y="5" width="26" height="26" rx="4" stroke="#0f172a" strokeWidth="4" />
                  <rect x="11" y="11" width="14" height="14" rx="2" fill="#0f172a" />

                  <rect x="69" y="5" width="26" height="26" rx="4" stroke="#0f172a" strokeWidth="4" />
                  <rect x="75" y="11" width="14" height="14" rx="2" fill="#0f172a" />

                  <rect x="5" y="69" width="26" height="26" rx="4" stroke="#0f172a" strokeWidth="4" />
                  <rect x="11" y="75" width="14" height="14" rx="2" fill="#0f172a" />

                  {/* QR Data Grid Matrix */}
                  <rect x="36" y="8" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="46" y="8" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="56" y="8" width="6" height="6" rx="1" fill="#0f172a" />
                  
                  <rect x="36" y="20" width="8" height="8" rx="1" fill="#0284c7" />
                  <rect x="48" y="22" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="58" y="20" width="6" height="6" rx="1" fill="#0f172a" />

                  <rect x="8" y="36" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="18" y="38" width="6" height="6" rx="1" fill="#0284c7" />
                  <rect x="28" y="36" width="8" height="8" rx="1" fill="#0f172a" />
                  
                  {/* Center VEXE logo emblem */}
                  <rect x="38" y="38" width="24" height="24" rx="5" fill="#0284c7" />
                  <path d="M44 46L50 54L56 46" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                  <rect x="68" y="36" width="8" height="8" rx="1" fill="#0f172a" />
                  <rect x="80" y="38" width="6" height="6" rx="1" fill="#0f172a" />

                  <rect x="36" y="68" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="48" y="68" width="8" height="8" rx="1" fill="#0284c7" />
                  <rect x="60" y="70" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="70" y="78" width="8" height="8" rx="1" fill="#0f172a" />
                  <rect x="82" y="70" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="82" y="82" width="6" height="6" rx="1" fill="#0284c7" />
                </svg>
                <div className="text-[10px] font-mono font-bold text-slate-900 mt-1">
                  {bookingDetails.bookingId}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-cyan-400 font-semibold block">
                  Có mặt trước 15 - 30 phút
                </span>
                <span className="text-[10px] text-slate-400">
                  Tổng đài hỗ trợ 24/7: 1900 1234
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          
          <button 
            onClick={handlePrint}
            type="button"
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <Printer size={16} className="text-cyan-400" />
            <span>In / Lưu vé PDF</span>
          </button>

          <button 
            onClick={() => navigate('/profile')}
            type="button"
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Ticket size={16} className="text-blue-400" />
            <span>Xem trong Vé của tôi</span>
          </button>

          <button 
            onClick={() => navigate('/')}
            type="button"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Về trang chủ</span>
          </button>

        </div>

        {/* AI Smart Post-Booking Follow-up & Recommendations */}
        <PostBookingRecommendations
          departureLocation={bookingDetails.departureLocation}
          arrivalLocation={bookingDetails.arrivalLocation}
          departureTime={bookingDetails.departureTime}
        />

      </div>
    </div>
  );
};
