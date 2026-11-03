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
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-5 shadow-sm text-slate-100">
        
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center font-semibold shrink-0">
              <ArrowLeftRight size={15} />
            </span>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/25 text-blue-300 text-[10px] font-semibold font-mono mb-1">
                <Sparkles size={11} className="text-blue-400" />
                <span>ĐỀ XUẤT CHIỀU VỀ</span>
              </div>
              <h4 className="text-sm font-bold text-white">Bạn có muốn đặt luôn vé chiều về?</h4>
            </div>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono shrink-0">
            -10% Khứ hồi
          </span>
        </div>

        {/* AI Rationale Box */}
        <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-semibold text-cyan-400 mb-1 text-xs">
            <Sparkles size={13} className="text-cyan-400 shrink-0" />
            <span>Lý do gợi ý:</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-normal pl-4">
            Hành trình tuyến <strong>{departureLocation} ↔ {arrivalLocation}</strong> có tỉ lệ khách đặt khứ hồi sau 3 ngày lên tới 92%. Đặt trước ngay giúp bạn giữ được phòng VIP ưng ý và tiết kiệm 10%.
          </p>
        </div>

        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <span className="text-cyan-400">{arrivalLocation}</span>
              <ArrowRight size={14} className="text-slate-500" />
              <span className="text-white">{departureLocation}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Calendar size={12} className="text-slate-400" />
              <span>Dự kiến ngày về: <strong className="text-slate-200">{returnDate}</strong> (Sau 3 ngày)</span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleBookReturnTrip}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
          >
            <span>Đặt chiều về ngay</span>
            <ArrowRight size={13} />
          </button>
        </div>

      </div>

      {/* 2. Personalized Onboarding / Persona Advice */}
      {isNewGuest ? (
        <div className="rounded-2xl bg-slate-800 border border-amber-500/30 p-4 text-xs text-slate-300 space-y-2.5">
          <div className="flex items-center justify-between text-amber-300 font-semibold">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/25 text-amber-300 text-[10px] font-mono">
              <Sparkles size={11} className="text-amber-400" />
              <span>ĐẶC QUYỀN KHÁCH MỚI</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25 font-bold">
              Mã: BANMOI25
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs">
            <span className="font-semibold text-amber-400">Ưu đãi áp dụng: </span>
            <span className="text-slate-300">
              Nhận diện khách hàng mới đặt vé lần đầu. Hệ thống kích hoạt mã ưu đãi BANMOI25 giảm 25% và gói xe trung chuyển miễn phí.
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Bạn đang hưởng trọn đặc quyền khách mới! Tổng đài nhà xe sẽ chủ động liên hệ trước 30 phút để xác nhận vị trí đón và đưa đón chu đáo.
          </p>
        </div>
      ) : persona ? (
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-4 text-xs text-slate-300 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/25 text-blue-300 text-[10px] font-mono">
              <Sparkles size={11} className="text-blue-400" />
              <span>CÁ NHÂN HÓA HỘI VIÊN</span>
            </div>
            <span className="text-[11px] font-semibold text-blue-400">{persona.displayName}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs">
            <span className="font-semibold text-cyan-400">Chính sách ưu tiên: </span>
            <span className="text-slate-300">
              Phân tích dữ liệu hội viên khớp phân khúc "{persona.displayName}". Hệ thống tự động ưu tiên dịch vụ Limousine cao cấp và hỗ trợ hoàn vé linh hoạt.
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            {persona.description}. Chuyến đi được tích điểm VEXE Rewards và ưu tiên hỗ trợ đổi trả linh hoạt.
          </p>
        </div>
      ) : null}

    </div>
  );
};

