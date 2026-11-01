import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Bus, 
  Clock, 
  Users, 
  X, 
  ShieldCheck, 
  HeartHandshake, 
  MapPin, 
  Gift, 
  Copy, 
  Check, 
  Compass, 
  HelpCircle, 
  Star, 
  Tag, 
  CheckCircle2, 
  PhoneCall, 
  Zap, 
  Award,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { recommendationService, type RecommendedTrip, type PersonaInfo } from '../../../services/recommendation.service';
import { geolocationService, type UserLocationResult } from '../../../services/geolocation.service';
import { useAuthStore } from '../../../store/useAuthStore';
import { dispatchTrackAction } from '../../../hooks/useUserTracker';
import { DEMO_CITIES } from './LocationPermissionModal';
import toast from 'react-hot-toast';

// Hot destinations mapping for quick booking suggestions based on departure city
const CITY_HOT_DESTINATIONS: Record<string, string[]> = {
  'TP.HCM': ['Đà Lạt', 'Vũng Tàu', 'Phú Yên', 'Nha Trang', 'Cần Thơ', 'Phan Thiết'],
  'Phú Yên': ['TP.HCM', 'Nha Trang', 'Đà Nẵng', 'Quy Nhơn'],
  'Đà Nẵng': ['Huế', 'Phú Yên', 'Quy Nhơn', 'Hà Nội'],
  'Nha Trang': ['TP.HCM', 'Đà Lạt', 'Phú Yên', 'Đà Nẵng'],
  'Đà Lạt': ['TP.HCM', 'Nha Trang', 'Cần Thơ', 'Đà Nẵng'],
  'Hà Nội': ['Sapa', 'Hải Phòng', 'Ninh Bình', 'Hà Giang'],
  'Cần Thơ': ['TP.HCM', 'Vũng Tàu', 'Rạch Giá', 'Cà Mau'],
  'Vũng Tàu': ['TP.HCM', 'Đà Lạt', 'Cần Thơ', 'Bình Thuận'],
  'Quy Nhơn': ['TP.HCM', 'Đà Nẵng', 'Phú Yên', 'Gia Lai'],
  'Huế': ['Đà Nẵng', 'Quảng Trị', 'Hà Nội', 'Nha Trang']
};

