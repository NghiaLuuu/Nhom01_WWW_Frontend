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
    <div className="space-y-8">
      
      {/* 1. Persona Identity Banner */}
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-semibold font-mono">
                <Sparkles size={12} className="text-blue-400" />
                <span>PHÂN KHÚC HÀNH VI CỦA BẠN</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
                Độ tin cậy cao
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {persona?.displayName || 'Hội viên Du Lịch & Thường Lệ'}
            </h2>

            {/* AI Reasoning on Persona Classification */}
            <div className="rounded-xl bg-slate-900 border border-slate-700 p-3.5 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-semibold text-cyan-400 mb-1 text-xs">
                <Sparkles size={13} className="text-cyan-400 shrink-0" />
                <span>Lý do phân loại phân khúc:</span>
              </div>
              <p className="text-slate-300 leading-relaxed pl-4">
                {persona?.description || 'Dựa trên việc phân tích lịch sử các giao dịch đặt vé đã hoàn tất, thói quen tuyến đường yêu thích và tần suất di chuyển của bạn trong hệ thống.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300">
              <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700">
                <Bus size={13} className="text-blue-400" />
                <span>Ưu tiên Limousine VIP</span>
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>Giữ chỗ 100% tự động</span>
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700">
                <Tag size={13} className="text-amber-400" />
                <span>Ưu đãi hội viên sẵn sàng</span>
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-start lg:items-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-700">
            <button
              onClick={fetchAIInsights}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer border border-slate-600"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Cập nhật phân tích</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Recommended Trips for Persona */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Zap size={18} className="text-blue-400" />
              <span>Chuyến Xe Quen Thuộc & Đề Xuất Dành Riêng Cho Bạn</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              1-chạm đặt vé nhanh các chuyến xe phù hợp nhất với thói quen di chuyển của bạn
            </p>
          </div>

          <span className="text-xs text-cyan-400 font-mono font-medium">
            {recommendations.length} chuyến khớp
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-400" />
            <p className="text-xs">Đang đồng bộ dữ liệu đề xuất...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-800 border border-slate-700 text-center text-slate-400">
            Chưa có đủ dữ liệu lịch sử để xuất đề xuất riêng. Hãy thực hiện thêm chuyến đi để kích hoạt đề xuất!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendations.map(trip => (
              <div
                key={trip.tripId}
                className="rounded-2xl bg-slate-800 border border-slate-700 hover:border-slate-600 p-5 shadow-sm transition-colors flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/25 text-[10px] font-semibold text-blue-300">
                      <Sparkles size={11} className="text-blue-400" />
                      <span>ĐỀ XUẤT</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400 font-mono font-semibold text-[10px]">
                      Khớp {(trip.matchScore * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-end text-[10px] text-emerald-400 font-medium mb-1.5">
                    Còn {trip.availableSeats} chỗ
                  </div>

                  <div className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
                    <span className="text-cyan-400">{trip.departureLocation}</span>
                    <ArrowRight size={14} className="text-slate-500 shrink-0" />
                    <span>{trip.arrivalLocation}</span>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-2.5">
                    <Clock size={13} className="text-slate-500" />
                    <span>{formatTime(trip.departureTime)}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 font-medium mb-3">
                    <Bus size={13} className="text-blue-400" />
                    <span className="truncate">{trip.vehicleType}</span>
                  </div>

                  {/* AI Rationale Box */}
                  <div className="rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-slate-300 mb-2">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 mb-0.5">
                      <Sparkles size={11} className="text-cyan-400 shrink-0" />
                      <span>Lý do gợi ý:</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {trip.reason || trip.badgeText || 'Chuyến xe khớp với sở thích tuyến đường và lịch trình quen thuộc của bạn.'}
                    </p>
                  </div>

                  <p className="text-[11px] text-amber-300 font-medium leading-relaxed">
                    {trip.badgeText}
                  </p>
                </div>

                <div className="pt-3.5 border-t border-slate-700 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Giá vé từ</div>
                    <div className="text-lg font-bold text-white font-mono">
                      {formatPrice(trip.price)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleBookTrip(trip)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
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
