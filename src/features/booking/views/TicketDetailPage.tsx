import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bus, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  ShieldCheck, 
  QrCode, 
  Printer, 
  Download, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Hourglass, 
  FileText, 
  ChevronRight,
  Share2,
  Info
} from 'lucide-react';
import type { BookingItem, BookingStatus } from '../types/booking.types';
import { BookingService } from '../api/booking.service';
import { CancelTicketModal } from '../components/CancelTicketModal';
import toast from 'react-hot-toast';

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);

  const fetchBookingDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await BookingService.getBookingById(id);
      if (res.success && res.data) {
        setBooking(res.data);
      } else if (res.data) {
        setBooking(res.data);
      } else {
        setError('Không tìm thấy thông tin đơn đặt vé này.');
      }

      // Fetch specific tickets with QR code
      try {
        const resTickets = await BookingService.getTicketsByBookingId(Number(id));
        if (resTickets.success && Array.isArray(resTickets.data)) {
          setTickets(resTickets.data);
        }
      } catch (e) {
        console.warn('Could not fetch tickets list:', e);
      }
    } catch (err: any) {
      console.error('Fetch booking detail error:', err);
      const msg = err.response?.data?.message || 'Không thể tải chi tiết vé. Vui lòng kiểm tra lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetail();
  }, [id]);

  const depTime = booking?.trip?.departureTime ? new Date(booking.trip.departureTime) : null;
  const isPast = depTime && depTime.getTime() < Date.now();
  const isCanCancel = booking?.status === 'PAID' && !isPast;

  // Timeline Steps
  const timelineSteps = [
    {
      title: 'Tạo đơn đặt vé',
      time: booking?.createdAt ? new Date(booking.createdAt).toLocaleString('vi-VN') : '',
      completed: true,
      current: false,
    },
    {
      title: 'Thanh toán thành công',
      time: booking?.status === 'PAID' || booking?.status === 'COMPLETED' ? (booking?.updatedAt ? new Date(booking.updatedAt).toLocaleString('vi-VN') : 'Đã xác nhận') : '',
      completed: booking?.status === 'PAID' || booking?.status === 'COMPLETED',
      current: booking?.status === 'PENDING_PAYMENT',
    },
    {
      title: 'Xác nhận chỗ ngồi & Vé điện tử',
      time: booking?.status === 'PAID' ? 'Sẵn sàng lên xe' : '',
      completed: booking?.status === 'PAID' || booking?.status === 'COMPLETED',
      current: false,
    },
    {
      title: 'Hoàn thành chuyến đi',
      time: isPast ? (depTime ? depTime.toLocaleString('vi-VN') : '') : 'Dự kiến',
      completed: isPast && (booking?.status === 'PAID' || booking?.status === 'COMPLETED'),
      current: !isPast && booking?.status === 'PAID',
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Vé xe khách #${booking?.id}`,
        text: `Vé xe tuyến ${booking?.trip?.route?.departureLocation} - ${booking?.trip?.route?.arrivalLocation}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết vé vào clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/60 py-10">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <div className="h-8 bg-gray-200 rounded-xl w-48 animate-pulse" />
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6 animate-pulse">
            <div className="h-20 bg-gray-100 rounded-2xl" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 bg-gray-100 rounded-2xl" />
              <div className="h-32 bg-gray-100 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50/60 py-16">
        <div className="max-w-md mx-auto px-4 text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Không tìm thấy vé</h2>
          <p className="text-sm text-gray-500">{error || 'Vé này không tồn tại hoặc bạn không có quyền truy cập.'}</p>
          <div className="pt-2 flex justify-center space-x-3">
            <button
              onClick={() => navigate('/bookings')}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
            >
              Về lịch sử vé
            </button>
            <button
              onClick={fetchBookingDetail}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16 pt-6 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Back Link & Quick Actions (Hidden in Print) */}
        <div className="flex items-center justify-between print:hidden">
          <button
            onClick={() => navigate('/bookings')}
            className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200/80 shadow-2xs"
          >
            <ArrowLeft size={16} />
            <span>Danh sách vé</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors shadow-2xs"
              title="Chia sẻ vé"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors shadow-2xs"
            >
              <Printer size={15} />
              <span>In vé</span>
            </button>
            <Link
              to={`/bookings/${booking.id}/e-ticket`}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
            >
              <QrCode size={15} />
              <span>Vé điện tử</span>
            </Link>
          </div>
        </div>

        {/* Main Ticket Container */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden space-y-8 p-6 sm:p-8">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  VEXE TICKET PASS
                </span>
                <span className="text-sm font-extrabold text-gray-900">
                  Mã đơn: #{booking.id}
                </span>
              </div>
              <h1 className="text-2xl font-black text-gray-900">
                {booking.trip?.route?.departureLocation} → {booking.trip?.route?.arrivalLocation}
              </h1>
              <div className="text-xs text-gray-600 flex items-center space-x-1.5 pt-1">
                <Clock size={13} className="text-blue-600" />
                <span>
                  Ngày giờ đặt vé: <strong className="text-gray-900 font-semibold">{booking.createdAt ? new Date(booking.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</strong>
                </span>
              </div>
            </div>

            {/* Status Pill */}
            <div className="sm:text-right">
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold shadow-2xs ${
                booking.status === 'PAID'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : booking.status === 'PENDING_PAYMENT'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {booking.status === 'PAID' ? 'ĐÃ THANH TOÁN' : booking.status === 'PENDING_PAYMENT' ? 'CHỜ THANH TOÁN' : 'ĐÃ HỦY'}
              </span>
              <div className="text-lg font-black text-gray-900 mt-2">
                {Number(booking.totalPrice).toLocaleString('vi-VN')}₫
              </div>
            </div>
          </div>

          {/* Trip & Route Information Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/70 p-6 rounded-3xl border border-gray-100">
            {/* Departure */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase">
                <MapPin size={14} className="text-blue-600" />
                <span>Điểm đón khách</span>
              </div>
              <div className="text-lg font-black text-gray-900">
                {booking.trip?.route?.departureLocation}
              </div>
              <div className="text-xs text-gray-600 flex items-center space-x-2">
                <Clock size={13} className="text-gray-400" />
                <span className="font-bold text-blue-700">
                  {depTime ? depTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </span>
                <span>•</span>
                <span>{depTime ? depTime.toLocaleDateString('vi-VN') : ''}</span>
              </div>
              <p className="text-xs text-gray-400">
                {booking.pickupPoint || 'Bến xe trung tâm (Vui lòng có mặt trước 30 phút)'}
              </p>
            </div>

            {/* Arrival */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase">
                <MapPin size={14} className="text-emerald-600" />
                <span>Điểm trả khách</span>
              </div>
              <div className="text-lg font-black text-gray-900">
                {booking.trip?.route?.arrivalLocation}
              </div>
              <div className="text-xs text-gray-600">
                Thời gian dự kiến: ~{booking.trip?.route?.durationMinutes || 240} phút ({booking.trip?.route?.distanceKm || 300} km)
              </div>
              <p className="text-xs text-gray-400">
                {booking.dropoffPoint || 'Bến xe trả khách'}
              </p>
            </div>
          </div>

          {/* Passenger & Vehicle Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Passenger */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase">
                <User size={14} />
                <span>Hành khách</span>
              </div>
              <div className="font-extrabold text-sm text-gray-900">
                {booking.customer?.fullName || 'Khách hàng'}
              </div>
              <div className="text-xs text-gray-500 space-y-0.5">
                <p className="flex items-center space-x-1.5">
                  <Phone size={12} className="text-gray-400" />
                  <span>{booking.customer?.phoneNumber || '0912345678'}</span>
                </p>
                <p className="flex items-center space-x-1.5 truncate">
                  <Mail size={12} className="text-gray-400" />
                  <span className="truncate">{booking.customer?.email || 'N/A'}</span>
                </p>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase">
                <Bus size={14} />
                <span>Phương tiện</span>
              </div>
              <div className="font-extrabold text-sm text-gray-900">
                {booking.trip?.vehicle?.type || 'Limousine VIP'}
              </div>
              <div className="text-xs text-gray-500 space-y-0.5">
                <p>Biển số: <strong className="text-gray-800">{booking.trip?.vehicle?.licensePlate || 'N/A'}</strong></p>
                <p>Sức chứa: {booking.trip?.vehicle?.capacity || 34} chỗ</p>
              </div>
            </div>

            {/* Seats & Ticket Code */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-2 sm:col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase">
                <ShieldCheck size={14} className="text-blue-600" />
                <span>Ghế & Soát vé</span>
              </div>
              <div className="text-sm font-extrabold text-blue-700">
                {tickets.length > 0 
                  ? tickets.map(t => t.seat?.seatName).join(', ') 
                  : (booking.tickets?.map(t => t.seatNumber).join(', ') || booking.seats?.join(', ') || 'Ghế đặt')}
              </div>
              <div className="text-xs text-gray-500">
                Mã vé: <strong className="text-gray-900 font-mono">{tickets[0]?.ticketCode || `VX-${booking.id}`}</strong>
              </div>
            </div>
          </div>

          {/* QR Code & Check-in Verification Box */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 p-6 rounded-3xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs font-bold text-blue-700 uppercase">
                <QrCode size={16} />
                <span>Mã QR Soát Vé Khi Lên Xe</span>
              </div>
              <p className="text-sm font-bold text-gray-900">
                Xuất trình mã này cho tài xế hoặc phụ xe khi lên xe
              </p>
              <p className="text-xs text-gray-500 max-w-md">
                Vui lòng đến điểm đón trước giờ khởi hành ít nhất 30 phút để hoàn tất thủ tục xếp chỗ và hành lý.
              </p>
            </div>

            {/* QR Graphic */}
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-blue-100 flex flex-col items-center flex-shrink-0">
              <div className="w-32 h-32 bg-white rounded-xl p-1 flex items-center justify-center">
                {tickets[0]?.qrCode ? (
                  <img 
                    src={`data:image/png;base64,${tickets[0].qrCode}`} 
                    alt="Ticket QR Code" 
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
                    <QrCode size={80} className="text-white" />
                  </div>
                )}
              </div>
              <span className="text-[10px] font-mono font-bold text-gray-600 mt-1.5">
                {tickets[0]?.ticketCode || `VX-${booking.id}`}
              </span>
            </div>
          </div>

          {/* Timeline History */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Tiến trình chuyến đi
            </h3>
            
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className="relative flex items-start space-x-3 text-xs">
                  <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                    step.completed
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-50'
                      : step.current
                      ? 'bg-blue-600 text-white ring-4 ring-blue-50 animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step.completed ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                  </div>
                  <div>
                    <p className={`font-bold ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                    {step.time && <p className="text-gray-400">{step.time}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons (Print Hidden) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-gray-100 print:hidden">
            <Link
              to={`/search?departure=${encodeURIComponent(booking.trip?.route?.departureLocation || '')}&arrival=${encodeURIComponent(booking.trip?.route?.arrivalLocation || '')}`}
              className="inline-flex items-center space-x-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-2xl transition-colors"
            >
              <RotateCcw size={15} />
              <span>Đặt lại chuyến tương tự</span>
            </Link>

            <div className="flex items-center space-x-2">
              {isCanCancel && (
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  className="px-5 py-3 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                >
                  Hủy vé này
                </button>
              )}

              <Link
                to={`/bookings/${booking.id}/e-ticket`}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2"
              >
                <QrCode size={16} />
                <span>Xem thẻ lên xe (E-Ticket)</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {isCancelModalOpen && booking && (
        <CancelTicketModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          booking={booking}
          onCancelSuccess={() => {
            fetchBookingDetail();
          }}
        />
      )}
    </div>
  );
};
