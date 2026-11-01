import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowLeftRight, 
  ArrowRight, 
  Bus, 
  Calendar, 
  Gift, 
  ShieldCheck, 
  Clock, 
  Tag, 
  Percent, 
  CheckCircle2, 
  Zap,
  PhoneCall
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { geolocationService } from '../../../services/geolocation.service';
import { recommendationService, type PersonaInfo } from '../../../services/recommendation.service';
import { useAuthStore } from '../../../store/useAuthStore';
import { dispatchTrackAction } from '../../../hooks/useUserTracker';
import toast from 'react-hot-toast';

interface CheckoutSmartAddonsProps {
  departureLocation?: string;
  arrivalLocation?: string;
  departureTime?: string;
}

export const CheckoutSmartAddons: React.FC<CheckoutSmartAddonsProps> = ({
  departureLocation = 'TP.HCM',
  arrivalLocation = 'Đà Lạt',
  departureTime
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isNewGuest, setIsNewGuest] = useState<boolean>(() => geolocationService.isNewGuest());
  const [persona, setPersona] = useState<PersonaInfo | null>(null);

  // Return date calculation (3 days after departure date)
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
    const handleGuestTypeUpdate = (e: any) => {
      if (typeof e.detail?.isNewGuest === 'boolean') {
        setIsNewGuest(e.detail.isNewGuest);
      }
    };
    window.addEventListener('vexe_guest_type_updated', handleGuestTypeUpdate);

    const anonId = localStorage.getItem('vexe_anon_id') || undefined;
    recommendationService.inferPersona(anonId, user?.id || undefined)
      .then(p => { if (p) setPersona(p); })
      .catch(() => {});

    return () => window.removeEventListener('vexe_guest_type_updated', handleGuestTypeUpdate);
  }, [user]);

  const handleBookReturnTrip = () => {
    dispatchTrackAction('CLICK_RECOMMENDED_RETURN_TRIP', {
      from: arrivalLocation,
      to: departureLocation,
      date: returnDate
    });
    toast.success(`Đang mở tìm kiếm chuyến về: ${arrivalLocation} → ${departureLocation}`);
    navigate(`/search?departure=${encodeURIComponent(arrivalLocation)}&arrival=${encodeURIComponent(departureLocation)}&date=${returnDate}`);
  };

  return (
    <div className="space-y-4">
      
      {/* 1. AI Return Trip Proposal Card */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-cyan-950/70 border border-cyan-500/40 p-5 shadow-2xl shadow-cyan-950/30 text-slate-100 relative overflow-hidden">
        
        {/* Glow ambient */}
        <div aria-hidden="true" className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <ArrowLeftRight size={14} />
            </span>
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Gợi ý AI khứ hồi</span>
              <h4 className="text-sm font-black text-white">Bạn có muốn đặt luôn vé chiều về?</h4>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
            -10% Khứ hồi
          </span>
        </div>

        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <span className="text-cyan-300">{arrivalLocation}</span>
              <ArrowRight size={14} className="text-slate-400" />
              <span className="text-white">{departureLocation}</span>
            </div>
            <p className="text-[11px] text-slate-300 font-light mt-0.5 flex items-center gap-1.5">
              <Calendar size={12} className="text-cyan-400" />
              <span>Dự kiến ngày về: <strong>{returnDate}</strong> (Sau 3 ngày)</span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleBookReturnTrip}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/30 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
          >
            <span>Đặt chiều về ngay</span>
            <ArrowRight size={13} />
          </button>
        </div>

      </div>

      {/* 2. Personalized Onboarding / Persona Advice */}
      {isNewGuest ? (
        <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-purple-950/40 border border-amber-500/30 p-4 text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between text-amber-300 font-bold">
            <span className="flex items-center gap-1.5">
              <Gift size={15} className="text-amber-400 animate-bounce" />
              <span>Đặc quyền Tân thủ VEXE</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              Mã: BANMOI25
            </span>
          </div>
          <p className="text-[11px] text-slate-300 font-light leading-relaxed">
            Bạn đang hưởng đặc quyền khách mới! Tổng đài nhà xe sẽ tự động gọi trước 30 phút để xác nhận vị trí đón và trung chuyển miễn phí tận nơi.
          </p>
        </div>
      ) : persona ? (
        <div className="rounded-2xl bg-slate-900/80 border border-purple-500/30 p-4 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center gap-1.5 text-purple-300 font-bold">
            <Sparkles size={14} className="text-purple-400" />
            <span>Phân khúc: {persona.displayName}</span>
          </div>
          <p className="text-[11px] text-slate-400 font-light leading-relaxed">
            {persona.description}. Chuyến đi được tích điểm VEXE Rewards và ưu tiên hỗ trợ đổi trả linh hoạt.
          </p>
        </div>
      ) : null}

    </div>
  );
};

