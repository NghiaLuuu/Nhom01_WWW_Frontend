import React from 'react';
import { type Seat } from '../api/booking.service';
import { useBookingStore } from '../../../store/useBookingStore';
import { AnalyticsService } from '../../analytics/api/analytics.service';

interface SeatMapProps {
  seats: Seat[];
  maxSeats?: number;
}

export const SeatMap: React.FC<SeatMapProps> = ({ seats, maxSeats = 5 }) => {
  const { selectedSeats, toggleSeat } = useBookingStore();
  const activeSeats = selectedSeats;

  const handleSeatClick = (seat: Seat) => {
    if (seat.isBooked || seat.isHeld) return;
    toggleSeat(seat.seatId, seat.seatName, maxSeats);
    AnalyticsService.track('SELECT_SEAT', {
      seatId: seat.id,
    });
  };

  const lowerDeck = seats.filter(seat =>
    seat.seatName?.toUpperCase().startsWith('A')
      || (!seat.seatName?.toUpperCase().startsWith('B') && seat.floor === 1)
  );
  const upperDeck = seats.filter(seat =>
    seat.seatName?.toUpperCase().startsWith('B')
      || (!seat.seatName?.toUpperCase().startsWith('A') && seat.floor === 2)
  );
  const actualLowerDeck = lowerDeck.length > 0 ? lowerDeck : seats;

  const renderDeck = (deckSeats: Seat[], title: string) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-200">
      <h3 className="text-center font-semibold text-gray-700 mb-6">{title}</h3>
      
      {/* Bus layout simulation: 3 columns (A, B, C) x 6 rows */}
      <div className="grid grid-cols-3 gap-4">
        {deckSeats.map((seat) => {
          const isSelected = activeSeats.includes(seat.seatName);
          return (
            <button
              key={seat.id}
              disabled={seat.isBooked || seat.isHeld}
              onClick={() => handleSeatClick(seat)}
              className={`
                relative h-12 rounded-lg flex items-center justify-center font-medium text-sm transition-all
                ${seat.isBooked || seat.isHeld
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300' 
                  : isSelected 
                    ? 'bg-blue-600 text-white border-2 border-blue-700 shadow-md transform scale-105' 
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                }
              `}
            >
              {seat.seatName}
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

      <div className={`grid grid-cols-1 ${actualLowerDeck.length > 0 && upperDeck.length > 0 ? 'md:grid-cols-2' : ''} gap-8`}>
        {actualLowerDeck.length > 0 && renderDeck(actualLowerDeck, upperDeck.length > 0 ? 'Tầng A - Tầng dưới' : 'Tầng A')}
        {upperDeck.length > 0 && renderDeck(upperDeck, 'Tầng B - Tầng trên')}
      </div>
    </div>
  );
};
