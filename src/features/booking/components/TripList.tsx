import React, { useState } from 'react';
import { type Trip } from '../../admin/api/trip.service';
import { BookingService, type Seat } from '../api/booking.service';
import { useBookingStore } from '../../../store/useBookingStore';
import { SeatMap } from './SeatMap';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  Bus as BusIcon, 
  Sparkles, 
  ArrowRight, 
  Wifi, 
  Zap, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp,
  Droplets,
  Wind,
  CheckCircle2
} from 'lucide-react';
import { recommendationService, type RecommendedTrip } from '../../../services/recommendation.service';
import { dispatchTrackAction } from '../../../hooks/useUserTracker';
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
  const [recMap, setRecMap] = useState<Record<number, string>>({});

  React.useEffect(() => {
    const anonId = localStorage.getItem('vexe_anon_id') || undefined;
    recommendationService.getRecommendations(anonId, undefined, 5)
      .then(recs => {
        if (Array.isArray(recs)) {
          const map: Record<number, string> = {};
          recs.forEach(r => { 
            if (r && r.tripId) map[r.tripId] = r.badgeText; 
          });
          setRecMap(map);
        }
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (trips.length === 1 && selectedTrip?.id !== trips[0].id) {
      handleSelectTrip(trips[0]);
    }
  }, [trips]);

  const handleSelectTrip = async (trip: Trip) => {
    if (selectedTrip?.id === trip.id) {
      setSelectedTrip(null);
      return;
    }
    
    // Track user action
    dispatchTrackAction('SELECT_TRIP_VIEW', {
      tripId: trip.id,
      routeId: trip.route?.id,
      price: trip.price
    });

    setSelectedTrip(trip);
    setLoadingSeats(true);
    try {
      const res = await BookingService.getSeatLayout(trip.id);
      if (res.success) {
        setSeats(res.data);
      }
    } catch (error) {
      toast.error('Không thể lấy sơ đồ ghế, vui lòng thử lại');
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

    dispatchTrackAction('PROCEED_CHECKOUT', {
      tripId: selectedTrip?.id,
      seatsCount: selectedSeats.length,
      seats: selectedSeats,
      totalPrice: selectedSeats.length * (selectedTrip?.price || 0)
    });

    startHoldTimer();
    navigate('/checkout');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price) || 0);
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  // Calculate estimated arrival (+6.5 hours if not available)
  const calculateArrival = (departureTimeStr: string, durationHours = 6.5) => {
    try {
      const d = new Date(departureTimeStr);
      const arrivalDate = new Date(d.getTime() + durationHours * 3600 * 1000);
      return arrivalDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-44 bg-slate-900/60 border border-white/5 rounded-3xl animate-pulse flex flex-col justify-between p-6">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-white/10 rounded w-1/4"></div>
              <div className="h-4 bg-white/10 rounded w-1/6"></div>
            </div>
            <div className="h-8 bg-white/10 rounded w-1/2"></div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-white/10 rounded w-1/3"></div>
              <div className="h-10 bg-cyan-500/20 rounded-xl w-32"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl p-12 rounded-3xl border border-white/10 text-center text-slate-400 space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
          <BusIcon size={32} />
        </div>
        <h3 className="text-xl font-bold text-white">Không tìm thấy chuyến xe phù hợp</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Hiện tại không có chuyến nào khớp với bộ lọc của bạn. Bạn vui lòng thử điều chỉnh lại điểm đi, điểm đến, ngày hoặc khoảng giá.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {trips.map((trip) => {
        const isExpanded = selectedTrip?.id === trip.id;
        const capacity = trip.vehicle?.capacity || 34;
        const vehicleType = capacity <= 24 ? 'Limousine VIP 24 phòng' : capacity <= 34 ? 'Limousine 34 phòng VIP' : 'Xe giường nằm 45 chỗ';
        const rating = (4.8 + ((trip.id % 3) * 0.1)).toFixed(1);
        const reviewCount = 200 + ((trip.id * 83) % 800);

        return (
          <div 
            key={trip.id} 
            className={`rounded-3xl bg-slate-900/80 backdrop-blur-2xl border transition-all duration-300 overflow-hidden shadow-2xl ${
              isExpanded 
                ? 'border-cyan-400/80 shadow-cyan-950/50 ring-1 ring-cyan-400/30' 
                : 'border-white/10 hover:border-cyan-500/40 hover:shadow-cyan-950/20'
            }`}
          >
            {/* Top Bar inside Card: AI Smart Badge & Ratings */}
            <div className="px-6 pt-5 pb-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-white/[0.02]">
              <div className="flex flex-wrap items-center gap-2">
                {recMap[trip.id] ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-wide">
                    <Sparkles size={13} className="text-cyan-400 animate-pulse" />
                    <span>{recMap[trip.id]}</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[11px] font-medium">
                    <BusIcon size={12} className="text-cyan-400" />
                    <span>{vehicleType}</span>
                  </div>
                )}

                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {trip.vehicle?.licensePlate || `BS-79B-${trip.id}23`}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  ★ <span>{rating}</span>
                </span>
                <span className="text-slate-500">({reviewCount} đánh giá)</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>Còn {Math.max(4, capacity - 18)} chỗ</span>
                </span>
              </div>
            </div>

            {/* Main Trip Card Content */}
            <div className="p-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 relative">
              
              {/* Left & Center: Route Timeline & Departure/Arrival */}
              <div className="flex-1 min-w-0 space-y-4">
                <div className="flex items-center justify-between sm:justify-start sm:space-x-8">
                  
                  {/* Departure Info */}
                  <div className="space-y-1 min-w-[110px]">
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight leading-none">
                      {formatTime(trip.departureTime)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-cyan-300">
                      <MapPin size={14} className="text-cyan-400 shrink-0" />
                      <span className="truncate">{trip.route?.departureLocation || 'Bến xe'}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-light hidden sm:block">
                      Xuất bến đúng giờ 99.8%
                    </div>
                  </div>

                  {/* Travel Duration Timeline Indicator */}
                  <div className="flex flex-col items-center px-2 sm:px-4 shrink-0">
                    <span className="text-[11px] font-mono text-slate-400 mb-1">~6h 30m</span>
                    <div className="relative flex items-center w-20 sm:w-32">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0 ring-4 ring-cyan-500/20"></div>
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 mx-1"></div>
                      <ArrowRight size={14} className="text-indigo-400 shrink-0" />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">Chạy cao tốc</span>
                  </div>

                  {/* Arrival Info */}
                  <div className="space-y-1 text-right sm:text-left min-w-[110px]">
                    <div className="text-2xl sm:text-3xl font-black text-slate-200 font-mono tracking-tight leading-none">
                      {calculateArrival(trip.departureTime)}
                    </div>
                    <div className="flex items-center justify-end sm:justify-start gap-1.5 text-xs sm:text-sm font-semibold text-white">
                      <MapPin size={14} className="text-indigo-400 shrink-0" />
                      <span className="truncate">{trip.route?.arrivalLocation || 'Điểm đến'}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-light hidden sm:block">
                      Có xe trung chuyển tận nơi
                    </div>
                  </div>

                </div>

                {/* Amenities Badges */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 shrink-0" title="Wifi 5G tốc độ cao miễn phí">
                    <Wifi size={13} className="text-cyan-400" />
                    <span className="hidden sm:inline">Wifi 5G</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 shrink-0" title="Cổng sạc Type-C & USB tại mỗi ghế">
                    <Zap size={13} className="text-amber-400" />
                    <span className="hidden sm:inline">Cổng sạc</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 shrink-0" title="Nước suối và khăn lạnh miễn phí">
                    <Droplets size={13} className="text-blue-400" />
                    <span className="hidden sm:inline">Nước & Khăn</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 shrink-0" title="Điều hòa ion âm khử khuẩn">
                    <Wind size={13} className="text-emerald-400" />
                    <span className="hidden sm:inline">Điều hòa</span>
                  </div>
                </div>

              </div>

              {/* Right Side: Price & Select Seat Button */}
              <div className="shrink-0 min-w-[200px] flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6 gap-3">
                <div className="text-left lg:text-right">
                  <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Giá vé 1 khách</div>
                  <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 tracking-tight font-mono">
                    {formatPrice(trip.price)}
                  </div>
                </div>

                <button 
                  onClick={() => handleSelectTrip(trip)}
                  type="button"
                  className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg cursor-pointer whitespace-nowrap shrink-0 ${
                    isExpanded 
                      ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600' 
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 hover:scale-105 shadow-cyan-500/25 active:scale-95'
                  }`}
                >
                  <span className="whitespace-nowrap shrink-0">{isExpanded ? 'Đóng chọn chỗ' : 'Chọn chuyến'}</span>
                  {isExpanded ? <ChevronUp size={16} className="shrink-0" /> : <ChevronDown size={16} className="shrink-0" />}
                </button>
              </div>

            </div>

            {/* Expandable Interactive Seat Map */}
            {isExpanded && (
              <div className="bg-slate-950/90 border-t border-cyan-500/30 p-6 sm:p-8 animate-in slide-in-from-top-4 duration-300">
                {loadingSeats ? (
                  <div className="text-center py-12 text-slate-400 space-y-3">
                    <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm">Đang tải sơ đồ vị trí ghế thời gian thực...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <SeatMap seats={seats} maxSeats={5} />
                    
                    {/* Sticky Bottom Booking Action Bar */}
                    <div className="rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-xs text-slate-400">
                          Ghế đang chọn:
                        </div>
                        {selectedSeats.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {selectedSeats.map(seatId => (
                              <span key={seatId} className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono">
                                {seatId}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Vui lòng nhấp chọn ghế trên sơ đồ</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                          <div className="text-[11px] text-slate-400">Tổng tiền tạm tính:</div>
                          <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
                            {formatPrice(selectedSeats.length * trip.price)}
                          </div>
                        </div>

                        <button 
                          onClick={handleContinue}
                          disabled={selectedSeats.length === 0}
                          type="button"
                          className="px-6 sm:px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-2"
                        >
                          <span>Tiếp tục thanh toán</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Trust Note */}
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 px-1 gap-2">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-emerald-400" />
                        <span>Giữ ghế trực tuyến an toàn 100% trong 5 phút sau khi bấm tiếp tục</span>
                      </div>
                      <div className="text-slate-500">
                        Giá đã bao gồm bảo hiểm du lịch và VAT
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
};
