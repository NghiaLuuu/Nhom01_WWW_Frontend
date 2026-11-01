import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Award, 
  Bus, 
  Clock, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Tag, 
  Zap, 
  RefreshCw,
  Gift,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { recommendationService, type RecommendedTrip, type PersonaInfo } from '../../../services/recommendation.service';
import { useAuthStore } from '../../../store/useAuthStore';
import { dispatchTrackAction } from '../../../hooks/useUserTracker';
import toast from 'react-hot-toast';

export const CustomerPersonalizedHub: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [recommendations, setRecommendations] = useState<RecommendedTrip[]>([]);
  const [persona, setPersona] = useState<PersonaInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAIInsights = async () => {
    setLoading(true);
    try {
      const anonId = localStorage.getItem('vexe_anon_id') || undefined;
      const customerId = user?.id || undefined;

      const [recs, pInfo] = await Promise.all([
        recommendationService.getRecommendations(anonId, customerId, 6),
        recommendationService.inferPersona(anonId, customerId)
      ]);

      setRecommendations(Array.isArray(recs) ? recs : []);
      setPersona(pInfo);
    } catch (err) {
      console.error('Lỗi nạp đề xuất hồ sơ cá nhân:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
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
        ' - ' + d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return timeStr;
    }
  };

  const handleBookTrip = (trip: RecommendedTrip) => {
    dispatchTrackAction('PROFILE_BOOK_RECOMMENDED_TRIP', { tripId: trip.tripId });
    navigate(`/search?tripId=${trip.tripId}&departure=${encodeURIComponent(trip.departureLocation)}&arrival=${encodeURIComponent(trip.arrivalLocation)}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Persona Identity Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-cyan-950/80 border border-purple-500/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow */}
        <div aria-hidden="true" className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-bold font-mono">
                <Sparkles size={13} className="text-purple-400" />
                <span>PHÂN KHÚC HÀNH VI AI CỦA BẠN</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold border border-cyan-500/30">
                ⭐ Độ tin cậy cao
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {persona?.displayName || 'Hội viên Du Lịch & Thường Lệ'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
              {persona?.description || 'Hệ thống VEXE AI tự động phân tích lịch sử các chuyến xe đã hoàn tất của bạn để cá nhân hóa đề xuất giờ khởi hành vàng và các dòng xe cao cấp nhất.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white/5 border border-white/10">
                <Bus size={13} className="text-cyan-400" />
                <span>Ưu tiên Limousine VIP</span>
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white/5 border border-white/10">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>Giữ chỗ 100% tự động</span>
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white/5 border border-white/10">
                <Tag size={13} className="text-amber-400" />
                <span>Mã giảm giá hội viên sẵn sàng</span>
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-start lg:items-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/10">
            <button
              onClick={fetchAIInsights}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-white/10"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Cập nhật phân tích AI</span>
            </button>
          </div>

        </div>

      </div>

      {/* 2. Top Recommended Trips for Persona */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Zap size={18} className="text-cyan-400" />
              <span>Chuyến Xe Quen Thuộc & Đề Xuất Dành Riêng Cho Bạn</span>
            </h3>
            <p className="text-xs text-slate-400 font-light mt-0.5">
              1-chạm đặt vé nhanh các chuyến xe phù hợp nhất với thói quen di chuyển của bạn
            </p>
          </div>

          <span className="text-xs text-cyan-400 font-mono font-bold">
            {recommendations.length} chuyến khớp
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-cyan-400" />
            <p className="text-xs">Đang đồng bộ dữ liệu AI cá nhân hóa...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 text-center text-slate-400">
            Chưa có đủ dữ liệu lịch sử để xuất đề xuất riêng. Hãy thực hiện thêm chuyến đi để kích hoạt đề xuất!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendations.map(trip => (
              <div
                key={trip.tripId}
                className="rounded-3xl bg-slate-900/80 border border-white/10 hover:border-cyan-400/50 p-5 shadow-xl hover:shadow-cyan-950/40 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="px-2.5 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono font-bold">
                      ⭐ Khớp {(trip.matchScore * 100).toFixed(0)}%
                    </span>
                    <span className="text-emerald-400 font-medium">Còn {trip.availableSeats} chỗ</span>
                  </div>

                  <div className="text-base font-bold text-white flex items-center gap-2 mb-1.5">
                    <span className="text-cyan-300">{trip.departureLocation}</span>
                    <ArrowRight size={15} className="text-slate-400 shrink-0" />
                    <span className="text-white">{trip.arrivalLocation}</span>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-2.5">
                    <Clock size={13} className="text-slate-500" />
                    <span>{formatTime(trip.departureTime)}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 font-medium mb-3">
                    <Bus size={13} className="text-indigo-400" />
                    <span className="truncate">{trip.vehicleType}</span>
                  </div>

                  <p className="text-xs text-amber-300/90 font-medium leading-relaxed">
                    {trip.badgeText || trip.reason}
                  </p>
                </div>

                <div className="pt-3.5 border-t border-white/10 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Giá vé từ</div>
                    <div className="text-lg font-black text-cyan-400 font-mono">
                      {formatPrice(trip.price)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleBookTrip(trip)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/25 flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Đặt lại ngay</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};