export const PersonalizedDiscoveryShelf: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [recommendations, setRecommendations] = useState<RecommendedTrip[]>([]);
  const [personaInfo, setPersonaInfo] = useState<PersonaInfo | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocationResult | null>(geolocationService.getStoredLocation());
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  // New Guest Mode (First-Time Visitor) State
  const [isNewGuest, setIsNewGuest] = useState<boolean>(() => geolocationService.isNewGuest());
  const [activeGuideStep, setActiveGuideStep] = useState<1 | 2 | 3>(1);
  const [copiedVoucher, setCopiedVoucher] = useState(false);

  // Countdown timer for newcomer promotion (24 hours urgency)
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 54, seconds: 38 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

    const handleGuestTypeUpdate = (e: any) => {
      if (typeof e.detail?.isNewGuest === 'boolean') {
        setIsNewGuest(e.detail.isNewGuest);
      }
    };

    window.addEventListener('vexe_location_updated', handleLocationUpdate);
    window.addEventListener('vexe_guest_type_updated', handleGuestTypeUpdate);
    return () => {
      window.removeEventListener('vexe_location_updated', handleLocationUpdate);
      window.removeEventListener('vexe_guest_type_updated', handleGuestTypeUpdate);
    };
  }, [fetchRecs]);

  const handleToggleGuestMode = (newMode: boolean) => {
    setIsNewGuest(newMode);
    geolocationService.setNewGuest(newMode);
    toast.success(
      newMode 
        ? 'Đã kích hoạt chế độ: Khách Mới (Ưu đãi & Cẩm nang chuyến đầu)' 
        : 'Đã chuyển sang chế độ: Khách Quen / Thân Thiết',
      { icon: newMode ? '🎁' : '👑' }
    );
  };

  const handleCopyVoucher = () => {
    navigator.clipboard.writeText('BANMOI25');
    setCopiedVoucher(true);
    toast.success('Đã sao chép mã BANMOI25 (Giảm 25% tối đa 60k)!', { icon: '🎉' });
    dispatchTrackAction('COPY_NEWCOMER_VOUCHER', { code: 'BANMOI25' });
    setTimeout(() => setCopiedVoucher(false), 2500);
  };

  const handleSelectTrip = (trip: RecommendedTrip) => {
    dispatchTrackAction('CLICK_RECOMMENDATION', {
      tripId: trip.tripId,
      persona: trip.personaCluster,
      matchScore: trip.matchScore,
      isNewGuest
    });

    const dateStr = typeof trip.departureTime === 'string' ? trip.departureTime.split('T')[0] : '';
    navigate(`/search?departure=${encodeURIComponent(trip.departureLocation)}&arrival=${encodeURIComponent(trip.arrivalLocation)}&date=${dateStr}&voucher=BANMOI25`);
  };

  const handleQuickRouteSelect = (depCity: string, arrCity: string) => {
    dispatchTrackAction('NEWCOMER_QUICK_ROUTE_CLICK', { departure: depCity, arrival: arrCity });
    navigate(`/search?departure=${encodeURIComponent(depCity)}&arrival=${encodeURIComponent(arrCity)}&voucher=BANMOI25`);
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

  const currentCityName = userLocation?.city || 'TP.HCM';
  const hotDestinations = useMemo(() => {
    return CITY_HOT_DESTINATIONS[currentCityName] || ['Đà Lạt', 'Vũng Tàu', 'Nha Trang', 'Phú Yên'];
  }, [currentCityName]);

  if (!isVisible) {
    return null;
  }

  return (
    <section className="relative py-12 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto w-full transition-all duration-500">
      
      {/* Background glowing ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-80 bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-purple-600/10 blur-[140px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-cyan-500/30 p-6 sm:p-8 shadow-2xl shadow-cyan-950/40">
        
        {/* ========================================================================= */}
        {/* TOP CONTROLS & DUAL-PERSONA SWITCHER BAR                                  */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
          
          {/* Left: Location & Persona Indicators */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Geolocation Pill */}
              {userLocation ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-md shadow-emerald-950/30">
                  <MapPin size={13} className="text-emerald-400 animate-pulse" />
                  <span>Vị trí IP: {userLocation.displayName}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles size={14} className="text-cyan-400 animate-pulse" />
                  <span>AI Đề Xuất Thông Minh Theo IP</span>
                </div>
              )}

              {/* Demo Location Switcher Combobox */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/90 border border-cyan-500/40 text-xs text-slate-200 shadow-sm shadow-cyan-950/30">
                <span className="text-[11px] text-cyan-400 font-bold flex items-center gap-1">
                  <span>🎯</span>
                  <span>Đổi vị trí Demo:</span>
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
                  title="Chọn vị trí khác để demo thuật toán gợi ý theo IP"
                >
                  <option value="" disabled className="bg-slate-900 text-slate-400">
                    -- Chọn vị trí giả lập --
                  </option>
                  {DEMO_CITIES.map(c => (
                    <option key={c.city} value={c.city} className="bg-slate-900 text-slate-100">
                      📍 {c.label} ({c.note})
                    </option>
                  ))}
                </select>
              </div>

              {/* Persona Tag for Returning Customer */}
              {!isNewGuest && personaInfo?.displayName && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center gap-1">
                  <Award size={12} className="text-purple-400" />
                  <span>{personaInfo.displayName}</span>
                </span>
              )}
            </div>

            {/* Headline Title */}
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              {isNewGuest ? (
                <span className="flex items-center gap-2.5 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-cyan-300 to-blue-300">
                  <Gift size={28} className="text-amber-400 animate-bounce inline-block" />
                  <span>Đặc Quyền Khách Mới & Cẩm Nang Đặt Vé Chuẩn 5 Sao</span>
                </span>
              ) : (
                <span>
                  {userLocation
                    ? `Chuyến Xe Tối Ưu Khởi Hành Từ ${userLocation.city}`
                    : 'Chuyến Đi Phù Hợp Nhất Với Thói Quen Của Bạn'}
                </span>
              )}
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm font-light">
              {isNewGuest
                ? `Chào mừng bạn lần đầu trải nghiệm VEXE tại ${userLocation?.displayName || 'TP.HCM'}. Hệ thống hỗ trợ cẩm nang đặt vé 3 bước, mẹo chống say xe và voucher giảm 25% cho chuyến đầu tiên.`
                : 'Hệ thống AI phân tích lịch sử di chuyển kết hợp định vị Geolocation và khoảng cách Cosine pgvector để đề xuất chuyến xe đúng gu của bạn.'}
            </p>
          </div>

          {/* Right: Quick Switch Mode Pill & Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center">
            
            {/* Quick Demo Switcher: Khách mới vs Khách quen */}
            <div className="p-1 rounded-2xl bg-slate-950 border border-cyan-500/40 flex items-center shadow-lg">
              <button
                onClick={() => handleToggleGuestMode(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isNewGuest
                    ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Gift size={13} />
                <span>Khách Mới</span>
              </button>
              <button
                onClick={() => handleToggleGuestMode(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  !isNewGuest
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award size={13} />
                <span>Khách Quen</span>
              </button>
            </div>

            {/* Change Location Button */}
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

            {/* Dismiss Button */}
            <button
              onClick={() => setIsVisible(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-medium transition-colors border border-white/10 cursor-pointer"
              title="Ẩn khối đề xuất"
            >
              <X size={14} />
              <span>Ẩn</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* NEWCOMER EXPERIENCE (RENDERED WHEN isNewGuest === TRUE)                   */}
        {/* ========================================================================= */}
        {isNewGuest && (
          <div className="pt-6 space-y-6 animate-in fade-in slide-in-from-top-3 duration-300">
            
            {/* 1. Welcome Voucher & Countdown Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-cyan-950/40 border border-amber-500/30 p-5 sm:p-6 shadow-xl relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                    <Sparkles size={13} className="text-amber-300" />
                    <span>QUÀ TẶNG CHUYẾN ĐẦU TIÊN CỦA BẠN</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Giảm Ngay 25% (Tối Đa 60.000đ) Khi Đặt Vé Lần Đầu Tiên
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                    Áp dụng cho tất cả các tuyến xe khách Limousine VIP và Giường nằm khởi hành từ <strong className="text-cyan-300 font-bold">{currentCityName}</strong>. Giữ chỗ 100%, hủy vé hoàn tiền tự động.
                  </p>
                </div>

                {/* Voucher Box & Countdown */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
                  <div className="p-3 rounded-2xl bg-slate-950/90 border border-amber-400/40 flex items-center justify-between gap-3 shadow-inner">
                    <div>
                      <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Tag size={11} />
                        <span>Mã Ưu Đãi Khách Mới</span>
                      </div>
                      <div className="text-xl font-black text-white font-mono tracking-wider">
                        BANMOI25
                      </div>
                    </div>
                    <button
                      onClick={handleCopyVoucher}
                      className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-md shadow-amber-400/20"
                    >
                      {copiedVoucher ? <Check size={14} className="text-emerald-950 stroke-[3]" /> : <Copy size={14} />}
                      <span>{copiedVoucher ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>

                  {/* Countdown Timer */}
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center px-4">
                    <span className="text-[10px] text-slate-400 font-medium">Hết hạn sau</span>
                    <div className="text-sm font-mono font-bold text-amber-300 flex items-center gap-1 mt-0.5">
                      <Clock size={12} className="text-amber-400" />
                      <span>{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Interactive 3-Step Guided Booking Assistant */}
            <div className="rounded-2xl bg-slate-950/70 border border-white/10 p-5 sm:p-6 space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                    <HelpCircle size={14} />
                    <span>Dành Cho Khách Mới</span>
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    Hướng Dẫn Đặt Vé Xe Chuẩn 5 Sao Trong 3 Bước
                  </h4>
                </div>
                <div className="text-xs text-slate-400 font-light">
                  Bấm vào từng bước bên dưới để xem hướng dẫn chi tiết & mẹo vàng
                </div>
              </div>

              {/* Stepper Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Step 1 Tab Button */}
                <button
                  onClick={() => setActiveGuideStep(1)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    activeGuideStep === 1
                      ? 'bg-cyan-500/15 border-cyan-400 shadow-lg shadow-cyan-950/40 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    activeGuideStep === 1 ? 'bg-cyan-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                  }`}>
                    1
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">1. Chọn Tuyến & Ngày Đi</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-light">Gợi ý nhanh theo vị trí {currentCityName}</p>
                  </div>
                </button>

                {/* Step 2 Tab Button */}
                <button
                  onClick={() => setActiveGuideStep(2)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    activeGuideStep === 2
                      ? 'bg-blue-500/15 border-blue-400 shadow-lg shadow-blue-950/40 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    activeGuideStep === 2 ? 'bg-blue-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                  }`}>
                    2
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">2. Chọn Loại Xe & Vị Trí Ghế</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-light">Bí kíp chọn ghế êm ái, chống say xe</p>
                  </div>
                </button>

                {/* Step 3 Tab Button */}
                <button
                  onClick={() => setActiveGuideStep(3)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    activeGuideStep === 3
                      ? 'bg-emerald-500/15 border-emerald-400 shadow-lg shadow-emerald-950/40 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    activeGuideStep === 3 ? 'bg-emerald-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                  }`}>
                    3
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">3. Thanh Toán & Nhận Vé QR</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-light">Vé gửi SMS/Email, quét mã lên xe ngay</p>
                  </div>
                </button>

              </div>

              {/* Step Content Display */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10">
                {activeGuideStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h6 className="text-sm font-bold text-white flex items-center gap-2">
                          <MapPin size={16} className="text-cyan-400" />
                          <span>Bước 1: Tra cứu chuyến xe theo điểm xuất phát gần bạn</span>
                        </h6>
                        <p className="text-xs text-slate-300 mt-1 font-light">
                          Hệ thống đã tự động nhận diện bạn đang ở <strong className="text-cyan-300">{currentCityName}</strong>. Bấm nhanh vào một trong các tuyến phổ biến dưới đây để tìm vé ngay:
                        </p>
                      </div>
                    </div>

                    {/* Quick Route Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs text-slate-400 font-semibold mr-1">Tuyến hot từ {currentCityName}:</span>
                      {hotDestinations.map((dest) => (
                        <button
                          key={dest}
                          onClick={() => handleQuickRouteSelect(currentCityName, dest)}
                          className="px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/40 text-cyan-200 font-semibold text-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm"
                        >
                          <span>{currentCityName} → {dest}</span>
                          <ArrowRight size={12} />
                        </button>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-slate-300 font-light flex items-start gap-2">
                      <Zap size={15} className="text-cyan-400 shrink-0 mt-0.5" />
                      <span><strong>Mẹo khởi hành:</strong> Nên chọn giờ khởi hành vào khung giờ vàng từ <strong>20h00 đến 22h30</strong>. Bạn sẽ có một giấc ngủ trọn vẹn trên xe và đến nơi lúc 5h30 - 6h30 sáng hôm sau, tiết kiệm trọn vẹn 1 đêm tiền khách sạn!</span>
                    </div>
                  </div>
                )}

                {activeGuideStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <h6 className="text-sm font-bold text-white flex items-center gap-2">
                        <Bus size={16} className="text-blue-400" />
                        <span>Bước 2: Hiểu rõ các dòng xe & Kinh nghiệm chọn ghế không say xe</span>
                      </h6>
                      <p className="text-xs text-slate-300 mt-1 font-light">
                        VEXE phân chia rõ ràng 3 phân hạng xe để khách mới dễ dàng chọn đúng nhu cầu:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1.5">
                        <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                          <span>👑</span>
                          <span>Limousine VIP 24 Phòng</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-light">Cabin độc lập có rèm riêng, màn hình TV, nệm massage công thái học. Phù hợp nhất cho cặp đôi hoặc người thích riêng tư tuyệt đối.</p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1.5">
                        <div className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                          <span>✨</span>
                          <span>Limousine 34 Phòng</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-light">Không gian thoáng đãng, cổng sạc Type-C 65W, wifi 5G ổn định. Dòng xe được khách trẻ và dân văn phòng lựa chọn nhiều nhất.</p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1.5">
                        <div className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                          <span>💰</span>
                          <span>Giường Nằm Cao Cấp</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-light">Tiết kiệm ngân sách tối đa, giường đệm êm, giảm xóc bóng hơi êm ái. Lựa chọn lý tưởng cho sinh viên và đi theo nhóm đông.</p>
                      </div>
                    </div>

                    {/* Anti Motion Sickness Golden Rule */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 to-teal-950/30 border border-emerald-500/30 text-xs text-emerald-200 font-light flex items-start gap-2.5">
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-semibold mb-0.5">Bí Kíp Vàng Chọn Vị Trí Ghế Chống Say Xe 99%:</strong>
                        Khách mới nên ưu tiên chọn ghế ở <strong>Tầng 1 (Tầng dưới)</strong>, khu vực từ <strong>hàng ghế số 03 đến số 06</strong> (ngay trọng tâm thân xe). Vị trí này có độ lắc lư thấp nhất, cách xa bánh xe sau và động cơ, đảm bảo chuyến đi êm ru như nằm ở nhà!
                      </div>
                    </div>
                  </div>
                )}

                {activeGuideStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <h6 className="text-sm font-bold text-white flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-400" />
                        <span>Bước 3: Thanh toán an toàn 100% & Quét mã QR lên xe</span>
                      </h6>
                      <p className="text-xs text-slate-300 mt-1 font-light">
                        Quy trình xác thực và phát hành vé số hóa hoàn toàn minh bạch, bảo vệ quyền lợi tối đa cho khách mới:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-cyan-400" />
                          <span>Thanh toán đa kênh tức thì</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-light leading-relaxed">
                          Hỗ trợ quét mã VNPay QR, VietQR ngân hàng, Thẻ quốc tế Visa/MasterCard. Hệ thống tự động giữ chỗ trong 5 phút để bạn thong thả hoàn tất.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-emerald-400" />
                          <span>Vé điện tử QR gửi thẳng điện thoại</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-light leading-relaxed">
                          Sau khi thanh toán, mã QR vé sẽ được gửi ngay qua SMS và Email. Khi đến điểm đón, bạn chỉ cần mở màn hình điện thoại cho tài xế quét trong 3 giây là lên xe, không cần in giấy!
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-slate-300 font-light flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <PhoneCall size={16} className="text-blue-400 shrink-0" />
                        <span>Cần hỗ trợ gấp? Tổng đài chăm sóc khách mới 24/7: <strong className="text-white">1900-8886</strong></span>
                      </div>
                      <button
                        onClick={() => navigate('/search')}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer transition-all"
                      >
                        Thử Đặt Vé Ngay
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* 3. Local Pickup & Transit Guide based on IP */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-950/30 via-slate-900/60 to-cyan-950/30 border border-white/10 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Compass size={18} />
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>Điểm đón trả & Xe trung chuyển miễn phí tại {currentCityName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-mono">Free Transit</span>
                  </h5>
                  <p className="text-xs text-slate-300 font-light mt-0.5 leading-relaxed">
                    Khách mới an tâm: VEXE có đội xe trung chuyển đón tận nơi tại các quận nội thành hoặc bến xe trung tâm của {currentCityName}. Tài xế sẽ chủ động gọi điện thoại trước 30-45 phút để hướng dẫn điểm đón chu đáo nhất.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/search?departure=' + encodeURIComponent(currentCityName))}
                className="px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-bold text-xs border border-cyan-500/30 transition-all flex items-center gap-1.5 shrink-0 self-end md:self-auto cursor-pointer"
              >
                <span>Xem lịch đón tại {currentCityName}</span>
                <ChevronRight size={14} />
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* RECOMMENDATIONS GRID (BOTH FOR NEW GUEST & RETURNING CUSTOMER)           */}
        {/* ========================================================================= */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400" />
              <span>
                {isNewGuest
                  ? `Top Chuyến Xe Khởi Hành Từ ${currentCityName} Được Khách Mới Chọn Nhiều Nhất`
                  : `Chuyến Đi Đề Xuất Dành Riêng Cho Bạn (${currentCityName})`}
              </span>
            </h4>
            <span className="text-xs text-slate-400 font-light">
              Hiển thị {recommendations.length} chuyến xe tối ưu
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {recommendations.map((trip) => {
              const scorePercent = Math.round((trip.matchScore ?? 0.8) * 100);

              return (
                <div
                  key={trip.tripId}
                  className="group relative rounded-2xl bg-slate-950/85 border border-white/10 hover:border-cyan-400/50 p-5 flex flex-col justify-between transition-all duration-300 shadow-xl hover:-translate-y-1 hover:shadow-cyan-500/10"
                >
                  {/* Header: Route & Match Score */}
                  <div>
                    {/* Explicit AI Recommendation Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-blue-500/20 border border-cyan-400/50 text-[11px] font-bold text-cyan-300 shadow-sm shadow-cyan-500/10">
                        <Sparkles size={11} className="text-cyan-400 animate-pulse" />
                        <span>✨ VEXE AI ĐỀ XUẤT</span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono">
                        {isNewGuest ? `⭐ 4.9/5 Khách mới` : `Khớp ${scorePercent}%`}
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
                      <span>{formatTime(trip.departureTime)}</span>
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
                        {trip.reason || (isNewGuest 
                          ? `Tuyến xe từ ${currentCityName} có chất lượng 5 sao, độ lắc lư thấp chống say xe tối đa cho khách mới.` 
                          : trip.badgeText || 'Phù hợp với thói quen di chuyển thường lệ và khung giờ ưa thích của bạn.')}
                      </p>
                    </div>

                    {/* Badge Text */}
                    <div className="text-[11px] text-amber-300/90 font-medium leading-relaxed mb-4">
                      {isNewGuest ? `🌟 Áp dụng mã BANMOI25 giảm thêm 25%` : trip.badgeText}
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
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/25 hover:shadow-cyan-400/40 cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap active:scale-95"
                    >
                      <span>{isNewGuest ? 'Đặt nhận quà' : 'Đặt ngay'}</span>
                      <ArrowRight size={13} className="shrink-0" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CREDIBILITY & GUARANTEES FOOTER BAR                                       */}
        {/* ========================================================================= */}
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-400 font-light gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            <span>Cam kết giữ đúng 100% số ghế • Hoàn tiền 150% nếu nhà xe hủy chuyến</span>
          </div>
          <div className="flex items-center gap-2">
            <HeartHandshake size={16} className="text-cyan-400 shrink-0" />
            <span>Hệ thống nhận diện & tối ưu hành trình theo IP bởi VEXE AI Engine</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default PersonalizedDiscoveryShelf;
