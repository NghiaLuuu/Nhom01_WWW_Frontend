import React, { useState, useMemo } from 'react';
import { 
  X, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  Info,
  ChevronDown
} from 'lucide-react';
import type { BookingItem } from '../types/booking.types';
import { BookingService } from '../api/booking.service';
import toast from 'react-hot-toast';

interface CancelTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingItem;
  onCancelSuccess: () => void;
}

const CANCEL_REASONS = [
  'Thay đổi lịch trình cá nhân',
  'Có việc gia đình đột xuất',
  'Đặt nhầm ngày / giờ / tuyến xe',
  'Đặt nhầm số lượng ghế / vị trí ghế',
  'Gặp vấn đề về sức khỏe / thời tiết',
  'Chuyển sang phương tiện khác',
  'Lý do khác',
];

export const CancelTicketModal: React.FC<CancelTicketModalProps> = ({
  isOpen,
  onClose,
  booking,
  onCancelSuccess,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountHolder, setAccountHolder] = useState<string>('');
  const [agreePolicy, setAgreePolicy] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Calculate refund percentage and estimated refund amount based on departure time
  const { hoursUntilDeparture, refundRate, refundAmount, feeAmount } = useMemo(() => {
    if (!booking?.trip?.departureTime) {
      return { hoursUntilDeparture: 0, refundRate: 0, refundAmount: 0, feeAmount: 0 };
    }

    const departure = new Date(booking.trip.departureTime).getTime();
    const now = new Date().getTime();
    const diffHours = (departure - now) / (1000 * 60 * 60);

    let rate = 0;
    if (diffHours >= 24) {
      rate = 1.0; // 100% refund
    } else if (diffHours >= 12) {
      rate = 0.8; // 80% refund
    } else if (diffHours >= 4) {
      rate = 0.5; // 50% refund
    } else {
      rate = 0.0; // No refund
    }

    const total = Number(booking.totalPrice) || 0;
    const refAmount = Math.round(total * rate);
    const fee = total - refAmount;

    return {
      hoursUntilDeparture: Math.max(0, Math.floor(diffHours)),
      refundRate: rate * 100,
      refundAmount: refAmount,
      feeAmount: fee,
    };
  }, [booking]);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreePolicy) {
      toast.error('Vui lòng đồng ý với chính sách hủy vé và hoàn tiền');
      return;
    }

    const finalReason = selectedReason === 'Lý do khác' ? (customReason.trim() || 'Lý do khác') : selectedReason;

    setIsSubmitting(true);
    try {
      const res = await BookingService.requestCancelBooking({
        bookingId: booking.id,
        reason: finalReason,
        bankName,
        accountNumber,
        accountHolder,
      });

      if (res.success || res.data) {
        toast.success(res.message || 'Yêu cầu hủy vé đã được gửi thành công!');
        onCancelSuccess();
        onClose();
      } else {
        toast.error(res.message || 'Không thể hủy vé. Vui lòng liên hệ hỗ trợ');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu hủy vé';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <AlertTriangle className="text-white" size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Xác nhận hủy vé</h3>
              <p className="text-xs text-red-100">Mã đơn: #{booking.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Trip Summary Card */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs text-gray-500 font-medium">Chuyến xe</p>
                <p className="text-base font-bold text-gray-900">
                  {booking.trip?.route?.departureLocation} → {booking.trip?.route?.arrivalLocation}
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-red-100 text-red-700 rounded-lg">
                Ghế: {booking.tickets?.map(t => t.seatNumber).join(', ') || booking.seats?.join(', ') || 'N/A'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-200 gap-1">
              <span className="flex items-center space-x-1">
                <Clock size={13} className="text-gray-400" />
                <span>
                  Khởi hành: <strong>{booking.trip?.departureTime ? new Date(booking.trip.departureTime).toLocaleString('vi-VN') : 'N/A'}</strong>
                </span>
                <span className="text-blue-600 font-medium">({hoursUntilDeparture}h nữa)</span>
              </span>
              <span className="text-[11px] text-gray-500">
                Ngày đặt: {booking.createdAt ? new Date(booking.createdAt).toLocaleString('vi-VN') : 'N/A'}
              </span>
            </div>
          </div>

          {/* Refund Policy Calculation Box */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-amber-800 font-semibold text-sm">
              <Info size={16} />
              <span>Chính sách & Ước tính hoàn tiền</span>
            </div>

            <div className="space-y-1.5 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>Giá vé gốc:</span>
                <span className="font-semibold text-gray-900">
                  {Number(booking.totalPrice).toLocaleString('vi-VN')}₫
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tỷ lệ hoàn tiền:</span>
                <span className={`font-bold ${refundRate > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {refundRate}% ({hoursUntilDeparture >= 24 ? 'Hủy trước 24h' : hoursUntilDeparture >= 12 ? 'Hủy 12h - 24h' : hoursUntilDeparture >= 4 ? 'Hủy 4h - 12h' : 'Dưới 4h'})
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Phí hủy vé:</span>
                <span>{feeAmount.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="pt-2 border-t border-amber-200 flex justify-between items-center text-sm font-bold text-gray-900">
                <span>Tiền hoàn lại dự kiến:</span>
                <span className="text-base text-emerald-600">
                  {refundAmount.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Lý do hủy vé <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 pr-10"
              >
                {CANCEL_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>

            {selectedReason === 'Lý do khác' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Nhập lý do chi tiết..."
                rows={2}
                className="w-full mt-2 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            )}
          </div>

          {/* Bank Info for Refund (if refundAmount > 0) */}
          {refundAmount > 0 && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-xs font-semibold text-gray-700">
                <CreditCard size={15} className="text-blue-600" />
                <span>Thông tin tài khoản nhận tiền hoàn (Nếu có)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Tên ngân hàng (VD: Vietcombank)"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Số tài khoản"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Tên chủ tài khoản"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="sm:col-span-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none uppercase"
                />
              </div>
            </div>
          )}

          {/* Agreement Checkbox */}
          <label className="flex items-start space-x-2.5 pt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreePolicy}
              onChange={(e) => setAgreePolicy(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-gray-300"
            />
            <span className="text-xs text-gray-600 leading-relaxed">
              Tôi xác nhận muốn hủy vé này và đồng ý với mức hoàn tiền{' '}
              <strong className="text-gray-900">{refundAmount.toLocaleString('vi-VN')}₫</strong> theo quy định nhà xe.
            </span>
          </label>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Giữ lại vé
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !agreePolicy}
              className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md shadow-red-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Xác nhận hủy</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
