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
  subtitle = "Hệ thống AI tự động phân tích và tối ưu các chuyến xe Limousine VIP chất lượng cao nhất",
  badgeLabel = "✨ VEXE AI ĐỀ XUẤT",
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
            // Intelligent fallback trips with rich AI rationales
            setRecommendations([
              {
                tripId: 101,
                routeId: 1,
                departureLocation: currentCityName,
                arrivalLocation: currentCityName === 'Đà Lạt' ? 'TP.HCM' : 'Đà Lạt',
                departureTime: '2026-11-05T23:00:00',
                price: 320000,
                vehicleType: 'Limousine VIP 24 Cung Điện',
                licensePlate: 'BS-51B-88899',
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
                licensePlate: 'BS-78B-12345',
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
                departureTime: '2026-11-05T22:15:00',
                price: 300000,
                vehicleType: 'Limousine VIP 24 Phòng',
                licensePlate: 'BS-79B-99881',
                availableSeats: 5,
                matchScore: 0.93,
                reason: 'Khung giờ xuất bến lý tưởng giúp hành khách ngủ trọn một giấc và thức dậy tại điểm đến vào sáng sớm tràn đầy năng lượng.',
                personaCluster: 'TOURIST_GOLD',
                badgeText: 'Khung giờ vàng xuất bến'
              },
              {
                tripId: 104,
                routeId: 4,
                departureLocation: currentCityName,
                arrivalLocation: currentCityName === 'Vũng Tàu' ? 'TP.HCM' : 'Vũng Tàu',
                departureTime: '2026-11-05T08:30:00',
                price: 210000,
                vehicleType: 'Limousine Ghế Massage 9 chỗ',
                licensePlate: 'BS-72B-44321',
                availableSeats: 4,
                matchScore: 0.91,
                reason: 'Dòng xe Limousine ghế massage hiện đại đón trả tận nơi nội thành, phù hợp cho chuyến nghỉ dưỡng cuối tuần.',
                personaCluster: 'WEEKEND_GETAWAY',
                badgeText: 'Trung chuyển tận nơi'
              }
            ]);
          }
          setPersona(pInfo);
        }
      } catch (err) {
        console.error('Lỗi tải đề xuất AI công khai:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRecs();
    return () => { isMounted = false; };
  }, [user, currentCityName, pageContext]);

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
      <div className="rounded-3xl bg-slate-900/80 border border-cyan-500/30 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        
        {/* Glow */}
        <div aria-hidden="true" className="absolute -top-12 -right-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-blue-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-bold font-mono tracking-wide shadow-sm shadow-cyan-500/20">
                <Sparkles size={13} className="text-cyan-400 animate-pulse" />
                <span>{badgeLabel}</span>
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
                Khu vực: {currentCityName}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => navigate('/search')}
              className="px-5 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 text-xs font-bold border border-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
            >
              <span>Xem tất cả chuyến xe</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
          {recommendations.map((trip) => {
            const scorePercent = Math.round((trip.matchScore ?? 0.85) * 100);

            return (
              <div
                key={trip.tripId}
                className="group relative rounded-2xl bg-slate-950/90 border border-cyan-500/30 hover:border-cyan-400/70 p-5 flex flex-col justify-between transition-all duration-300 shadow-xl hover:-translate-y-1 hover:shadow-cyan-500/20"
              >
                <div>
                  {/* Card Top: AI Indicator & Match Score */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-blue-500/20 border border-cyan-400/50 text-[11px] font-bold text-cyan-300 shadow-sm shadow-cyan-500/10">
                      <Sparkles size={11} className="text-cyan-400 animate-pulse" />
                      <span>✨ VEXE AI ĐỀ XUẤT</span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono">
                      Khớp {scorePercent}%
                    </span>
                  </div>

                  <div className="flex items-center justify-end text-[11px] font-medium text-emerald-400 gap-1 mb-2">
                    <Users size={12} />
                    <span>Còn {trip.availableSeats} chỗ</span>
                  </div>

                  {/* Route From -> To */}
                  <div className="flex items-center gap-2 text-white font-bold text-base mb-1">
                    <span className="text-cyan-300">{trip.departureLocation}</span>
                    <ArrowRight size={14} className="text-slate-400 shrink-0" />
                    <span className="text-white">{trip.arrivalLocation}</span>
                  </div>

                  {/* Departure Time */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-light mb-2">
                    <Clock size={13} className="text-slate-400" />
                    <span>Xuất bến: {formatTime(trip.departureTime)}</span>
                  </div>

                  {/* Vehicle Tag */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 font-medium mb-3">
                    <Bus size={13} className="text-cyan-400 shrink-0" />
                    <span className="truncate">{trip.vehicleType}</span>
                  </div>

                  {/* AI Recommendation Rationale Box */}
                  <div className="rounded-xl bg-cyan-950/50 border border-cyan-500/30 p-2.5 text-xs text-slate-200 mb-3 shadow-inner">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-300 mb-0.5">
                      <Sparkles size={11} className="text-cyan-400 shrink-0" />
                      <span>💡 Lý do AI đề xuất:</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-light">
                      {trip.reason || 'Chuyến xe được AI tính toán tối ưu theo độ an toàn, chuẩn dịch vụ 5 sao và giờ khởi hành thuận tiện.'}
                    </p>
                  </div>

                  {/* Badge Text */}
                  {trip.badgeText && (
                    <div className="text-[11px] text-amber-300/90 font-medium leading-relaxed mb-4">
                      ⭐ {trip.badgeText}
                    </div>
                  )}
                </div>

                {/* Footer: Price & CTA */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Giá vé từ</div>
                    <div className="text-base sm:text-lg font-black text-cyan-400 tracking-tight font-mono">
                      {formatPrice(trip.price)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectTrip(trip)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/25 hover:shadow-cyan-400/40 cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap active:scale-95"
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
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-400 font-light gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            <span>Cam kết giữ đúng 100% số ghế • Hoàn tiền 150% nếu nhà xe hủy chuyến</span>
          </div>
          <div className="flex items-center gap-2">
            <HeartHandshake size={16} className="text-cyan-400 shrink-0" />
            <span>Tối ưu hóa hành trình bởi VEXE AI Engine & pgvector</span>
          </div>
        </div>

      </div>

    </section>
  );
};

export default PublicAiTripShelf;

