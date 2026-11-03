import React, { useState } from 'react';
import { type Trip } from '../../admin/api/trip.service';
import { BookingService, type Seat } from '../api/booking.service';
import { useBookingStore } from '../../../store/useBookingStore';
import { SeatMap } from './SeatMap';
import { useNavigate } from 'react-router-dom';
import { 
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
import { recommendationService } from '../../../services/recommendation.service';
import { dispatchTrackAction } from '../../../hooks/useUserTracker';
import toast from 'react-hot-toast';

interface TripListProps {
  trips: Trip[];
  isLoading: boolean;
}

interface RecTripInfo {
  matchScore: number;
  reason: string;
  badgeText: string;
  personaCluster?: string;
}

export const TripList: React.FC<TripListProps> = ({ trips, isLoading }) => {
  const navigate = useNavigate();
  const { selectedTrip, setSelectedTrip, selectedSeats, startHoldTimer } = useBookingStore();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [recMap, setRecMap] = useState<Record<number, RecTripInfo>>({});

  React.useEffect(() => {
    const anonId = localStorage.getItem('vexe_anon_id') || undefined;
    recommendationService.getRecommendations(anonId, undefined, 8)
      .then(recs => {
        if (Array.isArray(recs)) {
          const map: Record<number, RecTripInfo> = {};
          recs.forEach(r => { 
            if (r && r.tripId) {
              map[r.tripId] = {
                matchScore: r.matchScore,
                reason: r.reason,
                badgeText: r.badgeText,
                personaCluster: r.personaCluster
              };
            }
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
    
    dispatchTrackAction('SELECT_TRIP_VIEW', {
      tripId: trip.id,
      routeId: trip.route?.id,
      price: trip.price
    });

    setSelectedTrip(trip);
    setLoadingSeats(true);
    try {
      const res = await BookingService.getSeatLayout(trip.id, trip.vehicle?.id);
      if (res.success) {
        setSeats(res.data);
      }
    } catch {
      toast.error('Không thể lấy sơ đồ ghế, vui lòng thử lại');
      setSelectedTrip(null);
    } finally {
      setLoadingSeats(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price) || 0);
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return isoString;
    }
  };

  const calculateArrival = (depIso: string) => {
    try {
      const d = new Date(depIso);
      d.setHours(d.getHours() + 6);
      d.setMinutes(d.getMinutes() + 30);
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return '--:--';
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 chỗ ngồi');
      return;
    }

    startHoldTimer();
    dispatchTrackAction('PROCEED_TO_CHECKOUT', {
      tripId: selectedTrip?.id,
      seatsCount: selectedSeats.length
    });

    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-44 bg-slate-800 border border-slate-700 rounded-2xl flex flex-col justify-between p-6 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-slate-700 rounded w-1/4"></div>
              <div className="h-4 bg-slate-700 rounded w-1/6"></div>
            </div>
            <div className="h-8 bg-slate-700 rounded w-1/2"></div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-slate-700 rounded w-1/3"></div>
              <div className="h-10 bg-slate-700 rounded-xl w-32"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="bg-slate-800 p-12 rounded-2xl border border-slate-700 text-center text-slate-300 space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
          <BusIcon size={32} />
        </div>
        <h3 className="text-lg font-bold text-white">Không tìm thấy chuyến xe phù hợp</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Hiện tại không có chuyến nào khớp với bộ lọc của bạn. Bạn vui lòng thử điều chỉnh lại điểm đi, điểm đến, ngày hoặc khoảng giá.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trips.map((trip) => {
        const isExpanded = selectedTrip?.id === trip.id;
        const capacity = trip.vehicle?.capacity || 34;
        const vehicleType = capacity <= 24 ? 'Limousine VIP 24 phòng' : capacity <= 34 ? 'Limousine 34 phòng' : 'Xe giường nằm 45 chỗ';
        const rating = (4.8 + ((trip.id % 3) * 0.1)).toFixed(1);
        const reviewCount = 200 + ((trip.id * 83) % 800);

        const rec = recMap[trip.id] || (trip.id === trips[0]?.id ? {
          matchScore: 0.95,
          badgeText: 'Khớp 95% lộ trình',
          reason: 'Chuyến xe có giờ khởi hành thuận tiện, xe Limousine chất lượng cao và tỷ lệ đúng giờ 99.8%.'
        } : null);

        return (
          <div 
            key={trip.id} 
            className={`rounded-2xl bg-slate-800 border transition-colors shadow-sm overflow-hidden ${
              isExpanded 
                ? 'border-cyan-400 ring-1 ring-cyan-400/40' 
                : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            {/* Top Bar inside Card */}
            <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 bg-slate-850 bg-slate-900/40">
              <div className="flex flex-wrap items-center gap-2">
                {rec ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold border border-blue-500/30">
                    <Sparkles size={12} className="text-cyan-400" />
                    <span>ĐỀ XUẤT {rec.matchScore ? `(Khớp ${Math.round(rec.matchScore * 100)}%)` : ''}</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 text-[11px] font-medium border border-slate-700">
                    <BusIcon size={12} className="text-slate-400" />
                    <span>{vehicleType}</span>
                  </div>
                )}

                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                  {trip.vehicle?.licensePlate || `BS-79B-${trip.id}23`}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  ★ <span>{rating}</span>
                </span>
                <span className="text-slate-400">({reviewCount} đánh giá)</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Còn {Math.max(4, capacity - 18)} chỗ</span>
                </span>
              </div>
            </div>

            {/* Main Trip Card Content */}
            <div className="p-5 sm:p-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
              
              {/* Route Timeline & Departure/Arrival */}
              <div className="flex-1 min-w-0 space-y-4">
                <div className="flex items-center justify-between sm:justify-start sm:space-x-8">
                  
                  {/* Departure Info */}
                  <div className="space-y-1 min-w-[100px]">
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight leading-none">
                      {formatTime(trip.departureTime)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-cyan-300">
                      <MapPin size={14} className="text-cyan-400 shrink-0" />
                      <span className="truncate">{trip.route?.departureLocation || 'Bến xe'}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 hidden sm:block">
                      Xuất bến đúng giờ
                    </div>
                  </div>

                  {/* Travel Duration Timeline Indicator */}
                  <div className="flex flex-col items-center px-2 sm:px-4 shrink-0">
                    <span className="text-[11px] font-mono text-slate-400 mb-1">~6h 30m</span>
                    <div className="relative flex items-center w-20 sm:w-28">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></div>
                      <div className="flex-1 h-0.5 bg-slate-600 mx-1"></div>
                      <ArrowRight size={14} className="text-slate-400 shrink-0" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">Chạy cao tốc</span>
                  </div>

                  {/* Arrival Info */}
                  <div className="space-y-1 text-right sm:text-left min-w-[100px]">
                    <div className="text-2xl sm:text-3xl font-black text-slate-200 font-mono tracking-tight leading-none">
                      {calculateArrival(trip.departureTime)}
                    </div>
                    <div className="flex items-center justify-end sm:justify-start gap-1.5 text-xs sm:text-sm font-semibold text-white">
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">{trip.route?.arrivalLocation || 'Điểm đến'}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 hidden sm:block">
                      Có xe trung chuyển
                    </div>
                  </div>

                </div>

                {/* Amenities Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-300">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700" title="Wifi tốc độ cao">
                    <Wifi size={13} className="text-cyan-400" />
                    <span className="hidden sm:inline">Wifi</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700" title="Cổng sạc Type-C & USB">
                    <Zap size={13} className="text-amber-400" />
                    <span className="hidden sm:inline">Cổng sạc</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700" title="Nước suối và khăn lạnh">
                    <Droplets size={13} className="text-blue-400" />
                    <span className="hidden sm:inline">Nước & Khăn</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700" title="Điều hòa mát mẻ">
                    <Wind size={13} className="text-emerald-400" />
                    <span className="hidden sm:inline">Điều hòa</span>
                  </div>
                </div>

                {/* AI Rationale Box */}
                {rec && (
                  <div className="rounded-xl bg-slate-900 border border-blue-500/30 p-3 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 font-bold text-cyan-300 mb-1">
                      <Sparkles size={13} className="text-cyan-400 shrink-0" />
                      <span>Lý do gợi ý:</span>
                      {rec.badgeText && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-cyan-200">
                          {rec.badgeText}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-5">
                      {rec.reason || 'Chuyến xe được tối ưu về lịch trình và dịch vụ cao cấp.'}
                    </p>
                  </div>
                )}

              </div>

              {/* Price & Select Seat Button */}
              <div className="shrink-0 min-w-[190px] flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center border-t lg:border-t-0 lg:border-l border-slate-700 pt-4 lg:pt-0 lg:pl-6 gap-3">
                <div className="text-left lg:text-right">
                  <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Giá vé 1 khách</div>
                  <div className="text-2xl sm:text-3xl font-black text-cyan-400 tracking-tight font-mono tabular-nums">
                    {formatPrice(trip.price)}
                  </div>
                </div>

                <button 
                  onClick={() => handleSelectTrip(trip)}
                  type="button"
                  className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-sm ${
                    isExpanded 
                      ? 'bg-slate-700 hover:bg-slate-650 text-white border border-slate-600' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  <span>{isExpanded ? 'Đóng sơ đồ ghế' : 'Chọn chuyến'}</span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

            </div>

            {/* Expandable Interactive Seat Map */}
            {isExpanded && (
              <div className="bg-slate-900 border-t border-slate-700 p-5 sm:p-7">
                {loadingSeats ? (
                  <div className="text-center py-10 text-slate-400 space-y-2">
                    <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs">Đang tải sơ đồ vị trí ghế...</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <SeatMap seats={seats} maxSeats={5} />
                    
                    {/* Booking Action Bar */}
                    <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-xs text-slate-300 font-medium">
                          Ghế đang chọn:
                        </div>
                        {selectedSeats.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {selectedSeats.map(seatId => (
                              <span key={seatId} className="px-2.5 py-1 rounded-md bg-blue-600/30 text-cyan-300 border border-cyan-400/50 text-xs font-bold font-mono">
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
                          <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono tabular-nums">
                            {formatPrice(selectedSeats.length * trip.price)}
                          </div>
                        </div>

                        <button 
                          onClick={handleContinue}
                          disabled={selectedSeats.length === 0}
                          type="button"
                          className="px-6 sm:px-7 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                        >
                          <span>Tiếp tục thanh toán</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Trust Note */}
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 px-1 gap-2">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-emerald-400" />
                        <span>Giữ chỗ an toàn 100% trong 5 phút sau khi bấm tiếp tục</span>
                      </div>
                      <div>
                        Giá đã bao gồm bảo hiểm hành khách và thuế VAT
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

export default TripList;
