import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Ticket,
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
import { ChangeSeatModal } from '../components/ChangeSeatModal';
import { ArrowLeftRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/useAuthStore';

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isStaffOrAdmin = user?.roles?.some((r: string) => ['ROLE_ADMIN', 'ROLE_STAFF', 'ADMIN', 'STAFF'].includes(r));

  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [selectedChangeSeatTicket, setSelectedChangeSeatTicket] = useState<any>(null);

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

  const handleCancelSingleTicket = async (ticketId: number, seatName: string) => {
    const reason = window.prompt(`Xác nhận hủy vé ghế ${seatName}?\nNhập lý do hủy:`, 'Khách yêu cầu hủy vé');
    if (reason === null) return;

    const toastId = toast.loading('Đang xử lý hủy vé lẻ...');
    try {
      const res = await BookingService.cancelSingleTicket(ticketId, reason);
      if (res.success) {
        toast.success('Hủy vé thành công!', { id: toastId });
        fetchBookingDetail();
      } else {
        toast.error(res.message || 'Hủy vé không thành công', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi hủy vé', { id: toastId });
    }
  };

  const depTime = booking?.trip?.departureTime ? new Date(booking.trip.departureTime) : null;
  const isPast = depTime && depTime.getTime() < Date.now();
  const isCanCancel = booking?.status === 'PAID' && !isPast;

  // Format Date Helper
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Timeline Steps logic
  const isPaid = booking?.status === 'PAID' || booking?.status === 'COMPLETED';
  const isCancelled = booking?.status === 'CANCELLED';
  const isCancelRequested = booking?.status === 'CANCEL_REQUESTED';
  const isPending = booking?.status === 'PENDING_PAYMENT';
  const isExpired = booking?.status === 'EXPIRED';

  interface TimelineStep {
    title: string;
    time?: string;
    completed: boolean;
    current: boolean;
    isCancelled?: boolean;
    description?: string;
  }

  const timelineSteps: TimelineStep[] = [
    {
      title: 'Tạo đơn đặt vé',
      time: formatDateTime(booking?.createdAt),
      completed: true,
      current: false,
    },
    {
      title: isPaid || isCancelled || isCancelRequested ? 'Thanh toán thành công' : isExpired ? 'Hết hạn thanh toán' : 'Chờ thanh toán',
      time: (isPaid || isCancelled || isCancelRequested)
        ? (booking?.updatedAt ? formatDateTime(booking.updatedAt) : 'Đã xác nhận thanh toán')
        : isExpired
        ? (booking?.holdExpiresAt ? `Hết hạn: ${formatDateTime(booking.holdExpiresAt)}` : 'Đã quá hạn giữ chỗ')
        : (booking?.holdExpiresAt ? `Hạn thanh toán: ${formatDateTime(booking.holdExpiresAt)}` : 'Đang giữ chỗ 5 phút'),
      completed: isPaid || isCancelled || isCancelRequested,
      current: isPending,
      isCancelled: isExpired,
    },
  ];

  // Nếu khách hủy vé (hoặc yêu cầu hủy) -> Thêm mốc Đã hủy ngay sau Thanh toán thành công
  if (isCancelled) {
    timelineSteps.push({
      title: 'Đã hủy vé',
      time: booking?.updatedAt ? formatDateTime(booking.updatedAt) : 'Đã hủy hoàn tất',
      completed: true,
      current: false,
      isCancelled: true,
      description: 'Đơn vé đã được hủy hoàn tất',
    });
  } else if (isCancelRequested) {
    timelineSteps.push({
      title: 'Yêu cầu hủy vé',
      time: booking?.updatedAt ? `${formatDateTime(booking.updatedAt)} • Chờ nhân viên duyệt` : 'Đang chờ xử lý',
      completed: false,
      current: true,
      isCancelled: false,
      description: 'Đang gửi yêu cầu hủy vé đến nhân viên',
    });
  }

  // Nếu chưa hủy vé thì mới hiển thị các mốc tiếp theo của chuyến đi
  if (!isCancelled && !isExpired) {
    timelineSteps.push({
      title: 'Xác nhận chỗ ngồi & Vé điện tử',
      time: isPaid ? 'Sẵn sàng lên xe' : 'Chờ thanh toán hoàn tất',
      completed: isPaid,
      current: false,
    });

    timelineSteps.push({
      title: 'Hoàn thành chuyến đi',
      time: isPast 
        ? (depTime ? formatDateTime(depTime.toISOString()) : '') 
        : (depTime ? `Dự kiến: ${formatDateTime(depTime.toISOString())}` : 'Dự kiến'),
      completed: Boolean(isPast && isPaid),
      current: Boolean(!isPast && isPaid),
    });
  }

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
              onClick={() => navigate(isStaffOrAdmin ? '/admin/tickets' : '/bookings')}
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
            onClick={() => navigate(isStaffOrAdmin ? '/admin/tickets' : '/bookings')}
            className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200/80 shadow-2xs"
          >
            <ArrowLeft size={16} />
            <span>{isStaffOrAdmin ? 'Quản lý vé (Admin)' : 'Danh sách vé'}</span>
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
                  : booking.status === 'CANCEL_REQUESTED'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {booking.status === 'PAID' 
                  ? 'ĐÃ THANH TOÁN' 
                  : booking.status === 'PENDING_PAYMENT' 
                  ? 'CHỜ THANH TOÁN' 
                  : booking.status === 'CANCEL_REQUESTED' 
                  ? 'YÊU CẦU HỦY VÉ' 
                  : 'ĐÃ HỦY'}
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

          {/* Individual Tickets & Change Seat List */}
          {tickets.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-2">
                  <Ticket size={16} className="text-blue-600" />
                  <span>Danh sách vé trong đơn ({tickets.length} vé)</span>
                </h3>
                <span className="text-xs text-gray-400">
                  Hỗ trợ đổi ghế hoặc hủy từng vé lẻ
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tickets.map(t => (
                  <div key={t.id} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-blue-600 text-sm">{t.ticketCode}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'USED' ? 'bg-blue-100 text-blue-800' :
                          t.status === 'ISSUED' ? 'bg-emerald-100 text-emerald-800' :
                          t.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {t.status === 'USED' ? 'Đã lên xe' : t.status === 'ISSUED' ? 'Hợp lệ' : t.status === 'CANCELLED' ? 'Đã hủy' : t.status === 'RESERVED' ? 'Đã giữ chỗ' : t.status}
                        </span>
                      </div>
                      <p className="font-extrabold text-gray-900 text-sm">
                        Ghế: <span className="text-blue-700">{t.seat?.seatName || t.seatNumber}</span>
                        {t.seat?.floor && <span className="text-xs font-normal text-gray-500"> (Tầng {t.seat.floor})</span>}
                      </p>
                    </div>

                    {/* Actions */}
                    {booking?.status === 'PAID' && !isPast && t.status === 'ISSUED' && (
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => setSelectedChangeSeatTicket(t)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold text-[11px] transition-colors flex items-center space-x-1"
                        >
                          <ArrowLeftRight size={12} />
                          <span>Đổi ghế</span>
                        </button>
                        <button
                          onClick={() => handleCancelSingleTicket(t.id, t.seat?.seatName || t.seatNumber)}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold text-[10px] transition-colors"
                        >
                          Hủy vé
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
              <div className="text-xs text-gray-600 max-w-md space-y-1 bg-white/70 p-3 rounded-xl border border-blue-100">
                <p className="font-semibold text-blue-900">⏰ Khung giờ soát vé lên xe:</p>
                <p>• <strong>Mở cổng:</strong> Tối thiểu 30 – 60 phút trước giờ xe chạy.</p>
                <p>• <strong>Đóng cổng:</strong> Trước giờ xuất bến 5 – 10 phút để chốt danh sách & xếp hành lý.</p>
              </div>
            </div>

            {/* QR Graphic */}
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-blue-100 flex flex-col items-center flex-shrink-0">
              <div className="w-32 h-32 bg-white rounded-xl p-1 flex items-center justify-center">
                {tickets[0]?.qrCode ? (
                  <img 
                    src={tickets[0].qrCode.startsWith('data:image') ? tickets[0].qrCode : `data:image/png;base64,${tickets[0].qrCode}`} 
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
                    step.isCancelled
                      ? 'bg-rose-500 text-white ring-4 ring-rose-50'
                      : step.completed
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-50'
                      : step.current
                      ? 'bg-blue-600 text-white ring-4 ring-blue-50 animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step.isCancelled ? (
                      <XCircle size={12} />
                    ) : step.completed ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    )}
                  </div>
                  <div>
                    <p className={`font-bold ${step.isCancelled ? 'text-rose-600' : step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                    {step.time && (
                      <p className={step.isCancelled ? 'text-rose-500 font-medium' : 'text-gray-400'}>
                        {step.time}
                      </p>
                    )}
                    {step.description && (
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {step.description}
                      </p>
                    )}
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

      {/* Change Seat Modal */}
      <ChangeSeatModal
        isOpen={Boolean(selectedChangeSeatTicket)}
        ticket={selectedChangeSeatTicket}
        tripId={booking?.trip?.id || null}
        vehicleId={booking?.trip?.vehicle?.id || null}
        onClose={() => setSelectedChangeSeatTicket(null)}
        onSuccess={() => {
          fetchBookingDetail();
          setSelectedChangeSeatTicket(null);
        }}
      />

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
