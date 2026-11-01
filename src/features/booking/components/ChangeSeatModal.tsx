import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeftRight, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle,
  Bus 
} from 'lucide-react';
import { BookingService } from '../api/booking.service';
import type { SeatItem, TicketItem } from '../types/booking.types';
import toast from 'react-hot-toast';

interface ChangeSeatModalProps {
  isOpen: boolean;
  ticket: TicketItem | null;
  tripId: number | null;
  vehicleId: number | null;
  onClose: () => void;
  onSuccess: (updatedTicket: TicketItem) => void;
}

export const ChangeSeatModal: React.FC<ChangeSeatModalProps> = ({
  isOpen,
  ticket,
  tripId,
  vehicleId,
  onClose,
  onSuccess
}) => {
  const [seats, setSeats] = useState<SeatItem[]>([]);
  const [occupiedSeatIds, setOccupiedSeatIds] = useState<number[]>([]);
  const [selectedNewSeatId, setSelectedNewSeatId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && vehicleId && tripId) {
      setSelectedNewSeatId(null);
      loadSeats();
    }
  }, [isOpen, vehicleId, tripId]);

  const loadSeats = async () => {
    if (!vehicleId || !tripId) return;
    setIsLoading(true);
    try {
      const [seatsRes, occupiedRes] = await Promise.all([
        BookingService.getSeatsByVehicle(vehicleId),
        BookingService.getOccupiedSeats(tripId)
      ]);

      if (seatsRes.success && Array.isArray(seatsRes.data)) {
        setSeats(seatsRes.data);
      }
      if (occupiedRes.success && Array.isArray(occupiedRes.data)) {
        setOccupiedSeatIds(occupiedRes.data);
      }
    } catch (err) {
      toast.error('Lỗi khi tải sơ đồ ghế');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmChange = async () => {
    if (!ticket?.id || !selectedNewSeatId) {
      toast.error('Vui lòng chọn ghế ngồi mới!');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Đang xử lý đổi chỗ ngồi...');
    try {
      const res = await BookingService.changeSeat(ticket.id, selectedNewSeatId);
      if (res.success && res.data) {
        toast.success('Đổi ghế ngồi thành công!', { id: toastId });
        onSuccess(res.data);
        onClose();
      } else {
        toast.error(res.message || 'Đổi ghế không thành công', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi đổi ghế', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !ticket) return null;

  const currentSeatId = ticket.seat?.id;
  const currentSeatName = ticket.seat?.seatName || ticket.seatNumber;
  const selectedSeat = seats.find(s => s.id === selectedNewSeatId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <ArrowLeftRight size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold">Đổi Ghế Ngồi Cho Vé #{ticket.ticketCode}</h2>
              <p className="text-xs text-slate-300">Chọn vị trí ghế còn trống cùng chuyến xe</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current vs New Seat Badge */}
        <div className="bg-blue-50/70 p-4 border-b border-blue-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-gray-500 block text-[11px]">Ghế hiện tại:</span>
            <span className="font-black text-gray-900 text-sm">{currentSeatName}</span>
          </div>
          <ArrowLeftRight size={16} className="text-blue-500" />
          <div className="text-right">
            <span className="text-gray-500 block text-[11px]">Ghế mới chọn:</span>
            <span className={`font-black text-sm ${selectedSeat ? 'text-blue-600' : 'text-gray-400'}`}>
              {selectedSeat ? selectedSeat.seatName : 'Chưa chọn'}
            </span>
          </div>
        </div>

        {/* Seat Map */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-gray-700">Sơ đồ ghế xe:</span>
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded bg-white border border-gray-300" />
                <span className="text-gray-500">Trống</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded bg-blue-600" />
                <span className="text-blue-600 font-bold">Mới chọn</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded bg-gray-200 border border-gray-300" />
                <span className="text-gray-400">Đã bán</span>
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-gray-400 space-y-2">
              <RefreshCw size={20} className="animate-spin mx-auto text-blue-600" />
              <p>Đang tải sơ đồ ghế...</p>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1">
                {seats.map(seat => {
                  const isCurrent = seat.id === currentSeatId;
                  const isOccupied = occupiedSeatIds.includes(seat.id) && !isCurrent;
                  const isSelected = seat.id === selectedNewSeatId;

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      disabled={isOccupied || isCurrent}
                      onClick={() => setSelectedNewSeatId(seat.id)}
                      className={`p-2.5 rounded-xl text-center font-bold text-xs transition-all flex flex-col items-center justify-center ${
                        isCurrent 
                          ? 'bg-amber-100 text-amber-800 border-2 border-amber-400' 
                          : isOccupied 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300' 
                          : isSelected 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-600' 
                          : 'bg-white text-gray-800 hover:border-blue-400 hover:bg-blue-50 border border-gray-200'
                      }`}
                    >
                      <span className="text-[10px] opacity-70">
                        {isCurrent ? 'Hiện tại' : 'Ghế'}
                      </span>
                      <span className="text-xs">{seat.seatName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={isSubmitting || !selectedNewSeatId}
              onClick={handleConfirmChange}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-600/20 flex items-center space-x-2"
            >
              {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
              <span>Xác Nhận Đổi Ghế</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
