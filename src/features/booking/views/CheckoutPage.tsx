import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBookingStore } from '../../../store/useBookingStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { BookingService } from '../api/booking.service';
import type { BookingItem } from '../types/booking.types';
import toast from 'react-hot-toast';
import { 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  Bus, 
  MapPin, 
  User as UserIcon, 
  Phone, 
  Mail, 
  AlertTriangle,
  Zap,
  ArrowLeft,
  XCircle
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentBooking, selectedTrip, selectedSeats, holdExpiresAt, clearBooking, setCurrentBooking } = useBookingStore();
  const { isAuthenticated, user } = useAuthStore();
  
  const [booking, setBooking] = useState<BookingItem | null>(location.state?.booking || currentBooking);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'VNPAY' | 'INSTANT_TEST'>('VNPAY');
  const [isCancelling, setIsCancelling] = useState(false);

  // Customer Contact State
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || '');

  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.fullName || '');
      if (!customerEmail) setCustomerEmail(user.email || '');
      if (!customerPhone) setCustomerPhone(user.phoneNumber || '');
    }
  }, [user]);

  // Sync booking if updated from state
  useEffect(() => {
    if (location.state?.booking) {
      setBooking(location.state.booking);
      setCurrentBooking(location.state.booking);
    }
  }, [location.state]);

  // Fallback: If no active booking and no selected trip, redirect to search
  useEffect(() => {
    if (!booking && !currentBooking && (!selectedTrip || selectedSeats.length === 0)) {
      navigate('/search', { replace: true });
    }
  }, [booking, currentBooking, selectedTrip, selectedSeats, navigate]);

  // Real 5-minute countdown timer logic
  useEffect(() => {
    const activeExpiresAt = booking?.holdExpiresAt 
      ? new Date(booking.holdExpiresAt).getTime() 
      : holdExpiresAt;

    if (!activeExpiresAt) return;

    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, activeExpiresAt - now);
      setTimeLeft(remaining);

      if (remaining === 0) {
        toast.error('Thời gian giữ chỗ (5 phút) đã hết. Ghế đã được tự động giải phóng.');
        if (booking?.id) {
          BookingService.cancelPendingBooking(booking.id).catch(() => {});
        }
        clearBooking();
        navigate('/search');
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [booking, holdExpiresAt, navigate, clearBooking]);

  const handleCancelHold = async () => {
    if (!booking?.id) {
      clearBooking();
      navigate('/search');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn hủy giữ chỗ và trả lại ghế này không?')) {
      return;
    }

    setIsCancelling(true);
    try {
      await BookingService.cancelPendingBooking(booking.id);
      toast.success('Đã hủy giữ chỗ thành công');
      clearBooking();
      navigate('/search');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi hủy giữ chỗ');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để hoàn tất thanh toán');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    const targetBookingId = booking?.id || currentBooking?.id;
    if (!targetBookingId) {
      toast.error('Không tìm thấy thông tin đơn đặt vé!');
      return;
    }

    setIsProcessing(true);

    if (paymentMethod === 'VNPAY') {
      const toastId = toast.loading('Đang khởi tạo liên kết thanh toán VNPay...');
      try {
        const res = await BookingService.createVNPayPaymentUrl(targetBookingId);
        if (res.success && res.data) {
          toast.success('Đang chuyển hướng sang cổng VNPay...', { id: toastId });
          // Redirect directly to VNPay Payment Gateway
          window.location.href = res.data;
        } else {
          toast.error(res.message || 'Không thể tạo link thanh toán VNPay', { id: toastId });
          setIsProcessing(false);
        }
      } catch (err: any) {
        console.error('VNPay create link error:', err);
        toast.error(err.response?.data?.message || 'Lỗi khi kết nối cổng thanh toán VNPay', { id: toastId });
        setIsProcessing(false);
      }
    } else {
      // INSTANT TEST / MOCK WEBHOOK
      const toastId = toast.loading('Đang xử lý thanh toán thử nghiệm tức thì...');
      try {
        const res = await BookingService.testInstantPayment(targetBookingId);
        if (res.success) {
          toast.success('Thanh toán thành công!', { id: toastId });
          clearBooking();
          navigate('/booking-success', { 
            state: { 
              bookingId: targetBookingId,
              isSuccess: true,
              paymentInfo: res.data 
            } 
          });
        } else {
          toast.error(res.message || 'Thanh toán không thành công', { id: toastId });
          setIsProcessing(false);
        }
      } catch (err: any) {
        console.error('Instant payment error:', err);
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi xác nhận thanh toán', { id: toastId });
        setIsProcessing(false);
      }
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activeTrip = booking?.trip || selectedTrip;
  const activeSeats = booking?.tickets?.map(t => t.seat?.seatName || t.seatNumber) || 
                      booking?.seats || 
                      selectedSeats.map(s => s.seatName);
  const totalPrice = booking?.totalPrice || (selectedTrip ? selectedTrip.price * selectedSeats.length : 0);

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16 pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/search')}
            className="inline-flex items-center space-x-2 text-xs font-bold text-gray-600 hover:text-blue-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs"
          >
            <ArrowLeft size={15} />
            <span>Quay lại tìm chuyến</span>
          </button>

          {booking?.id && (
            <button
              onClick={handleCancelHold}
              disabled={isCancelling}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl border border-rose-200 transition-colors"
            >
              <XCircle size={15} />
              <span>{isCancelling ? 'Đang hủy...' : 'Hủy giữ chỗ'}</span>
            </button>
          )}
        </div>

        {/* 5-Minute Hold Countdown Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg shadow-orange-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-xs">
              <Clock size={26} className="text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Ghế của bạn đang được giữ tạm thời!
              </h2>
              <p className="text-xs text-orange-100 font-medium">
                Vui lòng hoàn tất thanh toán trước khi hết hạn để không bị hủy vé.
              </p>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-white/30 text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-orange-100">
              Thời gian còn lại
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-wider">
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Passenger Info & Payment Options */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Passenger Information */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-5">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                <UserIcon size={16} />
                <span>Thông tin người đặt vé</span>
              </div>

              <form id="checkout-form" onSubmit={handleProcessPayment} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">Họ và tên hành khách</label>
                  <div className="relative">
                    <input 
                      required
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700">Email nhận vé điện tử</label>
                    <div className="relative">
                      <input 
                        required
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700">Số điện thoại liên hệ</label>
                    <div className="relative">
                      <input 
                        required
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="0912345678"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                <CreditCard size={16} />
                <span>Phương thức thanh toán</span>
              </div>

              <div className="space-y-3">
                {/* VNPay Gateway Option */}
                <label 
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'VNPAY' 
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <input 
                      type="radio"
                      name="paymentMethod"
                      value="VNPAY"
                      checked={paymentMethod === 'VNPAY'}
                      onChange={() => setPaymentMethod('VNPAY')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <div className="text-sm font-extrabold text-gray-900 flex items-center space-x-2">
                        <span>Cổng thanh toán VNPay Sandbox</span>
                        <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-md font-black">
                          VNPAY QR
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Hỗ trợ quét QR VNPAY, thẻ ATM nội địa hoặc thẻ Quốc tế (Visa/Mastercard)
                      </p>
                    </div>
                  </div>
                </label>

                {/* Instant Test Mode Option */}
                <label 
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'INSTANT_TEST' 
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-sm' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <input 
                      type="radio"
                      name="paymentMethod"
                      value="INSTANT_TEST"
                      checked={paymentMethod === 'INSTANT_TEST'}
                      onChange={() => setPaymentMethod('INSTANT_TEST')}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div>
                      <div className="text-sm font-extrabold text-gray-900 flex items-center space-x-2">
                        <span>Thanh toán Thử nghiệm tức thì (Demo Test)</span>
                        <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center space-x-0.5">
                          <Zap size={11} />
                          <span>Tức thì</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Xác nhận thanh toán và phát hành vé điện tử ngay lập tức không cần chuyển khoản thật.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout Button */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 sticky top-6">
              <div className="space-y-1 pb-4 border-b border-gray-100">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Chi tiết đơn giữ chỗ
                </span>
                <h3 className="text-base font-extrabold text-gray-900">
                  {booking?.id ? `Mã đơn #${booking.id}` : 'Tóm tắt vé'}
                </h3>
              </div>
              
              <div className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <span className="text-gray-400 block font-medium">Tuyến đường:</span>
                  <div className="font-extrabold text-gray-900 text-sm">
                    {activeTrip?.route?.departureLocation} → {activeTrip?.route?.arrivalLocation}
                  </div>
                </div>

                <div className="flex justify-between py-1 border-t border-gray-50">
                  <span className="text-gray-500">Thời gian đi:</span>
                  <span className="font-bold text-gray-900 text-right">
                    {activeTrip?.departureTime ? new Date(activeTrip.departureTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-t border-gray-50">
                  <span className="text-gray-500">Phương tiện:</span>
                  <span className="font-bold text-gray-800 text-right">
                    {activeTrip?.vehicle?.licensePlate || ''} ({activeTrip?.vehicle?.type || 'Xe khách'})
                  </span>
                </div>

                <div className="flex justify-between py-1 border-t border-gray-50">
                  <span className="text-gray-500">Số lượng:</span>
                  <span className="font-bold text-gray-900">
                    {activeSeats.length} vé
                  </span>
                </div>

                <div className="flex justify-between py-1 border-t border-gray-50">
                  <span className="text-gray-500">Vị trí ghế:</span>
                  <span className="font-black text-blue-600">
                    {activeSeats.join(', ')}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-gray-600">Tổng thanh toán:</span>
                  <span className="text-2xl font-black text-blue-600">
                    {new Intl.NumberFormat('vi-VN').format(totalPrice)}₫
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 text-right">Đã bao gồm thuế & phí dịch vụ</p>
              </div>

              <button
                form="checkout-form"
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <ShieldCheck size={18} />
                <span>{isProcessing ? 'Đang xử lý thanh toán...' : 'Tiến hành thanh toán'}</span>
              </button>

              <div className="text-center">
                <p className="text-[11px] text-gray-400 flex items-center justify-center space-x-1">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  <span>Bảo mật thanh toán chuẩn SSL 256-bit</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

