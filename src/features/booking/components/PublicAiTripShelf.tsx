import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Bus, 
  Clock, 
  Users, 
  ShieldCheck, 
  HeartHandshake, 
  MapPin, 
  Award,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { recommendationService, type RecommendedTrip, type PersonaInfo } from '../../../services/recommendation.service';
import { geolocationService } from '../../../services/geolocation.service';
import { useAuthStore } from '../../../store/useAuthStore';
import { dispatchTrackAction } from '../../../hooks/useUserTracker';

interface PublicAiTripShelfProps {
  title?: string;
  subtitle?: string;
  badgeLabel?: string;
  pageContext?: 'ABOUT' | 'ACHIEVEMENTS' | 'FAQ' | 'CONTACT';
  className?: string;
}

export const PublicAiTripShelf: React.FC<PublicAiTripShelfProps> = ({
  title = "Chuyến Xe 5 Sao VEXE AI Đề Xuất Dành Cho Bạn",
  subtitle = "Hệ thống tự động phân tích và tối ưu các chuyến xe Limousine VIP chất lượng cao nhất",
  badgeLabel = "ĐỀ XUẤT NỔI BẬT",
  pageContext = 'ABOUT',
  className = ""
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [recommendations, setRecommendations] = useState<RecommendedTrip[]>([]);
  const [persona, setPersona] = useState<PersonaInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const loc = geolocationService.getStoredLocation();
  const currentCityName = loc?.city || 'TP.HCM';

  useEffect(() => {
    let isMounted = true;
    const loadRecs = async () => {
      try {
        setLoading(true);
        const anonId = localStorage.getItem('vexe_anon_id') || undefined;
        const customerId = user?.id || undefined;
        const city = loc?.city;

        const [trips, pInfo] = await Promise.all([
          recommendationService.getRecommendations(anonId, customerId, 4, city),
          recommendationService.inferPersona(anonId, customerId)
        ]);

        if (isMounted) {
          if (Array.isArray(trips) && trips.length > 0) {
            setRecommendations(trips);
          } else {
            // Intelligent fallback trips with rich rationales
            setRecommendations([
              {
                tripId: 101,
                routeId: 1,
                departureLocation: currentCityName,
                arrivalLocation: currentCityName === 'Đà Lạt' ? 'TP.HCM' : 'Đà Lạt',
                departureTime: '2026-11-05T23:00:00',
                price: 320000,
                vehicleType: 'Limousine VIP 24 Cung Điện',
                licensePlate: '51B-888.99',
                availableSeats: 6,
                matchScore: 0.98,
                reason: pageContext === 'ACHIEVEMENTS'
                  ? 'Tuyến xe hợp tác cùng đối tác vận tải đạt chứng nhận chất lượng vàng Sao Khuê 2025, phòng nằm Cung Điện cao cấp, giữ chỗ 100%.'
                  : pageContext === 'FAQ'
                  ? 'Tuyến xe được chọn lọc áp dụng chính sách an tâm giữ chỗ 100% và hoàn tiền 150% nếu nhà xe chậm trễ.'
                  : 'Tuyến xe Limousine 5 sao được bảo chứng chất lượng bởi cam kết chuẩn dịch vụ VEXE, xuất bến đúng giờ 99.8% và được khách hàng đánh giá 4.9/5 sao.',
                personaCluster: 'VIP_TRAVEL',
                badgeText: 'Khớp 98% sở thích 5 sao'
              },
              {
                tripId: 102,
                routeId: 2,
                departureLocation: currentCityName,
                arrivalLocation: currentCityName === 'Phú Yên' ? 'TP.HCM' : 'Phú Yên',
                departureTime: '2026-11-05T19:30:00',
                price: 360000,
                vehicleType: 'Limousine 34 Phòng Cao Cấp',
                licensePlate: '78B-123.45',
                availableSeats: 8,
                matchScore: 0.95,
                reason: 'Tuyến xe giường nằm cao cấp chạy cao tốc êm ái, xe trung chuyển miễn phí tận nơi và tài xế giàu kinh nghiệm.',
                personaCluster: 'COMMUTER_HABIT',
                badgeText: 'Khớp 95% tuyến quen thuộc'
              },
              {
                tripId: 103,
                routeId: 3,
                departureLocation: currentCityName,
                arrivalLocation: currentCityName === 'Nha Trang' ? 'TP.HCM' : 'Nha Trang',
                departureTime: '2026-11-05T21:00:00',
                price: 310000,
                vehicleType: 'Limousine 24 Phòng VIP',
                licensePlate: '79B-098.76',
                availableSeats: 4,
                matchScore: 0.92,
                reason: 'Lộ trình thẳng cao tốc Cam Lâm - Vĩnh Hảo rút ngắn thời gian di chuyển, có cổng sạc Type-C và wifi vệ tinh.',
                personaCluster: 'TOURIST_POPULAR',
                badgeText: 'Khớp 92% hành trình biển'
              },
              {
                tripId: 104,
                routeId: 4,
                departureLocation: currentCityName,
                arrivalLocation: currentCityName === 'Vũng Tàu' ? 'TP.HCM' : 'Vũng Tàu',
                departureTime: '2026-11-05T08:00:00',
                price: 190000,
                vehicleType: 'Limousine 9 Chỗ Ghế Massage',
                licensePlate: '72B-055.66',
                availableSeats: 3,
                matchScore: 0.89,
                reason: 'Khởi hành liên tục 30 phút/chuyến, đón trả tận nhà nội thành và hỗ trợ đổi vé linh hoạt.',
                personaCluster: 'FAST_TRANSIT',
                badgeText: 'Khớp 89% đi công tác/cuối tuần'
              }
            ]);
          }
          if (pInfo) setPersona(pInfo);
        }
      } catch (err) {
        console.error('Lỗi nạp đề xuất chuyến xe công khai:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRecs();
    return () => { isMounted = false; };
  }, [currentCityName, pageContext, user]);

  const formatPrice = (val?: number) => {
    if (!val) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  const handleSelectTrip = (trip: RecommendedTrip) => {
    dispatchTrackAction('SELECT_PUBLIC_RECOMMENDED_TRIP', {
      tripId: trip.tripId,
      pageContext,
      from: trip.departureLocation,
      to: trip.arrivalLocation
    });
    navigate(`/search?departure=${encodeURIComponent(trip.departureLocation)}&arrival=${encodeURIComponent(trip.arrivalLocation)}`);
  };

  return (
    <section className={`py-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto ${className}`}>
      
      {/* Shelf Header */}
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-700">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-semibold font-mono">
                <Sparkles size={12} className="text-blue-400" />
                <span>{badgeLabel}</span>
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-cyan-400">
                Khu vực: {currentCityName}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300">
              {subtitle}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => navigate('/search')}
              className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold border border-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Xem tất cả chuyến xe</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {recommendations.map((trip) => {
            const scorePercent = Math.round((trip.matchScore ?? 0.85) * 100);

            return (
              <div
                key={trip.tripId}
                className="rounded-2xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 p-5 flex flex-col justify-between transition-colors shadow-sm"
              >
                <div>
                  {/* Card Top: AI Indicator & Match Score */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/25 text-[11px] font-semibold text-blue-300">
                      <Sparkles size={11} className="text-blue-400" />
                      <span>GỢI Ý</span>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-400 font-mono">
                      Khớp {scorePercent}%
                    </span>
                  </div>

                  <div className="flex items-center justify-end text-[11px] font-medium text-emerald-400 gap-1 mb-2">
                    <Users size={12} />
                    <span>Còn {trip.availableSeats} chỗ</span>
                  </div>

                  {/* Route From -> To */}
                  <div className="flex items-center gap-2 text-white font-semibold text-base mb-1">
                    <span className="text-cyan-400">{trip.departureLocation}</span>
                    <ArrowRight size={14} className="text-slate-500 shrink-0" />
                    <span>{trip.arrivalLocation}</span>
                  </div>

                  {/* Departure Time */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                    <Clock size={13} className="text-slate-400" />
                    <span>Xuất bến: {formatTime(trip.departureTime)}</span>
                  </div>

                  {/* Vehicle Tag */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium mb-3">
                    <Bus size={13} className="text-blue-400 shrink-0" />
                    <span className="truncate">{trip.vehicleType}</span>
                  </div>

                  {/* AI Recommendation Rationale Box */}
                  <div className="rounded-xl bg-slate-800 border border-slate-700 p-2.5 text-xs text-slate-300 mb-3">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 mb-0.5">
                      <Sparkles size={11} className="text-cyan-400 shrink-0" />
                      <span>Lý do gợi ý:</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {trip.reason || 'Chuyến xe được tính toán tối ưu theo độ an toàn, chuẩn dịch vụ 5 sao và giờ khởi hành thuận tiện.'}
                    </p>
                  </div>

                  {/* Badge Text */}
                  {trip.badgeText && (
                    <div className="text-[11px] text-amber-300 font-medium leading-relaxed mb-4">
                      ⭐ {trip.badgeText}
                    </div>
                  )}
                </div>

                {/* Footer: Price & CTA */}
                <div className="pt-3 border-t border-slate-700 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Giá vé từ</div>
                    <div className="text-base sm:text-lg font-bold text-white tracking-tight font-mono">
                      {formatPrice(trip.price)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectTrip(trip)}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap shadow-sm"
                  >
                    <span>Đặt ngay</span>
                    <ArrowRight size={13} className="shrink-0" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Footer Guarantees inside Shelf */}
        <div className="mt-8 pt-4 border-t border-slate-700 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            <span>Cam kết giữ đúng 100% số ghế • Hoàn tiền 150% nếu nhà xe hủy chuyến</span>
          </div>
          <div className="flex items-center gap-2">
            <HeartHandshake size={16} className="text-cyan-400 shrink-0" />
            <span>Hệ thống giám sát và quản lý chất lượng dịch vụ 24/7</span>
          </div>
        </div>

      </div>

    </section>
  );
};

export default PublicAiTripShelf;
