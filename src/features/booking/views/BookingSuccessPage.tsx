import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Download, 
  ArrowLeft, 
  QrCode, 
  Bus, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Loader2,
  FileText,
  RotateCcw
} from 'lucide-react';
import { BookingService } from '../api/booking.service';
import type { BookingItem, TicketItem, PaymentItem } from '../types/booking.types';
import toast from 'react-hot-toast';

export const BookingSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<PaymentItem | null>(null);

  useEffect(() => {
    const processPaymentResult = async () => {
      setLoading(true);

      // Check if coming from VNPay Redirect with query parameters
      const vnpResponseCode = searchParams.get('vnp_ResponseCode');
      const vnpTxnRef = searchParams.get('vnp_TxnRef');

      if (vnpResponseCode && vnpTxnRef) {
        // Collect all query parameters into a map
        const paramsMap: Record<string, string> = {};
        searchParams.forEach((val, key) => {
          paramsMap[key] = val;
        });

        try {
          // Call backend VNPay return handler to verify checksum and update DB
          const res = await BookingService.processVNPayReturn(paramsMap);
          if (res.success && res.data) {
            setPaymentInfo(res.data);
            const isPaid = res.data.status === 'SUCCESS';
            setIsSuccess(isPaid);
            if (!isPaid) {
              setErrorMessage(res.message || 'Thanh toán qua cổng VNPay không thành công hoặc đã bị hủy.');
            }

            // Extract bookingId from vnpTxnRef (e.g. "12_1741800000")
            const bookingIdStr = vnpTxnRef.split('_')[0];
            const bookingId = parseInt(bookingIdStr, 10);
            if (!isNaN(bookingId)) {
              await loadBookingAndTickets(bookingId);
            }
          } else {
            setIsSuccess(false);
            setErrorMessage(res.message || 'Thanh toán thất bại');
          }
        } catch (err: any) {
          console.error('VNPay return verification failed:', err);
          setIsSuccess(false);
          setErrorMessage(err.response?.data?.message || 'Không thể xác thực kết quả thanh toán VNPay');
        } finally {
          setLoading(false);
        }
        return;
      }

      // Check if coming from internal flow (Instant test payment or passed state)
      const passedBookingId = location.state?.bookingId || location.state?.booking?.id;
      if (passedBookingId) {
        setIsSuccess(location.state?.isSuccess ?? true);
        if (location.state?.paymentInfo) {
          setPaymentInfo(location.state.paymentInfo);
        }
        await loadBookingAndTickets(passedBookingId);
        setLoading(false);
        return;
      }

      // If no params and no state, redirect to home
      setLoading(false);
      setErrorMessage('Không tìm thấy thông tin giao dịch thanh toán.');
    };

    const loadBookingAndTickets = async (bookingId: number) => {
      try {
        const resBooking = await BookingService.getBookingById(bookingId);
        if (resBooking.success && resBooking.data) {
          setBooking(resBooking.data);
        }

        const resTickets = await BookingService.getTicketsByBookingId(bookingId);
        if (resTickets.success && Array.isArray(resTickets.data)) {
          setTickets(resTickets.data);
        }
      } catch (err) {
        console.error('Error loading booking and tickets:', err);
      }
    };

    processPaymentResult();
  }, [searchParams, location.state]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/60 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl max-w-sm w-full text-center space-y-4 animate-in fade-in">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Loader2 size={32} className="animate-spin text-blue-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Đang xác thực kết quả thanh toán...</h2>
          <p className="text-xs text-gray-500">Vui lòng chờ trong giây lát trong khi chúng tôi kiểm tra giao dịch với hệ thống.</p>
        </div>
      </div>
    );
  }

  // Payment Failed State
  if (!isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl border border-rose-100 overflow-hidden text-center p-8 sm:p-10 space-y-6">
          <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
            <XCircle size={48} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              Thanh toán không thành công
            </h1>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {errorMessage || 'Giao dịch của bạn đã bị hủy hoặc không thể hoàn tất. Ghế chưa thanh toán sẽ được tự động giải phóng.'}
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/search"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <RotateCcw size={16} />
              <span>Tìm chuyến & Đặt lại</span>
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Payment Success State
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Success Header */}
        <div className="bg-emerald-500 p-8 sm:p-10 text-center text-white space-y-3">
          <div className="w-20 h-20 bg-white text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
            <CheckCircle size={44} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Thanh toán thành công!
            </h1>
            <p className="text-emerald-100 text-sm font-medium">
              Chuyến đi của bạn đã được xác nhận và vé điện tử đã được phát hành.
            </p>
          </div>
        </div>

        {/* Booking & Ticket Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Left: Passenger and Trip Summary */}
            <div className="flex-1 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    MÃ ĐƠN ĐẶT VÉ
                  </span>
                  <span className="text-2xl font-black text-blue-600">
                    #{booking?.id || '---'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    TỔNG TIỀN ĐÃ TRẢ
                  </span>
                  <span className="text-xl font-black text-emerald-600">
                    {booking?.totalPrice ? new Intl.NumberFormat('vi-VN').format(booking.totalPrice) : '0'}₫
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                  <p className="text-gray-400 mb-0.5">Khách hàng</p>
                  <p className="font-extrabold text-gray-900">{booking?.customer?.fullName || 'N/A'}</p>
                  <p className="text-gray-500 text-[11px]">{booking?.customer?.phoneNumber || ''}</p>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                  <p className="text-gray-400 mb-0.5">Vị trí ghế</p>
                  <p className="font-extrabold text-blue-700">
                    {tickets.length > 0 
                      ? tickets.map(t => t.seat?.seatName).join(', ') 
                      : (booking?.tickets?.map(t => t.seatNumber).join(', ') || 'Ghế đã chọn')}
                  </p>
                  <p className="text-gray-500 text-[11px]">{tickets.length || 1} chỗ ngồi</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
                <div className="flex items-center justify-between font-extrabold text-gray-900 text-sm">
                  <span>{booking?.trip?.route?.departureLocation}</span>
                  <span>→</span>
                  <span>{booking?.trip?.route?.arrivalLocation}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-500 text-[11px]">
                  <Clock size={13} className="text-blue-600" />
                  <span>
                    Khởi hành: <strong>{booking?.trip?.departureTime ? new Date(booking.trip.departureTime).toLocaleString('vi-VN') : 'N/A'}</strong>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Right: Real Backend QR Code */}
            <div className="flex flex-col items-center justify-center md:border-l border-gray-100 md:pl-8 space-y-3">
              <div className="w-44 h-44 bg-white p-2 rounded-2xl border-2 border-dashed border-blue-200 shadow-sm flex items-center justify-center">
                {tickets[0]?.qrCode ? (
                  <img 
                    src={`data:image/png;base64,${tickets[0].qrCode}`} 
                    alt="Ticket QR Code" 
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <QrCode size={90} className="text-gray-800" />
                    <span className="text-[10px] font-mono text-gray-500 mt-1">
                      {tickets[0]?.ticketCode || `VX-${booking?.id}`}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-gray-500 text-center leading-relaxed">
                Mã QR soát vé chính thức<br/>
                <span className="text-blue-600 font-semibold">Xuất trình khi lên xe</span>
              </p>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-gray-50/80 p-6 border-t border-gray-100 flex flex-col sm:flex-row justify-center gap-3">
          {booking?.id && (
            <Link 
              to={`/bookings/${booking.id}/e-ticket`}
              className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-600/20 transition-all"
            >
              <QrCode size={18} />
              <span>Xem Thẻ lên xe (E-Ticket) & In PDF</span>
            </Link>
          )}
          {booking?.id && (
            <Link 
              to={`/bookings/${booking.id}`}
              className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold text-sm transition-colors"
            >
              <FileText size={18} />
              <span>Chi tiết đơn hàng</span>
            </Link>
          )}
          <Link 
            to="/"
            className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl font-bold text-sm transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

