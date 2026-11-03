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
  Copy, 
  Check, 
  Compass, 
  HelpCircle, 
  Tag, 
  CheckCircle2, 
  PhoneCall, 
  Zap, 
  ChevronRight
} from 'lucide-react';
import { recommendationService, type RecommendedTrip, type PersonaInfo } from '../../../services/recommendation.service';
import { geolocationService, type UserLocationResult } from '../../../services/geolocation.service';
import { useAuthStore } from '../../../store/useAuthStore';
import { dispatchTrackAction } from '../../../hooks/useUserTracker';
import { DEMO_CITIES } from './LocationPermissionModal';
import toast from 'react-hot-toast';

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
  const [, setPersonaInfo] = useState<PersonaInfo | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocationResult | null>(geolocationService.getStoredLocation());
  const [isVisible, setIsVisible] = useState(true);
  const [, setLoading] = useState(true);

  const [isNewGuest, setIsNewGuest] = useState<boolean>(() => geolocationService.isNewGuest());
  const [activeGuideStep, setActiveGuideStep] = useState<1 | 2 | 3>(1);
  const [copiedVoucher, setCopiedVoucher] = useState(false);

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
        ? 'Đã chọn: Khách Mới (Ưu đãi & Cẩm nang chuyến đầu)' 
        : 'Đã chuyển sang: Khách Quen / Thân Thiết',
      { icon: newMode ? '🎁' : '👑' }
    );
  };

  const handleCopyVoucher = () => {
    navigator.clipboard.writeText('BANMOI25');
    setCopiedVoucher(true);
    toast.success('Đã sao chép mã BANMOI25 (Giảm 25% tối đa 60.000đ)!', { icon: '🎉' });
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
    <section className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full font-sans">
      {/* Main Container Card: Refined Slate/Navy */}
      <div className="relative rounded-2xl bg-slate-800 border border-slate-700 p-6 sm:p-8 shadow-xl text-slate-100">
        
        {/* TOP CONTROLS & DUAL-PERSONA SWITCHER BAR */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-700">
          
          {/* Left: Location & Indicators */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              
              {userLocation ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <MapPin size={13} className="text-emerald-400" />
                  <span>Vị trí hiện tại: {userLocation.displayName}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-cyan-300 text-xs font-semibold">
                  <Sparkles size={13} className="text-cyan-400" />
                  <span>Gợi ý chuyến xe phù hợp nhất</span>
                </div>
              )}

              {/* Location Switcher */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                  <span>📍 Đổi điểm đi:</span>
                </span>
                <select
                  value={userLocation?.city || ''}
                  onChange={(e) => {
                    const found = DEMO_CITIES.find(c => c.city === e.target.value);
                    if (found) {
                      geolocationService.setManualCity(found.city, found.label);
                      const locObj: UserLocationResult = { city: found.city, displayName: found.label, latitude: 10.7769, longitude: 106.7009 };
                      setUserLocation(locObj);
                      fetchRecs(locObj);
                      toast.success(`Đã đổi điểm khởi hành sang ${found.label}`);
                    }
                  }}
                  className="bg-transparent text-cyan-300 font-bold focus:outline-none cursor-pointer text-xs"
                >
                  <option value="" disabled className="bg-slate-900 text-slate-400">Chọn thành phố</option>
                  {DEMO_CITIES.map(c => (
                    <option key={c.city} value={c.city} className="bg-slate-900 text-slate-100">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <p className="text-xs text-slate-300">
              Ưu tiên lịch khởi hành xe Limousine và Giường nằm chất lượng cao từ <strong className="text-white">{currentCityName}</strong>.
            </p>
          </div>

          {/* Right: Guest Mode Switcher & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-700">
              <button
                onClick={() => handleToggleGuestMode(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isNewGuest
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🎁</span>
                <span>Khách Mới (-25%)</span>
              </button>
              <button
                onClick={() => handleToggleGuestMode(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  !isNewGuest
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>👑</span>
                <span>Khách Quen</span>
              </button>
            </div>

            {userLocation && (
              <button
                onClick={() => {
                  geolocationService.clearLocation();
                  setUserLocation(null);
                  fetchRecs(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-650 hover:bg-slate-600 text-slate-200 text-xs font-medium transition-colors border border-slate-650 cursor-pointer"
                title="Thay đổi hoặc bỏ chọn vị trí hiện tại"
              >
                <MapPin size={13} />
                <span>Đặt lại</span>
              </button>
            )}

            <button
              onClick={() => setIsVisible(false)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 text-xs font-medium transition-colors cursor-pointer"
              title="Ẩn khối đề xuất"
            >
              <X size={14} />
              <span>Ẩn</span>
            </button>
          </div>
        </div>

        {/* NEWCOMER EXPERIENCE */}
        {isNewGuest && (
          <div className="pt-6 space-y-6">
            
            {/* 1. Welcome Voucher & Countdown Banner */}
            <div className="rounded-xl bg-slate-900/90 border border-amber-500/40 p-5 sm:p-6 relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                    <Sparkles size={12} className="text-amber-400" />
                    <span>ƯU ĐÃI CHUYẾN ĐẦU TIÊN</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Giảm ngay 25% (tối đa 60.000đ) khi đặt vé lần đầu
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Áp dụng cho tất cả các tuyến xe khởi hành từ <strong className="text-cyan-300">{currentCityName}</strong>. Cam kết giữ chỗ 100%, hoàn tiền nhanh chóng.
                  </p>
                </div>

                {/* Voucher Box & Countdown */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
                  <div className="p-3 rounded-xl bg-slate-800 border border-amber-500/40 flex items-center justify-between gap-3 shadow-sm">
                    <div>
                      <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Tag size={11} />
                        <span>Mã ưu đãi</span>
                      </div>
                      <div className="text-lg font-black text-white font-mono tracking-wider">
                        BANMOI25
                      </div>
                    </div>
                    <button
                      onClick={handleCopyVoucher}
                      className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      {copiedVoucher ? <Check size={14} className="stroke-[3]" /> : <Copy size={14} />}
                      <span>{copiedVoucher ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>

                  {/* Countdown Timer */}
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-center px-4">
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
            <div className="rounded-xl bg-slate-900/60 border border-slate-700 p-5 sm:p-6 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wide">
                    <HelpCircle size={14} />
                    <span>Cẩm nang cho khách mới</span>
                  </div>
                  <h4 className="text-base font-bold text-white">
                    3 Bước đặt vé xe khách tiện lợi & an toàn
                  </h4>
                </div>
                <div className="text-xs text-slate-400">
                  Nhấp vào từng bước để xem kinh nghiệm chọn xe
                </div>
              </div>

              {/* Stepper Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setActiveGuideStep(1)}
                  className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer flex items-start gap-3 ${
                    activeGuideStep === 1
                      ? 'bg-slate-800 border-cyan-400 shadow-sm text-white ring-1 ring-cyan-400'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    activeGuideStep === 1 ? 'bg-cyan-400 text-slate-950 font-black' : 'bg-slate-700 text-slate-300'
                  }`}>
                    1
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">1. Chọn Tuyến & Ngày Đi</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Gợi ý từ vị trí {currentCityName}</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveGuideStep(2)}
                  className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer flex items-start gap-3 ${
                    activeGuideStep === 2
                      ? 'bg-slate-800 border-cyan-400 shadow-sm text-white ring-1 ring-cyan-400'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    activeGuideStep === 2 ? 'bg-cyan-400 text-slate-950 font-black' : 'bg-slate-700 text-slate-300'
                  }`}>
                    2
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">2. Chọn Hạng Xe & Ghế</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Mẹo chọn ghế êm, chống say xe</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveGuideStep(3)}
                  className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer flex items-start gap-3 ${
                    activeGuideStep === 3
                      ? 'bg-slate-800 border-cyan-400 shadow-sm text-white ring-1 ring-cyan-400'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    activeGuideStep === 3 ? 'bg-cyan-400 text-slate-950 font-black' : 'bg-slate-700 text-slate-300'
                  }`}>
                    3
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">3. Thanh Toán & Vé QR</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Quét mã lên xe, không cần in vé</p>
                  </div>
                </button>
              </div>

              {/* Step Content */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-800 border border-slate-700">
                {activeGuideStep === 1 && (
                  <div className="space-y-3">
                    <h6 className="text-sm font-bold text-white flex items-center gap-2">
                      <MapPin size={16} className="text-cyan-400" />
                      <span>Bước 1: Tra cứu chuyến xe theo điểm xuất phát gần bạn</span>
                    </h6>
                    <p className="text-xs text-slate-300">
                      Hệ thống tự động phát hiện điểm khởi hành tại <strong className="text-white">{currentCityName}</strong>. Chọn nhanh tuyến đường bạn muốn đi:
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs text-slate-400 font-semibold mr-1">Tuyến phổ biến:</span>
                      {hotDestinations.map((dest) => (
                        <button
                          key={dest}
                          onClick={() => handleQuickRouteSelect(currentCityName, dest)}
                          className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-650 hover:bg-slate-600 border border-slate-600 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{currentCityName} → {dest}</span>
                          <ArrowRight size={12} />
                        </button>
                      ))}
                    </div>

                    <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-700/50 text-xs text-slate-200 flex items-start gap-2">
                      <Zap size={15} className="text-cyan-400 shrink-0 mt-0.5" />
                      <span><strong>Kinh nghiệm:</strong> Bạn nên chọn giờ xuất phát từ <strong>20h00 đến 22h30</strong>. Nghỉ ngơi trọn vẹn trên xe và đến nơi lúc 5h30 sáng hôm sau để bắt đầu ngày mới thuận lợi.</span>
                    </div>
                  </div>
                )}

                {activeGuideStep === 2 && (
                  <div className="space-y-3">
                    <h6 className="text-sm font-bold text-white flex items-center gap-2">
                      <Bus size={16} className="text-cyan-400" />
                      <span>Bước 2: Phân biệt các hạng xe & Kinh nghiệm chống say xe</span>
                    </h6>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 space-y-1">
                        <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                          <span>👑</span>
                          <span>Limousine 24 Phòng VIP</span>
                        </div>
                        <p className="text-[11px] text-slate-300">Cabin biệt lập có rèm riêng, màn hình TV, nệm massage. Tối ưu cho người thích không gian riêng tư.</p>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 space-y-1">
                        <div className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                          <span>✨</span>
                          <span>Limousine 34 Phòng</span>
                        </div>
                        <p className="text-[11px] text-slate-300">Không gian thoáng đãng, sạc điện thoại Type-C, wifi tốc độ cao. Lựa chọn phổ biến cho dân văn phòng.</p>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 space-y-1">
                        <div className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                          <span>💰</span>
                          <span>Giường Nằm Tiêu Chuẩn</span>
                        </div>
                        <p className="text-[11px] text-slate-300">Chi phí tiết kiệm, giảm xóc bóng hơi êm ái. Phù hợp cho sinh viên và du lịch nhóm.</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-semibold mb-0.5">Vị trí ghế ít say xe nhất:</strong>
                        Ưu tiên chọn ghế <strong>Tầng 1 (Tầng dưới)</strong>, khu vực từ <strong>hàng số 03 đến số 06</strong> (ở trọng tâm thân xe). Vị trí này ít rung lắc và cách xa động cơ phía sau.
                      </div>
                    </div>
                  </div>
                )}

                {activeGuideStep === 3 && (
                  <div className="space-y-3">
                    <h6 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-400" />
                      <span>Bước 3: Thanh toán an toàn & Lên xe bằng vé điện tử</span>
                    </h6>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 space-y-1">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-cyan-400" />
                          <span>Thanh toán đa kênh nhanh chóng</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Hỗ trợ VNPay QR, chuyển khoản ngân hàng VietQR, Thẻ ATM/Visa/MasterCard. Hệ thống giữ chỗ trong 5 phút để bạn xác nhận an toàn.
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 space-y-1">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-emerald-400" />
                          <span>Vé điện tử QR gửi qua SMS / Email</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Ngay sau khi thanh toán, mã QR vé sẽ gửi vào điện thoại. Khi lên xe, bạn chỉ cần đưa màn hình cho tài xế quét trong 3 giây.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <PhoneCall size={16} className="text-cyan-400 shrink-0" />
                        <span>Tổng đài hỗ trợ hành khách 24/7: <strong className="text-white">1900 1234</strong></span>
                      </div>
                      <button
                        onClick={() => navigate('/search')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shrink-0 cursor-pointer transition-colors"
                      >
                        Tra cứu vé ngay
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Transit Guide */}
            <div className="rounded-xl bg-slate-900/60 border border-slate-700 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Compass size={18} />
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>Điểm đón trả & Xe trung chuyển tại {currentCityName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 font-medium">Trung chuyển</span>
                  </h5>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Nhiều nhà xe có xe trung chuyển đón tận nơi tại các quận nội thành hoặc bến xe trung tâm của {currentCityName}. Tài xế sẽ gọi điện thông báo trước 30-45 phút trước giờ khởi hành.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/search?departure=' + encodeURIComponent(currentCityName))}
                className="px-3.5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs border border-slate-600 transition-colors flex items-center gap-1.5 shrink-0 self-end md:self-auto cursor-pointer"
              >
                <span>Xem lịch đón {currentCityName}</span>
                <ChevronRight size={14} />
              </button>
            </div>

          </div>
        )}

        {/* RECOMMENDATIONS GRID */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400" />
              <span>
                {isNewGuest
                  ? `Chuyến xe khởi hành từ ${currentCityName} được đặt nhiều`
                  : `Chuyến đi gợi ý cho bạn (${currentCityName})`}
              </span>
            </h4>
            <span className="text-xs text-slate-400 font-medium">
              {recommendations.length} chuyến xe tối ưu
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((trip) => {
              const scorePercent = Math.round((trip.matchScore ?? 0.8) * 100);

              return (
                <div
                  key={trip.tripId}
                  className="rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 p-4 sm:p-5 flex flex-col justify-between transition-colors shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/20 text-[11px] font-semibold text-cyan-300 border border-blue-500/30">
                        <Sparkles size={11} className="text-cyan-400" />
                        <span>Đề xuất</span>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {isNewGuest ? `4.9/5 đánh giá` : `Khớp ${scorePercent}%`}
                      </span>
                    </div>

                    <div className="flex items-center justify-end text-[11px] font-medium text-emerald-400 gap-1 mb-2">
                      <Users size={12} />
                      <span>Còn {trip.availableSeats} chỗ</span>
                    </div>

                    {/* Route From -> To */}
                    <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base mb-1">
                      <span className="text-cyan-300">{trip.departureLocation}</span>
                      <ArrowRight size={14} className="text-slate-400 shrink-0" />
                      <span>{trip.arrivalLocation}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                      <Clock size={13} className="text-slate-400" />
                      <span>{formatTime(trip.departureTime)}</span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-xs text-slate-300 font-medium mb-3">
                      <Bus size={12} className="text-slate-400 shrink-0" />
                      <span className="truncate">{trip.vehicleType}</span>
                    </div>

                    <div className="rounded-lg bg-slate-800/80 border border-slate-700/80 p-2.5 text-xs text-slate-300 mb-3">
                      <p className="text-[11px] leading-relaxed">
                        {trip.reason || (isNewGuest 
                          ? `Tuyến xe từ ${currentCityName} có chất lượng dịch vụ cao, độ rung lắc thấp, êm ái.` 
                          : trip.badgeText || 'Phù hợp với thói quen di chuyển và khung giờ ưa thích của bạn.')}
                      </p>
                    </div>

                    <div className="text-[11px] text-amber-300 font-medium leading-relaxed mb-4">
                      {isNewGuest ? `Mã BANMOI25 giảm thêm 25%` : trip.badgeText}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Giá vé từ</div>
                      <div className="text-base font-black text-cyan-300 tracking-tight tabular-nums">
                        {formatPrice(trip.price)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectTrip(trip)}
                      className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap"
                    >
                      <span>{isNewGuest ? 'Đặt vé ưu đãi' : 'Chọn chuyến'}</span>
                      <ArrowRight size={13} className="shrink-0" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Guarantees */}
        <div className="mt-8 pt-4 border-t border-slate-700 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            <span>Cam kết giữ đúng 100% số ghế • Hoàn tiền 150% nếu nhà xe hủy chuyến</span>
          </div>
          <div className="flex items-center gap-2">
            <HeartHandshake size={16} className="text-cyan-400 shrink-0" />
            <span>Hệ thống phân phối vé xe khách liên tỉnh chính hãng</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default PersonalizedDiscoveryShelf;
