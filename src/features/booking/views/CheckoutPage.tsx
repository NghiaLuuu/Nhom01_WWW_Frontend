import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../../store/useBookingStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { BookingService } from '../api/booking.service';
import toast from 'react-hot-toast';
import { Clock, User as UserIcon } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedTrip, selectedSeats, holdExpiresAt, clearBooking } = useBookingStore();
  const { isAuthenticated, user } = useAuthStore();
  
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // User details state
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');

  // 5-minute countdown timer logic
  useEffect(() => {
    if (!selectedTrip || selectedSeats.length === 0 || !holdExpiresAt) {
      navigate('/search');
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, holdExpiresAt - now);
      
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        toast.error('Thời gian giữ chỗ đã hết. Vui lòng chọn lại.');
        clearBooking();
        navigate('/search');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedTrip, selectedSeats, holdExpiresAt, navigate, clearBooking]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        tripId: selectedTrip!.id,
        seats: selectedSeats,
        totalPrice: selectedTrip!.price * selectedSeats.length,
        customerName,
        customerEmail,
        customerPhone
      };

      const res = await BookingService.createMockPayment(payload);
      if (res.success) {
        toast.success('Thanh toán thành công!');
        // Usually we would clearBooking here, but we might want to pass data to Success Page via state
        navigate('/booking-success', { state: { bookingDetails: res.data } });
        clearBooking();
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi thanh toán');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!selectedTrip) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3 text-yellow-800">
          <Clock size={24} />
          <span className="font-medium">Thời gian giữ chỗ còn lại:</span>
        </div>
        <div className="text-2xl font-bold text-yellow-600 font-mono">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Thông tin hành khách</h2>
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Họ và tên</label>
                <input 
                  required
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Nhập họ và tên"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Email nhận vé</label>
                <input 
                  required
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Nhập email"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Số điện thoại</label>
                <input 
                  required
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </form>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Tóm tắt vé</h2>
            
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Tuyến đường:</span>
                <span className="font-medium text-gray-900 text-right">{selectedTrip.route?.departureLocation} - {selectedTrip.route?.arrivalLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Thời gian:</span>
                <span className="font-medium text-gray-900 text-right">{new Date(selectedTrip.departureTime).toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Số lượng ghế:</span>
                <span className="font-medium text-gray-900">{selectedSeats.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Vị trí ghế:</span>
                <span className="font-medium text-blue-600">{selectedSeats.join(', ')}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-semibold">Tổng tiền:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat('vi-VN').format(selectedTrip.price * selectedSeats.length)}đ
                </span>
              </div>
            </div>

            <button
              form="checkout-form"
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
            >
              {isProcessing ? 'Đang xử lý...' : 'Xác nhận & Thanh toán'}
            </button>
          </div>
        </div>
      </div>

      {/* Auth Modal Enforcer */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Đăng nhập để tiếp tục</h3>
            <p className="text-gray-500 mb-6">Bạn cần có tài khoản để đảm bảo quyền lợi vé xe và theo dõi hành trình.</p>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  // Keep timer running, just navigate to login
                  navigate('/login', { state: { from: '/checkout' } });
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
              >
                Đăng nhập / Đăng ký ngay
              </button>
              <button 
                onClick={() => setShowAuthModal(false)}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
