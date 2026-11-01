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
            <span className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">
              <ArrowLeftRight size={15} />
            </span>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-bold font-mono mb-1">
                <Sparkles size={11} className="text-cyan-400 animate-pulse" />
                <span>✨ VEXE AI ĐỀ XUẤT CHIỀU VỀ</span>
              </div>
              <h4 className="text-sm font-black text-white">Bạn có muốn đặt luôn vé chiều về?</h4>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono shrink-0">
            -10% Khứ hồi
          </span>
        </div>

        {/* AI Rationale Box */}
        <div className="mt-3 p-3 rounded-2xl bg-cyan-950/50 border border-cyan-500/30 text-xs text-slate-200">
          <div className="flex items-center gap-1.5 font-bold text-cyan-300 mb-1 text-xs">
            <Sparkles size={13} className="text-cyan-400 shrink-0" />
            <span>💡 Lý do AI đề xuất:</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-light pl-4">
            Hệ thống AI nhận diện hành trình di chuyển tuyến <strong>{departureLocation} ↔ {arrivalLocation}</strong> có tỉ lệ khách đặt khứ hồi sau 3 ngày lên tới 92%. Đặt trước ngay giúp bạn giữ được phòng VIP ưng ý và tiết kiệm 10%.
          </p>
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
        <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-purple-950/40 border border-amber-500/30 p-4 text-xs text-slate-300 space-y-2.5">
          <div className="flex items-center justify-between text-amber-300 font-bold">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-mono">
              <Sparkles size={11} className="text-amber-400" />
              <span>✨ VEXE AI ĐẶC QUYỀN KHÁCH MỚI</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              Mã: BANMOI25
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20 text-xs">
            <span className="font-bold text-amber-300">💡 Lý do AI áp dụng: </span>
            <span className="text-slate-300 font-light">
              Nhận diện khách hàng mới đặt vé lần đầu từ vị trí địa lý hiện tại. AI tự động kích hoạt mã ưu đãi độc quyền BANMOI25 giảm 25% và gói xe trung chuyển miễn phí.
            </span>
          </div>

          <p className="text-[11px] text-slate-300 font-light leading-relaxed">
            Bạn đang hưởng trọn đặc quyền khách mới! Tổng đài nhà xe sẽ chủ động liên hệ trước 30 phút để xác nhận vị trí đón và đưa đón miễn phí.
          </p>
        </div>
      ) : persona ? (
        <div className="rounded-2xl bg-slate-900/80 border border-purple-500/30 p-4 text-xs text-slate-300 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-[10px] font-mono">
              <Sparkles size={11} className="text-purple-400" />
              <span>✨ VEXE AI CÁ NHÂN HÓA HỘI VIÊN</span>
            </div>
            <span className="text-[11px] font-bold text-purple-300">{persona.displayName}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-purple-500/20 text-xs">
            <span className="font-bold text-purple-300">💡 Lý do AI áp dụng: </span>
            <span className="text-slate-300 font-light">
              Phân tích dữ liệu hội viên khớp phân khúc "{persona.displayName}". Hệ thống tự động ưu tiên dịch vụ Limousine cao cấp và hỗ trợ hoàn vé linh hoạt.
            </span>
          </div>

          <p className="text-[11px] text-slate-400 font-light leading-relaxed">
            {persona.description}. Chuyến đi được tích điểm VEXE Rewards và ưu tiên hỗ trợ đổi trả linh hoạt.
          </p>
        </div>
      ) : null}

    </div>
  );
};

