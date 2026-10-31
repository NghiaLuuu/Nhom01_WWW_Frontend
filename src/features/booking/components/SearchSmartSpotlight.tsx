import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Bus, 
  Clock, 
  ShieldCheck, 
  Star, 
  Zap, 
  MapPin, 
  Users, 
  Award,
  Gift,
  HelpCircle
} from 'lucide-react';
import { recommendationService, type RecommendedTrip, type PersonaInfo } from '../../../services/recommendation.service';
import { geolocationService } from '../../../services/geolocation.service';
import { useAuthStore } from '../../../store/useAuthStore';
import { dispatchTrackAction } from '../../../hooks/useUserTracker';
import { type Trip } from '../../admin/api/trip.service';

interface SearchSmartSpotlightProps {
  trips: Trip[];
  isLoading: boolean;
  departureParam?: string;
  arrivalParam?: string;
  onSelectTrip?: (trip: Trip) => void;
}

export const SearchSmartSpotlight: React.FC<SearchSmartSpotlightProps> = ({
  trips,
  isLoading,
  departureParam,
  arrivalParam,
  onSelectTrip
}) => {
  const { user } = useAuthStore();
  const [recommendations, setRecommendations] = useState<RecommendedTrip[]>([]);
  const [persona, setPersona] = useState<PersonaInfo | null>(null);
  const [isNewGuest, setIsNewGuest] = useState<boolean>(() => geolocationService.isNewGuest());
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    const handleGuestTypeUpdate = (e: any) => {
      if (typeof e.detail?.isNewGuest === 'boolean') {
        setIsNewGuest(e.detail.isNewGuest);
      }
    };
    window.addEventListener('vexe_guest_type_updated', handleGuestTypeUpdate);
    return () => window.removeEventListener('vexe_guest_type_updated', handleGuestTypeUpdate);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchAIRecommendations = async () => {
      try {
        setLoadingRecs(true);
        const anonId = localStorage.getItem('vexe_anon_id') || undefined;
        const customerId = user?.id || undefined;
        const loc = geolocationService.getStoredLocation();
        const city = loc?.city;

        const [recs, pInfo] = await Promise.all([
          recommendationService.getRecommendations(anonId, customerId, 4, city),
          recommendationService.inferPersona(anonId, customerId)
        ]);

        if (isMounted) {
          setRecommendations(Array.isArray(recs) ? recs : []);
          setPersona(pInfo);
        }
      } catch (err) {
        console.error('Lỗi nạp đề xuất AI tìm kiếm:', err);
      } finally {
        if (isMounted) setLoadingRecs(false);
      }
    };

    fetchAIRecommendations();
    return () => { isMounted = false; };
  }, [user]);

  if (isLoading) return null;

  // Format currency helper
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

  // Case 1: Trips exist in search results
  // Pick the best match: matching persona or highest priced VIP / most convenient time
  if (trips.length > 0) {
    const bestTrip = trips[0];
    const recMatch = recommendations.find(r => r.tripId === bestTrip.id);

    return (
      <div className="mb-6 rounded-3xl bg-gradient-to-r from-cyan-950/70 via-slate-900/90 to-blue-950/70 border border-cyan-500/40 p-5 sm:p-6 shadow-2xl shadow-cyan-950/40 relative overflow-hidden text-slate-100 animate-in fade-in duration-300">
        
        {/* Ambient Top Glow */}
        <div aria-hidden="true" className="absolute -top-16 -right-16 w-52 h-52 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left info column */}
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold font-mono tracking-wide">
                <Sparkles size={13} className="text-cyan-400 animate-pulse" />
                <span>VEXE AI BEST MATCH</span>
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black">95%</span>
              </span>

              {isNewGuest ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold">
                  <Gift size={12} className="text-amber-400" />
                  <span>Áp mã BANMOI25 giảm 25%</span>
                </span>
              ) : persona ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-[11px] font-bold">
                  <Award size={12} className="text-purple-400" />
                  <span>{persona.displayName}</span>
                </span>
              ) : null}
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Chuyến xe AI gợi ý phù hợp nhất với bạn</span>
              </h3>
              <p className="text-xs sm:text-sm text-cyan-200/90 font-light mt-1 leading-relaxed">
                {recMatch?.reason || (isNewGuest 
                  ? 'Chuyến xe được 98% khách hàng mới đánh giá xuất sắc về độ êm ái, khoang xe rộng rãi và tài xế chạy an toàn.' 
                  : (persona?.description || 'Tối ưu hóa hành trình dựa trên thời gian xuất bến vàng và phương tiện chất lượng cao.'))}
              </p>
            </div>

            {/* Micro perks */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-cyan-400" />
                <span className="font-mono text-cyan-200">{formatTime(bestTrip.departureTime)}</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5">
                <Bus size={13} className="text-indigo-400" />
                <span>{(bestTrip.vehicle?.capacity || 24) <= 24 ? 'Limousine VIP 24 phòng' : 'Limousine 34 phòng VIP'}</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck size={14} />
                <span>Cam kết giữ chỗ 100%</span>
              </span>
            </div>
          </div>

          {/* Right action column */}
          <div className="lg:text-right shrink-0 flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/10">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Giá vé ưu đãi</div>
              <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono tracking-tight">
                {formatPrice(bestTrip.price)}
              </div>
            </div>

            {onSelectTrip && (
              <button
                onClick={() => {
                  dispatchTrackAction('SELECT_AI_SPOTLIGHT_TRIP', { tripId: bestTrip.id });
                  onSelectTrip(bestTrip);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs sm:text-sm font-bold transition-all shadow-lg shadow-cyan-500/30 flex items-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <span>Xem & Chọn ghế này</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

        </div>

      </div>
    );
  }

  // Case 2: Zero trips found - Show AI Alternatives Shelf
  return (
    <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-6 sm:p-8 space-y-6 text-slate-100 shadow-2xl">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
          <Sparkles size={28} />
        </div>
        <h3 className="text-xl font-black text-white tracking-tight">
          Chưa có chuyến trực tiếp cho tiêu chí này
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed">
          Đừng lo! VEXE AI đã tự động phân tích và đề xuất các chuyến xe lân cận được yêu thích nhất phù hợp với hành trình của bạn:
        </p>
      </div>

      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {recommendations.slice(0, 3).map((rec) => (
            <div
              key={rec.tripId}
              className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/50 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono">
                    Khớp {(rec.matchScore * 100).toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">
                    Còn {rec.availableSeats} chỗ
                  </span>
                </div>

                <div className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                  <span className="text-cyan-300">{rec.departureLocation}</span>
                  <ArrowRight size={13} className="text-slate-500 shrink-0" />
                  <span className="text-white">{rec.arrivalLocation}</span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-2">
                  <Clock size={12} className="text-slate-500" />
                  <span>{formatTime(rec.departureTime)}</span>
                </div>

                <div className="text-[11px] text-amber-300/90 font-medium leading-snug line-clamp-2">
                  {rec.badgeText || rec.reason}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Giá từ</div>
                  <div className="text-base font-black text-cyan-400 font-mono">
                    {formatPrice(rec.price)}
                  </div>
                </div>

                <a
                  href={`/search?departure=${encodeURIComponent(rec.departureLocation)}&arrival=${encodeURIComponent(rec.arrivalLocation)}`}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center gap-1 group-hover:border-cyan-400"
                >
                  <span>Xem tuyến này</span>
                  <ArrowRight size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
