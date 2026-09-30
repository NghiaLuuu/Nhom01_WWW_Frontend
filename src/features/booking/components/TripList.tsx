import React, { useState } from 'react';
import { type Trip } from '../../admin/api/trip.service';
import { BookingService } from '../api/booking.service';
import type { SeatItem } from '../types/booking.types';
import { useBookingStore } from '../../../store/useBookingStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { SeatMap } from './SeatMap';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Bus as BusIcon, ShieldAlert, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

interface TripListProps {
  trips: Trip[];
  isLoading: boolean;
}

export const TripList: React.FC<TripListProps> = ({ trips, isLoading }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { selectedTrip, setSelectedTrip, selectedSeats, setCurrentBooking } = useBookingStore();
  const [seats, setSeats] = useState<SeatItem[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  React.useEffect(() => {
    if (trips.length === 1 && selectedTrip?.id !== trips[0].id) {
      handleSelectTrip(trips[0]);
    }
  }, [trips]);

  const handleSelectTrip = async (trip: Trip) => {
    if (selectedTrip?.id === trip.id) {
      setSelectedTrip(null);
      setSeats([]);
      return;
    }
    
    setSelectedTrip(trip);
    setLoadingSeats(true);
    try {
      // 1. Fetch real seats for this vehicle
      let vehicleSeats: SeatItem[] = [];
      try {
        if (trip.vehicle?.id) {
          const resSeats = await BookingService.getSeatsByVehicle(trip.vehicle.id);
          if (resSeats.success && Array.isArray(resSeats.data) && resSeats.data.length > 0) {
            vehicleSeats = resSeats.data;
          }
        }
      } catch (err) {
        console.warn('Could not fetch vehicle seats, creating fallback:', err);
      }

      // If vehicle has no initialized seats, create virtual list based on capacity
      if (vehicleSeats.length === 0) {
        const cap = trip.vehicle?.capacity || 36;
        const half = Math.ceil(cap / 2);
        vehicleSeats = Array.from({ length: cap }, (_, i) => ({
          id: i + 1,
          seatName: i < half ? `A${(i + 1).toString().padStart(2, '0')}` : `B${(i - half + 1).toString().padStart(2, '0')}`,
          floor: i < half ? 1 : 2,
        }));
      }

      // 2. Fetch occupied seat IDs for this trip
      let occupiedIds: number[] = [];
      try {
        const resOccupied = await BookingService.getOccupiedSeats(trip.id);
        if (resOccupied.success && Array.isArray(resOccupied.data)) {
          occupiedIds = resOccupied.data;
        }
      } catch (err) {
        console.warn('Could not fetch occupied seats:', err);
      }

      // 3. Mark occupied status
      const mappedSeats = vehicleSeats.map(seat => ({
        ...seat,
        isBooked: occupiedIds.includes(seat.id)
      }));

      setSeats(mappedSeats);
    } catch (error) {
      toast.error('Không thể lấy sơ đồ ghế. Vui lòng thử lại!');
      setSelectedTrip(null);
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleContinue = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 chỗ ngồi');
      return;
    }

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!selectedTrip) return;

    setIsHolding(true);
    const toastId = toast.loading('Đang giữ chỗ tạm thời trong 5 phút...');

    try {
      const res = await BookingService.createBooking({
        tripId: selectedTrip.id,
        seatIds: selectedSeats.map(s => s.id)
      });

      if (res.success && res.data) {
        toast.success('Đã giữ chỗ thành công trong 5 phút!', { id: toastId });
        setCurrentBooking(res.data);
        navigate('/checkout', { state: { booking: res.data } });
      } else {
        toast.error(res.message || 'Không thể giữ chỗ. Vui lòng chọn ghế khác!', { id: toastId });
      }
    } catch (err: any) {
      console.error('Booking creation error:', err);
      if (err.response?.status === 401) {
        useAuthStore.getState().logout();
        toast.error('Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục!', { id: toastId });
        setShowLoginModal(true);
      } else {
        const msg = err.response?.data?.message || 'Ghế đã có người chọn hoặc không thể giữ chỗ lúc này.';
        toast.error(msg, { id: toastId });
      }
      // Refresh seat layout
      if (selectedTrip) {
        handleSelectTrip(selectedTrip);
      }
    } finally {
      setIsHolding(false);
    }
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
        <p className="text-lg font-semibold text-gray-800">Không tìm thấy chuyến xe nào phù hợp.</p>
        <p className="text-sm text-gray-500 mt-1">Vui lòng thử thay đổi điểm đi, điểm đến hoặc ngày khởi hành khác.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {trips.map((trip) => {
        const isSelected = selectedTrip?.id === trip.id;
        return (
          <div 
            key={trip.id} 
            className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-sm ${
              isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200 hover:shadow-md'
            }`}
          >
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-3 text-lg font-extrabold text-gray-900">
                  <Clock className="text-blue-600" size={24} />
                  <span>{new Date(trip.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-gray-300 font-normal mx-2">•</span>
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full text-xs font-bold">
                    {trip.vehicle?.type || 'Xe giường nằm'} ({trip.vehicle?.capacity || 36} chỗ)
                  </span>
                  <span className="text-gray-500 text-xs font-mono font-medium">
                    {trip.vehicle?.licensePlate}
                  </span>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-100"></div>
                    <div className="w-0.5 h-10 bg-gray-300 my-1"></div>
                    <div className="w-3 h-3 rounded-full border-2 border-red-500 bg-white"></div>
                  </div>
                  <div className="space-y-4 text-sm font-medium text-gray-700">
                    <div>
                      <span className="text-xs text-gray-400 block">Điểm đi</span>
                      <strong className="text-gray-900 font-bold">{trip.route?.departureLocation}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">Điểm đến</span>
                      <strong className="text-gray-900 font-bold">{trip.route?.arrivalLocation}</strong>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                <div className="text-2xl font-black text-blue-600 mb-4">
                  {new Intl.NumberFormat('vi-VN').format(trip.price)}₫
                  <span className="text-xs text-gray-400 font-normal block text-right">/ vé</span>
                </div>
                <button 
                  onClick={() => handleSelectTrip(trip)}
                  className={`w-full px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${
                    isSelected 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20'
                  }`}
                >
                  {isSelected ? 'Đóng sơ đồ ghế' : 'Chọn chuyến này'}
                </button>
              </div>
            </div>

            {/* Seat Map Expansion */}
            {isSelected && (
              <div className="bg-gray-50/80 p-6 border-t border-gray-200 animate-in slide-in-from-top-4 duration-300">
                {loadingSeats ? (
                  <div className="text-center py-12 text-gray-500 animate-pulse space-y-2">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-medium">Đang tải sơ đồ ghế thời gian thực...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <SeatMap seats={seats} maxSeats={5} />
                    
                    {/* Summary Bar */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row items-center justify-between sticky bottom-4 shadow-xl">
                      <div className="mb-4 md:mb-0">
                        <div className="text-xs text-gray-500 font-medium">Ghế đã chọn ({selectedSeats.length}/5):</div>
                        <div className="font-extrabold text-blue-600 text-base">
                          {selectedSeats.length > 0 ? selectedSeats.map(s => s.seatName).join(', ') : 'Chưa chọn chỗ nào'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-xs text-gray-500 font-medium">Tổng tiền giữ chỗ:</div>
                          <div className="text-2xl font-black text-gray-900">
                            {new Intl.NumberFormat('vi-VN').format(selectedSeats.length * trip.price)}₫
                          </div>
                        </div>
                        <button 
                          onClick={handleContinue}
                          disabled={selectedSeats.length === 0 || isHolding}
                          className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center space-x-2"
                        >
                          <span>{isHolding ? 'Đang giữ chỗ...' : 'Tiếp tục đặt vé'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Login Prompt Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <LogIn size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900">Yêu cầu đăng nhập</h3>
              <p className="text-xs text-gray-500">
                Vui lòng đăng nhập để hệ thống tiến hành giữ chỗ và tạo vé điện tử mang tên bạn.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button 
                onClick={() => navigate('/login', { state: { from: '/search' } })}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-600/20"
              >
                Đăng nhập ngay
              </button>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
              >
                Để sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

