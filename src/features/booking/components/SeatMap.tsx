import React from 'react';
import { type Seat } from '../api/booking.service';
import { useBookingStore } from '../../../store/useBookingStore';
import { Disc3 } from 'lucide-react';

interface SeatMapProps {
  seats: Seat[];
  maxSeats?: number;
}

export const SeatMap: React.FC<SeatMapProps> = ({ seats, maxSeats = 5 }) => {
  const { selectedSeatIds, selectedSeats, toggleSeat } = useBookingStore();

  const handleSeatClick = (seat: Seat) => {
    if (seat.isBooked || seat.isHeld) return;
    toggleSeat(seat.id, seat.seatName, maxSeats);
  };

  // Tách ghế theo tầng 1 và tầng 2 dựa trên dữ liệu thật của xe
  const lowerDeck = seats.filter(s => s.floor === 1);
  const upperDeck = seats.filter(s => s.floor === 2);

  // Fallback nếu dữ liệu xe không phân tầng rõ ràng
  const actualLower = lowerDeck.length > 0 ? lowerDeck : seats.slice(0, Math.ceil(seats.length / 2));
  const actualUpper = upperDeck.length > 0 ? upperDeck : seats.slice(Math.ceil(seats.length / 2));

  const renderDeck = (deckSeats: Seat[], title: string) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-base">{title}</h3>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Disc3 size={16} className="text-gray-400" />
            <span>Phía đầu xe</span>
          </div>
        </div>
        
        {/* Lưới ghế 3 cột */}
        <div className="grid grid-cols-3 gap-3">
          {deckSeats.map((seat) => {
            const isSelected = selectedSeatIds.includes(seat.id) || selectedSeats.includes(seat.seatName);
            const isUnavailable = seat.isBooked || seat.isHeld;

            return (
              <button
                key={seat.id}
                type="button"
                disabled={isUnavailable}
                onClick={() => handleSeatClick(seat)}
                title={seat.isBooked ? 'Ghế đã bán' : seat.isHeld ? 'Ghế đang được giữ tạm thời' : `Ghế ${seat.seatName}`}
                className={`
                  relative h-12 rounded-xl flex flex-col items-center justify-center font-bold text-sm transition-all duration-200
                  ${isUnavailable
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-inner' 
                    : isSelected 
                      ? 'bg-blue-600 text-white border-2 border-blue-700 shadow-md scale-105 ring-2 ring-blue-400/30' 
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 hover:shadow-sm'
                  }
                `}
              >
                <span>{seat.seatName}</span>
                {seat.isHeld && (
                  <span className="text-[9px] text-amber-600 font-normal leading-none mt-0.5">Giữ chỗ</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 text-center text-xs text-gray-400 border-t border-gray-100">
        Tổng số: {deckSeats.length} ghế
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Chú thích màu sắc (Legend) */}
      <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-gray-600 bg-gray-50/80 p-3 rounded-xl border border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-gray-300 rounded-lg bg-white shadow-sm"></div>
          <span>Ghế trống</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-blue-600 border border-blue-700 rounded-lg shadow-sm"></div>
          <span>Đang chọn</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-gray-100 border border-gray-200 rounded-lg shadow-inner"></div>
          <span>Đã bán / Giữ chỗ</span>
        </div>
      </div>

      {/* Hiển thị tầng */}
      <div className={`grid grid-cols-1 ${actualUpper.length > 0 ? 'md:grid-cols-2' : ''} gap-6`}>
        {renderDeck(actualLower, actualUpper.length > 0 ? 'Tầng Dưới' : 'Sơ đồ ghế')}
        {actualUpper.length > 0 && renderDeck(actualUpper, 'Tầng Trên')}
      </div>
    </div>
  );
};
