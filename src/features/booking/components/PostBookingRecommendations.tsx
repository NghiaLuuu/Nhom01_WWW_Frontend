import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowLeftRight, 
  ArrowRight, 
  Bus, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Compass, 
  PhoneCall, 
  Tag, 
  Zap,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { recommendationService, type RecommendedTrip } from '../../../services/recommendation.service';
import { geolocationService } from '../../../services/geolocation.service';
import { useAuthStore } from '../../../store/useAuthStore';
import { dispatchTrackAction } from '../../../hooks/useUserTracker';

interface PostBookingRecommendationsProps {
  departureLocation?: string;
  arrivalLocation?: string;
  departureTime?: string;
}

export const PostBookingRecommendations: React.FC<PostBookingRecommendationsProps> = ({
  departureLocation = 'TP. Hồ Chí Minh',
  arrivalLocation = 'Đà Lạt',
  departureTime
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [recommendations, setRecommendations] = useState<RecommendedTrip[]>([]);
  const [loading, setLoading] = useState(true);

  // Return date suggestion (3 days later)
  const returnDate = React.useMemo(() => {
    try {
      const depDate = departureTime ? new Date(departureTime) : new Date();
      depDate.setDate(depDate.getDate() + 3);
      return depDate.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }, [departureTime]);

  useEffect(() => {
    let isMounted = true;
    const fetchNextTrips = async () => {
      try {
        setLoading(true);
        const anonId = localStorage.getItem('vexe_anon_id') || undefined;
        const loc = geolocationService.getStoredLocation();
        const city = loc?.city;
        const res = await recommendationService.getRecommendations(anonId, user?.id || undefined, 3, city);
        if (isMounted && Array.isArray(res)) {
          setRecommendations(res);
        }
      } catch (err) {
        console.error('Lỗi tải đề xuất sau đặt vé:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNextTrips();
    return () => { isMounted = false; };
  }, [user]);

  const formatPrice = (val?: number) => {
    if (!val) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + 
        ' - ' + d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="mt-12 space-y-8">
      
      {/* 1. Return Trip Callout */}
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6 sm:p-7 shadow-sm">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2.5 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-semibold font-mono">
              <Sparkles size={13} className="text-blue-400" />
              <span>ĐỀ XUẤT CHIỀU VỀ (RETURN TRIP)</span>
            </span>

            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Lên lịch chuyến về {arrivalLocation} → {departureLocation}
            </h3>

            {/* AI Rationale Box */}
            <div className="rounded-xl bg-slate-900 border border-slate-700 p-3 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-semibold text-cyan-400 mb-1 text-xs">
                <Sparkles size={13} className="text-cyan-400 shrink-0" />
                <span>Lý do gợi ý:</span>
              </div>
              <p className="text-slate-300 leading-relaxed pl-4">
                Dựa trên chu kỳ hành trình phổ biến 3 ngày, hệ thống gợi ý đặt vé về vào <strong className="text-white">{returnDate}</strong> từ {arrivalLocation} về {departureLocation} để đảm bảo vị trí phòng đẹp nhất và nhận ưu đãi giảm giá khứ hồi 10%.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              dispatchTrackAction('BOOK_RETURN_AFTER_SUCCESS', { from: arrivalLocation, to: departureLocation });
              navigate(`/search?departure=${encodeURIComponent(arrivalLocation)}&arrival=${encodeURIComponent(departureLocation)}&date=${returnDate}`);
            }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm whitespace-nowrap shrink-0"
          >
            <ArrowLeftRight size={15} />
            <span>Tìm vé chiều về ngay</span>
            <ArrowRight size={15} />
          </button>
        </div>

      </div>

      {/* 2. Destination Transit & Assistance Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Bus size={18} />
            <span>Xe trung chuyển miễn phí tại {arrivalLocation}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Nhà xe có xe trung chuyển tận nơi trong bán kính 7km tại bến đến. Hãy thông báo với tài xế hoặc tiếp viên trên xe để được sắp xếp xe trung chuyển chu đáo.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <PhoneCall size={18} />
            <span>Hỗ trợ khẩn cấp 24/7 & Giữ chỗ 100%</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Mọi thắc mắc về điểm đón trả, đổi giờ khởi hành hoặc hoãn vé, liên hệ hotline hỗ trợ 24/7: <strong className="text-cyan-300">1900 1234</strong> (miễn phí cước gọi).
          </p>
        </div>

      </div>

      {/* 3. Recommended Trips Carousel for Next Journey */}
      {recommendations.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-blue-400" />
              <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Các chuyến xe gợi ý cho hành trình tiếp theo
              </h4>
            </div>
            <span className="text-xs text-slate-400">Dựa theo sở thích di chuyển</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recommendations.map(trip => (
              <div 
                key={trip.tripId}
                className="p-4 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/25 text-[10px] font-semibold text-blue-300">
                      <Sparkles size={10} className="text-blue-400" />
                      <span>GỢI Ý</span>
                    </div>
                    <span className="font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                      Khớp {(trip.matchScore * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
                    <span className="text-cyan-400">{trip.departureLocation}</span>
                    <ArrowRight size={13} className="text-slate-500 shrink-0" />
                    <span>{trip.arrivalLocation}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-2">
                    <Clock size={12} className="text-slate-500" />
                    <span>{formatTime(trip.departureTime)}</span>
                  </div>

                  {/* AI Rationale Box */}
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-300 mt-2 mb-2">
                    <span className="font-semibold text-cyan-400 block mb-0.5">Lý do gợi ý:</span>
                    <span className="text-slate-300 leading-relaxed">
                      {trip.reason || trip.badgeText || 'Chuyến xe được tính toán phù hợp với sở thích tuyến đường và khung giờ của bạn.'}
                    </span>
                  </div>

                  <div className="text-[10px] text-emerald-400 font-medium">
                    Còn {trip.availableSeats} chỗ trống
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700 flex items-center justify-between gap-2">
                  <div className="text-base font-bold text-white font-mono">
                    {formatPrice(trip.price)}
                  </div>

                  <button
                    onClick={() => {
                      dispatchTrackAction('SELECT_NEXT_JOURNEY_RECOMMENDED_TRIP', { tripId: trip.tripId });
                      navigate(`/search?departure=${encodeURIComponent(trip.departureLocation)}&arrival=${encodeURIComponent(trip.arrivalLocation)}`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Xem chuyến</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
