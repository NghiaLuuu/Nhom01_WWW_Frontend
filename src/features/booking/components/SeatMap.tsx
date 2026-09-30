import React from 'react';
import type { SeatItem } from '../types/booking.types';
import { useBookingStore } from '../../../store/useBookingStore';

interface SeatMapProps {
  seats: SeatItem[];
  maxSeats?: number;
}

export const SeatMap: React.FC<SeatMapProps> = ({ seats, maxSeats = 5 }) => {
  const { selectedSeats, toggleSeatItem } = useBookingStore();

  const handleSeatClick = (seat: SeatItem) => {
    if (seat.isBooked) return;
    toggleSeatItem(seat, maxSeats);
  };

  // Group seats by floor
  const floor1Seats = seats.filter(s => s.floor === 1 || !s.floor);
  const floor2Seats = seats.filter(s => s.floor === 2);

  // Fallback split if all floor values are 1 or empty but length > 20
  let lowerDeck = floor1Seats;
  let upperDeck = floor2Seats;
  if (floor2Seats.length === 0 && seats.length > 18) {
    const half = Math.ceil(seats.length / 2);
    lowerDeck = seats.slice(0, half);
    upperDeck = seats.slice(half);
  }

  const renderDeck = (deckSeats: SeatItem[], title: string) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
        <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
        <span className="text-xs text-gray-500 font-medium">{deckSeats.length} chỗ</span>
      </div>
      
      {/* Bus layout simulation: 3 columns (A, B, C) */}
      <div className="grid grid-cols-3 gap-3">
        {deckSeats.map((seat) => {
          const isSelected = selectedSeats.some(s => s.id === seat.id);
          return (
            <button
              key={seat.id}
              type="button"
              disabled={seat.isBooked}
              onClick={() => handleSeatClick(seat)}
              className={`
                relative h-12 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition-all duration-150
                ${seat.isBooked 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                  : isSelected 
                    ? 'bg-blue-600 text-white border-2 border-blue-700 shadow-md shadow-blue-500/30 scale-105 z-10' 
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                }
              `}
              title={seat.isBooked ? `Ghế ${seat.seatName} đã được đặt` : `Ghế ${seat.seatName}`}
            >
              <span>{seat.seatName}</span>
              {seat.isBooked && (
                <span className="text-[9px] font-normal opacity-70">Đã đặt</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold text-gray-600 bg-white p-3 rounded-xl border border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-gray-300 rounded-md bg-white"></div>
          <span>Ghế trống</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-600 rounded-md shadow-xs"></div>
          <span className="text-blue-700">Đang chọn (tối đa {maxSeats})</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded-md"></div>
          <span className="text-gray-500">Đã đặt / Đang giữ chỗ</span>
        </div>
      </div>

      {upperDeck.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderDeck(lowerDeck, 'Tầng 1 (Dưới)')}
          {renderDeck(upperDeck, 'Tầng 2 (Trên)')}
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          {renderDeck(lowerDeck, 'Sơ đồ ghế xe')}
        </div>
      )}
    </div>
  );
};

