import React, { useState } from 'react';
import { Trip } from '../../admin/api/trip.service';
import { BookingService, Seat } from '../api/booking.service';
import { useBookingStore } from '../../../store/useBookingStore';
import { SeatMap } from './SeatMap';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Bus as BusIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface TripListProps {
  trips: Trip[];
  isLoading: boolean;
}

export const TripList: React.FC<TripListProps> = ({ trips, isLoading }) => {
  const navigate = useNavigate();
  const { selectedTrip, setSelectedTrip, selectedSeats, startHoldTimer } = useBookingStore();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  const handleSelectTrip = async (trip: Trip) => {
    if (selectedTrip?.id === trip.id) {
      setSelectedTrip(null);
      return;
    }
    
    setSelectedTrip(trip);
    setLoadingSeats(true);
    try {
      const res = await BookingService.getSeatLayout(trip.id);
      if (res.success) {
        setSeats(res.data);
      }
    } catch (error) {
      toast.error('Không thể lấy sơ đồ ghế');
      setSelectedTrip(null);
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 chỗ ngồi');
      return;
    }
    startHoldTimer();
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="bg-white p-10 rounded-2xl border border-gray-200 text-center text-gray-500">
        <BusIcon size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-lg">Không tìm thấy chuyến xe nào phù hợp.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {trips.map((trip) => (
        <div key={trip.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center space-x-3 text-lg font-bold text-gray-900">
                <Clock className="text-blue-600" size={24} />
                <span>{new Date(trip.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-gray-400 font-normal mx-2">•</span>
                <span className="text-green-600 font-semibold">{trip.vehicle?.capacity} chỗ</span>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex flex-col items-center pt-1">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <div className="w-0.5 h-10 bg-gray-300 my-1"></div>
                  <div className="w-3 h-3 rounded-full border-2 border-red-500 bg-white"></div>
                </div>
                <div className="space-y-6 text-sm font-medium text-gray-700">
                  <div>{trip.route?.departureLocation}</div>
                  <div>{trip.route?.arrivalLocation}</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
              <div className="text-2xl font-bold text-blue-600 mb-4">
                {new Intl.NumberFormat('vi-VN').format(trip.price)}đ
              </div>
              <button 
                onClick={() => handleSelectTrip(trip)}
                className={`w-full px-6 py-2.5 rounded-xl font-bold transition-colors ${
                  selectedTrip?.id === trip.id 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {selectedTrip?.id === trip.id ? 'Đóng sơ đồ ghế' : 'Chọn chuyến'}
              </button>
            </div>
          </div>

          {/* Seat Map Expansion */}
          {selectedTrip?.id === trip.id && (
            <div className="bg-gray-50 p-6 border-t border-gray-200 animate-in slide-in-from-top-4 duration-300">
              {loadingSeats ? (
                <div className="text-center py-10 text-gray-500 animate-pulse">Đang tải sơ đồ ghế...</div>
              ) : (
                <div className="space-y-6">
                  <SeatMap seats={seats} />
                  
                  {/* Summary Bar */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row items-center justify-between sticky bottom-4 shadow-xl">
                    <div className="mb-4 md:mb-0">
                      <div className="text-sm text-gray-500">Ghế đã chọn:</div>
                      <div className="font-semibold text-gray-900">
                        {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Chưa chọn ghế'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Tổng cộng:</div>
                        <div className="text-xl font-bold text-blue-600">
                          {new Intl.NumberFormat('vi-VN').format(selectedSeats.length * trip.price)}đ
                        </div>
                      </div>
                      <button 
                        onClick={handleContinue}
                        disabled={selectedSeats.length === 0}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
                      >
                        Tiếp tục
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
