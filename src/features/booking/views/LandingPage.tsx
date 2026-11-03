import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Bus, 
  Award, 
  Headphones, 
  CheckCircle2, 
  Tv, 
  Wifi, 
  Zap, 
  ChevronRight,
  X,
  Compass
} from 'lucide-react';

import { PersonalizedDiscoveryShelf } from '../components/PersonalizedDiscoveryShelf';
import { LocationPermissionModal } from '../components/LocationPermissionModal';
import { geolocationService, type UserLocationResult } from '../../../services/geolocation.service';
import { dispatchTrackAction } from '../../../hooks/useUserTracker';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [, setUserLocation] = useState<UserLocationResult | null>(geolocationService.getStoredLocation());
  const [departure, setDeparture] = useState(() => {
    const loc = geolocationService.getStoredLocation();
    return loc ? loc.city : '';
  });
  const [arrival, setArrival] = useState('');
  const [date, setDate] = useState('');
  const [showScrollSearch, setShowScrollSearch] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);

  useEffect(() => {
    const handleLocationUpdate = (e: any) => {
      const loc = e.detail as UserLocationResult | null;
      setUserLocation(loc);
      if (loc?.city) {
        setDeparture(loc.city);
      }
    };

    window.addEventListener('vexe_location_updated', handleLocationUpdate);

    const handleScroll = () => {
      if (window.scrollY > 450) {
        setShowScrollSearch(true);
      } else {
        setShowScrollSearch(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('vexe_location_updated', handleLocationUpdate);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatchTrackAction('HOME_HERO_SEARCH', { departure, arrival, date });

    const params = new URLSearchParams();
    if (departure.trim()) params.append('departure', departure.trim());
    if (arrival.trim()) params.append('arrival', arrival.trim());
    if (date.trim()) params.append('date', date.trim());

    navigate(`/search?${params.toString()}`);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full relative bg-[#0b1120] font-sans text-slate-100 antialiased">
      
      {/* Hero Section: Refined Navy / Dark Slate Atmosphere */}
      <section className="relative min-h-[640px] flex items-center bg-gradient-to-b from-slate-900 via-[#0e1726] to-[#0b1120] border-b border-slate-800 py-12 lg:py-16 overflow-hidden">
        
        {/* Subtle Background Photo with Soft Gradient */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-25">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop)` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1120] via-[#0b1120]/90 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Side: Brand Story & Impact */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-cyan-300 text-xs font-semibold w-fit">
                <Bus size={15} className="text-cyan-400" />
                <span>Nền tảng vé xe khách liên tỉnh tiện lợi & uy tín</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.2] tracking-tight">
                Hành trình an toàn,{' '}
                <span className="text-cyan-400">
                  vạn dặm yêu thương
                </span>
              </h1>
              
              <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
                Đặt vé xe Limousine và Giường nằm chất lượng cao nhanh chóng. Giữ đúng 100% số ghế, bảo hiểm chuyến đi trọn gói và hỗ trợ đổi trả linh hoạt.
              </p>

              {/* Credibility Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 max-w-xl text-xs text-slate-200">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/80 border border-slate-700 shadow-sm">
                  <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
                  <span className="font-semibold">Giữ đúng 100% số ghế</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/80 border border-slate-700 shadow-sm">
                  <Award size={18} className="text-cyan-400 shrink-0" />
                  <span className="font-semibold">Hoàn tiền 150% nếu hủy</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/80 border border-slate-700 shadow-sm">
                  <Clock size={18} className="text-amber-400 shrink-0" />
                  <span className="font-semibold">99.8% đúng giờ xuất bến</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setIsQuickSearchOpen(true)}
                  className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Search size={18} />
                  <span>Tra cứu lịch khởi hành</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => scrollToSection('section-fleet')}
                  className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Bus size={18} className="text-slate-400" />
                  <span>Khám phá các dòng xe</span>
                </button>
              </div>

            </div>

            {/* Right Side: Primary Search Card Embedded in Hero */}
            <div className="lg:col-span-5">
              <div className="bg-slate-800/95 border border-slate-700 p-6 sm:p-7 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-cyan-400 flex items-center justify-center font-bold">
                      <Search size={18} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">Tìm chuyến xe giá tốt</h2>
                      <p className="text-xs text-slate-400">Hơn 500+ chuyến xe mỗi ngày</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Trực tuyến 24/7
                  </span>
                </div>

                <form onSubmit={handleSearch} className="space-y-4 pt-4">
                  {/* Departure */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Điểm đi</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text"
                        value={departure}
                        onChange={(e) => setDeparture(e.target.value)}
                        placeholder="TP. Hồ Chí Minh, Hà Nội, Đà Lạt..."
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-400 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Điểm đến</label>
                    <div className="relative">
                      <Compass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text"
                        value={arrival}
                        onChange={(e) => setArrival(e.target.value)}
                        placeholder="Nha Trang, Vũng Tàu, Phú Yên..."
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-400 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Ngày đi</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-400 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Search Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                  >
                    <Search size={18} />
                    <span>Tìm Vé Xe Ngay</span>
                  </button>
                </form>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Section 1: Company Impact & Metrics */}
      <section id="section-highlights" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-cyan-300 text-xs font-semibold">
            <Award size={14} />
            <span>Uy Tín & Năng Lực Vận Tải</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Những Con Số Khẳng Định Vị Thế
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Chúng tôi xây dựng niềm tin trên từng ki-lô-mét bằng sự an toàn, chuẩn mực và văn minh.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { number: '1.500.000+', label: 'Vé Đã Phục Vụ', desc: 'Đồng hành cùng khách hàng từ năm 2018' },
            { number: '99.8%', label: 'Đúng Giờ Xuất Bến', desc: 'Kiểm soát lịch trình theo thời gian thực' },
            { number: '100+', label: 'Xe Limousine Đời Mới', desc: 'Bảo dưỡng định kỳ theo tiêu chuẩn hãng' },
            { number: '63', label: 'Tỉnh Thành Kết Nối', desc: 'Mạng lưới bến bãi phủ khắp toàn quốc' }
          ].map((metric, idx) => (
            <div 
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-slate-800 border border-slate-700 text-center flex flex-col justify-between shadow-sm"
            >
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono tracking-tight tabular-nums">
                {metric.number}
              </div>
              <div className="font-bold text-white text-xs sm:text-sm mt-2">
                {metric.label}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-400 mt-1">
                {metric.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Fleet Showcase */}
      <section id="section-fleet" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-cyan-300 text-xs font-semibold">
              <Bus size={14} />
              <span>Đội Xe Tiêu Chuẩn</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Đẳng Cấp Trên Từng Dòng Xe
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Mỗi dòng xe được trang bị hệ thống giảm xóc bóng hơi và lọc không khí ion âm giúp hành khách thoải mái suốt hành trình.
            </p>
          </div>

          <button
            onClick={() => navigate('/search')}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-cyan-300 transition-colors flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <span>Xem lịch trình chi tiết</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Limousine VIP 24 Phòng',
              badge: 'Hạng Nhất (VIP Room)',
              image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop',
              features: ['Cabin đôi & đơn biệt lập có rèm', 'Ghế massage công thái học', 'Màn hình Smart TV cá nhân', 'Nước uống & khăn ướt miễn phí']
            },
            {
              title: 'Limousine Cung Điện 34 Phòng',
              badge: 'Thương Gia (Business)',
              image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop',
              features: ['Rèm che riêng tư từng khoang', 'Đèn đọc sách cá nhân', 'Cổng sạc Type-C tốc độ cao', 'Chăn gối vô trùng sạch sẽ']
            },
            {
              title: 'Xe Giường Nằm 45 Chỗ',
              badge: 'Tiêu Chuẩn (Comfort)',
              image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop',
              features: ['Giường bọc da êm ái', 'Điều hòa 2 chiều mát lạnh', 'Cốp hành lý rộng rãi', 'Bảo hiểm hành khách trọn gói']
            }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="rounded-2xl bg-slate-800 border border-slate-700 p-5 flex flex-col justify-between space-y-5 shadow-sm"
            >
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden aspect-[16/10] border border-slate-700">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-slate-900/90 text-cyan-300 text-[10px] font-bold uppercase tracking-wide border border-slate-700">
                    {item.badge}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">
                  {item.title}
                </h3>

                <ul className="space-y-2 text-xs text-slate-300">
                  {item.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => navigate('/search')}
                className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-750 text-slate-200 hover:text-white font-bold text-xs transition-colors border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Xem các tuyến xe này</span>
                <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Personalized Discovery Shelf */}
      <PersonalizedDiscoveryShelf />

      {/* Section 4: Golden Guarantees */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800">
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6 sm:p-10 shadow-sm">
          <div className="max-w-2xl space-y-2 mb-8">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide">Chính Sách Khách Hàng</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              4 Cam Kết Vàng Bảo Vệ Quyền Lợi
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Chúng tôi hiểu rằng mỗi chuyến đi là một kế hoạch quan trọng của bạn và gia đình.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: ShieldCheck,
                title: 'Giữ Chỗ 100%',
                desc: 'Đặt số ghế nào, nhận đúng số ghế đó. Tuyệt đối không nhồi nhét hay bắt khách dọc đường.'
              },
              {
                icon: Award,
                title: 'Hoàn Tiền 150%',
                desc: 'Nếu nhà xe tự ý hủy chuyến hoặc không có xe đón đúng giờ, VEXE đền bù 150% giá vé.'
              },
              {
                icon: Clock,
                title: 'Đổi Vé Linh Hoạt',
                desc: 'Hỗ trợ thay đổi ngày đi hoặc hoàn tiền theo quy định nhà xe trực tiếp trên hệ thống.'
              },
              {
                icon: Headphones,
                title: 'Hỗ Trợ 24/7',
                desc: 'Đội ngũ tổng đài viên trực tuyến giải quyết mọi phát sinh nhanh chóng, tận tâm.'
              }
            ].map((card, cIdx) => {
              const Icon = card.icon;
              return (
                <div key={cIdx} className="p-5 rounded-xl bg-slate-900 border border-slate-700 space-y-2.5">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400">
                    <Icon size={20} />
                  </div>
                  <h4 className="font-bold text-white text-sm">{card.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Floating Sticky Quick Booking Dock */}
      {showScrollSearch && (
        <aside 
          aria-label="Thanh tra cứu chuyến xe nhanh"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-4xl bg-slate-800/95 backdrop-blur-md border border-slate-700 rounded-2xl p-3 sm:p-4 shadow-2xl"
        >
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-2 sm:gap-3">
            
            <div className="flex-1 w-full relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input 
                type="text"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                placeholder="Điểm đi (Sài Gòn)"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg text-white outline-none"
              />
            </div>

            <div className="flex-1 w-full relative">
              <Compass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input 
                type="text"
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
                placeholder="Điểm đến (Đà Lạt / Nha Trang)"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg text-white outline-none"
              />
            </div>

            <div className="w-full md:w-44 relative">
              <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg text-white outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer shadow-sm"
            >
              <Search size={15} />
              <span>Tìm chuyến</span>
            </button>

          </form>
        </aside>
      )}

      {/* Quick Search Modal */}
      {isQuickSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-800 border border-slate-700 p-6 sm:p-7 shadow-2xl relative space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Search size={18} className="text-cyan-400" />
                <span>Tra cứu vé xe chuyến đi của bạn</span>
              </div>
              <button 
                onClick={() => setIsQuickSearchOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Điểm khởi hành</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    required
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                    placeholder="Ví dụ: TP.HCM / Sài Gòn"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg text-white text-sm outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Điểm đến</label>
                <div className="relative">
                  <Compass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    required
                    value={arrival}
                    onChange={(e) => setArrival(e.target.value)}
                    placeholder="Ví dụ: Đà Lạt / Nha Trang / Cần Thơ"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg text-white text-sm outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Ngày xuất bến</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg text-white text-sm outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-md mt-2 cursor-pointer"
              >
                <Search size={18} />
                <span>Tìm Vé Chuyến Đi Ngay</span>
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Location Permission Prompt */}
      <LocationPermissionModal onLocationGranted={(loc) => setDeparture(loc.city)} />

      <div className="h-10"></div>
    </div>
  );
};

export default LandingPage;
