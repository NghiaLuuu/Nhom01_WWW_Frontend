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

  const lowerDeck = seats.slice(0, 18);
  const upperDeck = seats.slice(18, 36);

  const renderDeck = (deckSeats: Seat[], title: string) => (
    <div className="bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-700">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
        <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span>{title}</span>
        </h4>
        <span className="text-[11px] text-slate-400 font-mono">3 dãy x 6 hàng</span>
      </div>
      
      {/* Bus layout simulation: 3 columns x 6 rows */}
      <div className="grid grid-cols-3 gap-2.5">
        {deckSeats.map((seat) => {
          const isSelected = selectedSeats.includes(seat.id);
          return (
            <button
              key={seat.id}
              disabled={seat.isBooked}
              onClick={() => handleSeatClick(seat)}
              type="button"
              className={`
                relative h-11 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm transition-colors cursor-pointer
                ${seat.isBooked 
                  ? 'bg-slate-900/60 text-slate-600 cursor-not-allowed border border-slate-800 line-through' 
                  : isSelected 
                    ? 'bg-blue-600 text-white border-2 border-cyan-400 shadow-md' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700 hover:border-cyan-400 hover:text-white'
                }
              `}
              title={seat.isBooked ? `Ghế ${seat.id} (Đã có khách đặt)` : `Chọn ghế ${seat.id}`}
            >
              <span>{seat.id}</span>
              {isSelected && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-medium text-slate-300 py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 w-fit mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-md border border-slate-700 bg-slate-800"></div>
          <span>Ghế trống</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-md bg-blue-600 border border-cyan-400"></div>
          <span className="text-cyan-300 font-bold">Đang chọn ({selectedSeats.length}/{maxSeats})</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-md bg-slate-900 border border-slate-800"></div>
          <span className="text-slate-500 line-through">Đã bán</span>
        </div>
      </div>

      {/* 2 Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderDeck(lowerDeck, 'Tầng 1 (Tầng dưới)')}
        {renderDeck(upperDeck, 'Tầng 2 (Tầng trên)')}
      </div>
    </div>
  );
};

export default SeatMap;
