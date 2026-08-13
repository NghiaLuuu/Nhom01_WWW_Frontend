import React from 'react';
import { type Seat } from '../api/booking.service';
import { useBookingStore } from '../../../store/useBookingStore';

interface SeatMapProps {
  seats: Seat[];
  maxSeats?: number;
}

export const SeatMap: React.FC<SeatMapProps> = ({ seats, maxSeats = 5 }) => {
  const { selectedSeats, toggleSeat } = useBookingStore();

  const handleSeatClick = (seat: Seat) => {
    if (seat.isBooked) return;
    toggleSeat(seat.id, maxSeats);
  };

  // Split seats into lower and upper decks
  const lowerDeck = seats.slice(0, 18);
  const upperDeck = seats.slice(18, 36);

  const renderDeck = (deckSeats: Seat[], title: string) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-200">
      <h3 className="text-center font-semibold text-gray-700 mb-6">{title}</h3>
      
      {/* Bus layout simulation: 3 columns (A, B, C) x 6 rows */}
      <div className="grid grid-cols-3 gap-4">
        {deckSeats.map((seat) => {
          const isSelected = selectedSeats.includes(seat.id);
          return (
            <button
              key={seat.id}
              disabled={seat.isBooked}
              onClick={() => handleSeatClick(seat)}
              className={`
                relative h-12 rounded-lg flex items-center justify-center font-medium text-sm transition-all
                ${seat.isBooked 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300' 
                  : isSelected 
                    ? 'bg-blue-600 text-white border-2 border-blue-700 shadow-md transform scale-105' 
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                }
              `}
            >
              {seat.id}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex justify-center space-x-6 text-sm font-medium text-gray-600 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-gray-300 rounded bg-white"></div>
          <span>Trống</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-blue-600 rounded"></div>
          <span>Đang chọn</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-gray-200 border border-gray-300 rounded"></div>
          <span>Đã đặt</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {renderDeck(lowerDeck, 'Tầng Dưới')}
        {renderDeck(upperDeck, 'Tầng Trên')}
      </div>
    </div>
  );
};
