import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Bus, Clock, Users, X, ShieldCheck, HeartHandshake, MapPin } from 'lucide-react';
import { recommendationService, type RecommendedTrip, type PersonaInfo } from '../../../services/recommendation.service';
import { geolocationService, type UserLocationResult } from '../../../services/geolocation.service';
import { useAuthStore } from '../../../store/useAuthStore';
import { dispatchTrackAction } from '../../../hooks/useUserTracker';
import { DEMO_CITIES } from './LocationPermissionModal';

export const PersonalizedDiscoveryShelf: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [recommendations, setRecommendations] = useState<RecommendedTrip[]>([]);
  const [personaInfo, setPersonaInfo] = useState<PersonaInfo | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocationResult | null>(geolocationService.getStoredLocation());
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchRecs = useCallback(async (loc?: UserLocationResult | null) => {
    try {
      setLoading(true);
      const anonId = localStorage.getItem('vexe_anon_id') || undefined;
      const customerId = user?.id;
      const targetCity = loc?.city || userLocation?.city;

      const [trips, persona] = await Promise.all([
        recommendationService.getRecommendations(anonId, customerId, 4, targetCity),
        recommendationService.inferPersona(anonId, customerId)
      ]);

      setRecommendations(trips);
      setPersonaInfo(persona);
    } catch (err) {
      console.warn('Failed loading recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, userLocation?.city]);

  useEffect(() => {
    fetchRecs(userLocation);

    const handleLocationUpdate = (e: any) => {
      const newLoc = e.detail as UserLocationResult | null;
      setUserLocation(newLoc);
      fetchRecs(newLoc);
    };

    window.addEventListener('vexe_location_updated', handleLocationUpdate);
    return () => window.removeEventListener('vexe_location_updated', handleLocationUpdate);
  }, [fetchRecs]);

  if (!isVisible || loading || recommendations.length === 0) {
    return null;
  }

  const handleSelectTrip = (trip: RecommendedTrip) => {
    dispatchTrackAction('CLICK_RECOMMENDATION', {
      tripId: trip.tripId,
      persona: trip.personaCluster,
      matchScore: trip.matchScore
    });

    const dateStr = typeof trip.departureTime === 'string' ? trip.departureTime.split('T')[0] : '';
    navigate(`/search?departure=${encodeURIComponent(trip.departureLocation)}&arrival=${encodeURIComponent(trip.arrivalLocation)}&date=${dateStr}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price) || 0);
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      return `${hours}:${minutes} • ${day}/${month}`;
    } catch {
      return isoString;
    }
  };

  return (
    <section className="relative py-12 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto w-full transition-all duration-500">
      
      {/* Background glowing ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-64 bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-indigo-600/10 blur-[130px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-cyan-500/30 p-6 sm:p-8 shadow-2xl shadow-cyan-950/30">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {userLocation ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-md shadow-emerald-950/30">
                  <MapPin size={13} className="text-emerald-400 animate-pulse" />
                  <span>Vị trí hiện tại: {userLocation.displayName}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles size={14} className="text-cyan-400 animate-pulse" />
                  <span>Hội Đồng Điệu & AI pgvector Đề Xuất</span>
                </div>
              )}

              {/* Demo Location Switcher Combobox */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/90 border border-cyan-500/40 text-xs text-slate-200 shadow-sm shadow-cyan-950/30">
                <span className="text-[11px] text-cyan-400 font-bold flex items-center gap-1">
                  <span>🎯</span>
                  <span>Giả lập vị trí:</span>
                </span>
                <select
                  value={userLocation?.city || ''}
                  onChange={(e) => {
                    const c = DEMO_CITIES.find(item => item.city === e.target.value);
                    if (c) {
                      geolocationService.setManualCity(c.city, c.label);
                    }
                  }}
                  className="bg-transparent text-xs text-cyan-200 font-semibold focus:outline-none cursor-pointer py-0.5"
                  title="Chọn vị trí khác để demo thuật toán gợi ý"
                >
                  <option value="" disabled className="bg-slate-900 text-slate-400">
                    -- Chọn đổi vị trí demo --
                  </option>
                  {DEMO_CITIES.map(c => (
                    <option key={c.city} value={c.city} className="bg-slate-900 text-slate-100">
                      📍 {c.label} ({c.note})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>
                {userLocation
                  ? `Chuyến Xe Khởi Hành Từ ${userLocation.city}`
                  : 'Chuyến Đi Phù Hợp Nhất Với Gu Của Bạn'}
              </span>
              {personaInfo?.displayName && !userLocation && (
                <span className="hidden lg:inline-block text-xs font-medium px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-mono">
                  {personaInfo.displayName}
                </span>
              )}
            </h2>

            <p className="text-slate-400 text-xs sm:text-sm font-light">
              {userLocation
                ? `Hệ thống AI tự động ưu tiên các chuyến xe xuất phát từ ${userLocation.displayName} đến các điểm du lịch & công tác nổi bật.`
                : 'Hệ thống AI phân tích thời gian tương tác và so khớp khoảng cách Cosine pgvector để đề xuất chuyến xe tối ưu nhất.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            {userLocation && (
              <button
                onClick={() => {
                  geolocationService.clearLocation();
                  setUserLocation(null);
                  fetchRecs(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 hover:text-white text-xs font-medium transition-colors border border-cyan-500/30 cursor-pointer"
                title="Thay đổi hoặc bỏ chọn vị trí hiện tại"
              >
                <MapPin size={13} />
                <span>Đổi vị trí</span>
              </button>
            )}

            <button
              onClick={() => setIsVisible(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-medium transition-colors border border-white/10 cursor-pointer"
              title="Ẩn khối đề xuất"
            >
              <X size={14} />
              <span>Ẩn đề xuất</span>
            </button>
          </div>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-6">
          {recommendations.map((trip) => {
            const scorePercent = Math.round((trip.matchScore ?? 0.8) * 100);

            return (
              <div
                key={trip.tripId}
                className="group relative rounded-2xl bg-slate-950/80 border border-white/10 hover:border-cyan-400/50 p-5 flex flex-col justify-between transition-all duration-300 shadow-xl hover:-translate-y-1 hover:shadow-cyan-500/10"
              >
                {/* Header: Route & Match Score */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono">
                      Khớp {scorePercent}%
                    </span>
                    <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                      <Users size={12} />
                      <span>Còn {trip.availableSeats} chỗ</span>
                    </span>
                  </div>

                  {/* Route From -> To */}
                  <div className="flex items-center gap-2 text-white font-bold text-base mb-1">
                    <span className="text-cyan-300">{trip.departureLocation}</span>
                    <ArrowRight size={14} className="text-slate-400 shrink-0" />
                    <span className="text-white">{trip.arrivalLocation}</span>
                  </div>

                  {/* Departure Time */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-light mb-3">
                    <Clock size={13} className="text-slate-400" />
                    <span>{formatTime(trip.departureTime)}</span>
                  </div>

                  {/* Vehicle Tag */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 font-medium mb-3">
                    <Bus size={13} className="text-cyan-400 shrink-0" />
                    <span className="truncate">{trip.vehicleType}</span>
                  </div>

                  {/* Badge Text */}
                  <div className="text-[11px] text-amber-300/90 font-medium leading-relaxed mb-4">
                    {trip.badgeText}
                  </div>
                </div>

                {/* Footer: Price & CTA */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Giá vé từ</div>
                    <div className="text-base sm:text-lg font-black text-cyan-400 tracking-tight">
                      {formatPrice(trip.price)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectTrip(trip)}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 group-hover:scale-105 cursor-pointer flex items-center gap-1"
                  >
                    <span>Đặt ngay</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Credibility Note */}
        <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-slate-400 font-light gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
            <span>Cam kết giữ đúng chỗ 100% • Hoàn 150% nếu nhà xe tự ý hủy chuyến</span>
          </div>
          <div className="flex items-center gap-2">
            <HeartHandshake size={15} className="text-cyan-400 shrink-0" />
            <span>Tối ưu hóa hành trình tự động bởi VEXE AI Engine</span>
          </div>
        </div>

      </div>
    </section>
  );
};
