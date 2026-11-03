import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Bus, 
  Clock, 
  ShieldCheck, 
  Award,
  Gift
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
  onSelectTrip
}) => {
  const { user } = useAuthStore();
  const [recommendations, setRecommendations] = useState<RecommendedTrip[]>([]);
  const [persona, setPersona] = useState<PersonaInfo | null>(null);
  const [isNewGuest, setIsNewGuest] = useState<boolean>(() => geolocationService.isNewGuest());
  const [, setLoadingRecs] = useState(true);

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
        console.error('Lỗi nạp đề xuất tìm kiếm:', err);
      } finally {
        if (isMounted) setLoadingRecs(false);
      }
    };

    fetchAIRecommendations();
    return () => { isMounted = false; };
  }, [user]);

  if (isLoading) return null;

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

  if (trips.length > 0) {
    const bestTrip = trips[0];
    const recMatch = recommendations.find(r => r.tripId === bestTrip.id);

    return (
      <div className="mb-6 rounded-2xl bg-slate-800 border border-slate-700 p-5 sm:p-6 text-slate-100 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left info column */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold font-mono border border-blue-500/30">
                <Sparkles size={13} className="text-cyan-400" />
                <span>CHUYẾN XE ĐỀ XUẤT HÀNG ĐẦU</span>
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black">95%</span>
              </span>

              {isNewGuest ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30">
                  <Gift size={12} className="text-amber-400" />
                  <span>Áp mã BANMOI25 giảm 25%</span>
                </span>
              ) : persona ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold border border-purple-500/30">
                  <Award size={12} className="text-purple-400" />
                  <span>{persona.displayName}</span>
                </span>
              ) : null}
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Chuyến xe tối ưu nhất cho lịch trình của bạn
              </h3>
            </div>

            {/* AI Recommendation Rationale Box */}
            <div className="rounded-xl bg-slate-900 border border-slate-700 p-3 text-xs text-slate-300 shadow-inner">
              <div className="flex items-center gap-1.5 font-bold text-cyan-300 mb-1">
                <Sparkles size={13} className="text-cyan-400 shrink-0" />
                <span>Lý do lựa chọn chuyến xe này:</span>
              </div>
              <p className="text-slate-300 leading-relaxed pl-4">
                {recMatch?.reason || (isNewGuest 
                  ? 'Chuyến xe được 98% khách hàng mới đánh giá xuất sắc về độ êm ái, khoang xe rộng rãi, ghế tầng dưới chống say xe và tài xế chạy an toàn.' 
                  : (persona?.description 
                      ? `Tối ưu hóa riêng cho phân khúc ${persona.displayName}: ${persona.description}` 
                      : 'Lịch trình xuất bến thuận tiện và phương tiện Limousine chất lượng cao.'))}
              </p>
            </div>

            {/* Micro perks */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-cyan-400" />
                <span className="font-mono text-slate-200">{formatTime(bestTrip.departureTime)}</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5">
                <Bus size={13} className="text-slate-400" />
                <span>{(bestTrip.vehicle?.capacity || 24) <= 24 ? 'Limousine VIP 24 phòng' : 'Limousine 34 phòng'}</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Cam kết giữ chỗ 100%</span>
              </span>
            </div>
          </div>

          {/* Right action column */}
          <div className="lg:text-right shrink-0 flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-700">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Giá vé từ</div>
              <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono tracking-tight tabular-nums">
                {formatPrice(bestTrip.price)}
              </div>
            </div>

            {onSelectTrip && (
              <button
                onClick={() => {
                  dispatchTrackAction('SELECT_AI_SPOTLIGHT_TRIP', { tripId: bestTrip.id });
                  onSelectTrip(bestTrip);
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
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
    <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6 sm:p-8 space-y-6 text-slate-100 shadow-sm">
      <div className="text-center max-w-xl mx-auto space-y-1.5">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
          <Sparkles size={24} />
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">
          Chưa có chuyến trực tiếp cho tiêu chí này
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Gợi ý các chuyến xe lân cận được yêu thích nhất phù hợp với điểm đến của bạn:
        </p>
      </div>

      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {recommendations.slice(0, 3).map((rec) => (
            <div
              key={rec.tripId}
              className="p-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 transition-colors flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/20 text-cyan-300 text-[10px] font-bold border border-blue-500/30">
                    <Sparkles size={10} className="text-cyan-400" />
                    <span>ĐỀ XUẤT</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                    Khớp {(rec.matchScore * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                  <span className="text-cyan-300">{rec.departureLocation}</span>
                  <ArrowRight size={13} className="text-slate-400 shrink-0" />
                  <span>{rec.arrivalLocation}</span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-2">
                  <Clock size={12} className="text-slate-400" />
                  <span>{formatTime(rec.departureTime)}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-[11px] text-slate-300 my-2">
                  <span className="font-semibold text-cyan-300 block mb-0.5">Lý do gợi ý:</span>
                  <span className="leading-relaxed">
                    {rec.reason || rec.badgeText || 'Chuyến xe có thời gian xuất bến vàng và đánh giá hài lòng cao.'}
                  </span>
                </div>

                <div className="text-[11px] text-emerald-400 font-medium">
                  Còn {rec.availableSeats} chỗ trống
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Giá từ</div>
                  <div className="text-base font-black text-cyan-400 font-mono tabular-nums">
                    {formatPrice(rec.price)}
                  </div>
                </div>

                <a
                  href={`/search?departure=${encodeURIComponent(rec.departureLocation)}&arrival=${encodeURIComponent(rec.arrivalLocation)}`}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                >
                  <span>Xem tuyến</span>
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

export default SearchSmartSpotlight;
