import React, { useState } from 'react';
import { type Trip } from '../../admin/api/trip.service';
import { BookingService } from '../api/booking.service';
import type { SeatItem } from '../types/booking.types';
import { useBookingStore } from '../../../store/useBookingStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { SeatMap } from './SeatMap';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Bus as BusIcon, ShieldAlert, LogIn, Calendar } from 'lucide-react';
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
    if (trips.length === 1 && trips[0].webBookingOpen !== false && selectedTrip?.id !== trips[0].id) {
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
        const totalSeats = trip.vehicle?.capacity ?? 45;
        const availableSeats = Math.max(0, Math.min(totalSeats, trip.availableSeats ?? totalSeats));
        const isWebBookingOpen = trip.webBookingOpen !== false;
        const badgeColor = availableSeats > 5
          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
          : availableSeats > 0
            ? 'text-amber-700 bg-amber-50 border-amber-200'
            : 'text-rose-700 bg-rose-50 border-rose-200';

        // Departure & estimated arrival calculations
        const depDate = new Date(trip.departureTime);
        const durationMin = trip.route?.durationMinutes || trip.route?.duration || 120;
        const arrDate = new Date(depDate.getTime() + durationMin * 60 * 1000);

        const depTimeStr = depDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const depDateStr = depDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const arrTimeStr = arrDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const arrDateStr = arrDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const hours = Math.floor(durationMin / 60);
        const mins = durationMin % 60;
        const durationText = hours > 0 
          ? (mins > 0 ? `${hours}h${mins}m` : `${hours} giờ`) 
          : `${mins} phút`;

        return (
          <div 
            key={trip.id} 
            className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-sm ${
              isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200 hover:shadow-md'
            }`}
          >
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1 space-y-4">
                {/* Header row: Departure Time -> Arrival Time, Departure Date, Vehicle Type, License Plate */}
                <div className="flex flex-wrap items-center gap-2.5 text-base font-extrabold text-gray-900">
                  <div className="flex items-center space-x-1.5 text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-xl border border-blue-100">
                    <Clock size={16} />
                    <span className="text-lg font-black tracking-tight">{depTimeStr}</span>
                    <span className="text-gray-400 font-normal text-xs">→</span>
                    <span className="text-lg font-black tracking-tight text-gray-800">{arrTimeStr}</span>
                  </div>

                  <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-700 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-xl">
                    <Calendar size={13} className="text-gray-500" />
                    <span>Ngày xuất hành: {depDateStr}</span>
                  </span>

                  <span className="text-gray-300 font-normal hidden sm:inline">•</span>

                  <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${badgeColor}`}>
                    {trip.vehicle?.type || 'Ghế ngồi'} ({availableSeats}/{totalSeats} chỗ)
                  </span>

                  <span className="text-gray-400 text-xs font-mono font-medium ml-auto sm:ml-0">
                    {trip.vehicle?.licensePlate}
                  </span>
                </div>
                
                {/* Journey Timeline */}
                <div className="flex items-start space-x-3.5 pt-1">
                  <div className="flex flex-col items-center pt-1.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-blue-100 shrink-0"></div>
                    <div className="w-0.5 h-12 bg-gradient-to-b from-blue-500 via-gray-300 to-emerald-500 my-1"></div>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-600 bg-white shrink-0"></div>
                  </div>
                  <div className="space-y-3.5 text-sm flex-1">
                    {/* Departure point */}
                    <div>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Điểm đi</span>
                        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          Xuất hành: <strong className="font-bold">{depTimeStr}</strong> • {depDateStr}
                        </span>
                      </div>
                      <strong className="text-base text-gray-900 font-extrabold block mt-0.5">
                        {trip.route?.departureLocation}
                      </strong>
                    </div>

                    {/* Arrival point */}
                    <div>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Điểm đến</span>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          Dự kiến đến: <strong className="font-bold">{arrTimeStr}</strong> • {arrDateStr} (~{durationText})
                        </span>
                      </div>
                      <strong className="text-base text-gray-900 font-extrabold block mt-0.5">
                        {trip.route?.arrivalLocation}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                <div className="flex items-baseline space-x-1.5 mb-4">
                  <span className="text-2xl font-black text-blue-600">
                    {new Intl.NumberFormat('vi-VN').format(trip.price)}₫
                  </span>
                  <span className="text-xs text-gray-400 font-semibold whitespace-nowrap">/ vé</span>
                </div>
                <button 
                  onClick={() => handleSelectTrip(trip)}
                  disabled={!isWebBookingOpen}
                  className={`w-full px-6 py-2.5 rounded-xl font-bold transition-all text-sm disabled:cursor-not-allowed ${
                    isSelected 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : isWebBookingOpen
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isSelected ? 'Đóng sơ đồ ghế' : isWebBookingOpen ? 'Chọn chuyến này' : availableSeats === 0 ? 'Đã hết chỗ' : 'Đã đóng bán vé web'}
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

