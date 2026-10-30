import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Bus, 
  Award, 
  Users, 
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
  const [userLocation, setUserLocation] = useState<UserLocationResult | null>(geolocationService.getStoredLocation());
  const [departure, setDeparture] = useState(() => {
    const loc = geolocationService.getStoredLocation();
    return loc ? loc.city : '';
  });
  const [arrival, setArrival] = useState('');
  const [date, setDate] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showScrollSearch, setShowScrollSearch] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);

  useEffect(() => {
    setIsLoaded(true);

    const handleLocationUpdate = (e: any) => {
      const loc = e.detail as UserLocationResult | null;
      setUserLocation(loc);
      if (loc?.city) {
        setDeparture(loc.city);
      }
    };

    window.addEventListener('vexe_location_updated', handleLocationUpdate);

    const handleScroll = () => {
      if (window.scrollY > 400) {
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
    <div className="w-full relative overflow-hidden bg-slate-950 font-sans selection:bg-cyan-500/30 text-slate-100">
      
      {/* Cinematic Hero Section - Brand & Prestige Focused */}
      <section className="relative min-h-[calc(100vh-64px)] lg:min-h-[780px] flex items-center overflow-hidden">
        
        {/* Background Layer with Dark Vignette */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 origin-center transition-transform duration-1000"
            style={{ backgroundImage: `url(https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop)` }}
          />
          {/* Depth Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-blue-950/70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/15 via-transparent to-transparent opacity-70" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-950 to-transparent" />
        </div>

        <div className="relative z-10 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12">
          
          {/* Left Side: Brand Story & Impact */}
          <div className={`lg:col-span-7 space-y-6 sm:space-y-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-md text-cyan-300 text-xs sm:text-sm font-semibold w-fit shadow-lg shadow-cyan-950/30">
              <Sparkles size={16} className="text-cyan-400 animate-pulse" />
              <span>Chuẩn Mực Vận Tải Hành Khách 5 Sao Hàng Đầu</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.15] tracking-tight text-balance">
              Hành trình an toàn,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 drop-shadow-[0_0_25px_rgba(56,189,248,0.35)]">
                vạn dặm yêu thương
              </span>
            </h1>
            
            {/* Mission Statement */}
            <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed font-light">
              VEXE kết hợp đội xe Limousine hàng không mặt đất cùng trí tuệ nhân tạo AI pgvector để mang đến trải nghiệm di chuyển sang trọng, đúng giờ tuyệt đối và đúng gu của bạn.
            </p>

            {/* Credibility Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 max-w-xl text-xs text-slate-300">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                <span className="font-medium">Giữ đúng 100% số ghế</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Award size={16} className="text-cyan-400 shrink-0" />
                <span className="font-medium">Hoàn tiền 150% nếu hủy</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm col-span-2 sm:col-span-1">
                <Clock size={16} className="text-amber-400 shrink-0" />
                <span className="font-medium">99.8% đúng giờ xuất bến</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => setIsQuickSearchOpen(true)}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-cyan-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-2.5 cursor-pointer"
              >
                <Search size={18} className="text-slate-950 font-black" />
                <span>Bạn Muốn Đặt Vé? Tra Cứu Ngay</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => scrollToSection('section-fleet')}
                className="px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 hover:text-white font-semibold text-sm transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <Bus size={18} className="text-cyan-400" />
                <span>Khám phá Đội xe</span>
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img 
                    key={i} 
                    src={`https://i.pravatar.cc/100?img=${i+14}`} 
                    alt="Passenger" 
                    className="w-10 h-10 rounded-full border-2 border-slate-950 object-cover" 
                  />
                ))}
              </div>
              <div className="text-xs text-slate-400">
                <span className="font-bold text-white block">500.000+ Hành khách</span>
                Đã đặt vé và đồng hành an toàn cùng VEXE
              </div>
            </div>

          </div>

          {/* Right Side: Interactive Fleet & Luxury Cabin Preview */}
          <div className={`lg:col-span-5 relative transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative rounded-[2.5rem] bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/80 backdrop-blur-2xl border border-white/15 p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 space-y-6">
              
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Bus size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Khoang Phòng Limousine VIP</h3>
                    <p className="text-[11px] text-slate-400">Trải nghiệm máy bay mặt đất 5 sao</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold">
                  Đời Mới 2026
                </span>
              </div>

              {/* Cabin Photo Preview */}
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] border border-white/10 group">
                <img 
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop" 
                  alt="Cabin Limousine"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-4">
                  <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 mb-1">
                    <Sparkles size={13} />
                    <span>Nâng niu từng giấc ngủ êm ái</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-light">
                    Rèm che riêng tư tuyệt đối, nệm massage công thái học tiêu chuẩn châu Âu.
                  </p>
                </div>
              </div>

              {/* Amenities Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <Zap size={15} className="text-amber-400" />
                  <span className="text-slate-300">Cổng sạc Type-C 65W</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <Wifi size={15} className="text-cyan-400" />
                  <span className="text-slate-300">Wifi 5G tốc độ cao</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <Tv size={15} className="text-indigo-400" />
                  <span className="text-slate-300">TV màn hình cá nhân</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span className="text-slate-300">Nước & khăn miễn phí</span>
                </div>
              </div>

              {/* Instant Search Transition CTA */}
              <button
                onClick={() => navigate('/search')}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10 transition-colors cursor-pointer"
              >
                <span>Xem lịch khởi hành tất cả tuyến</span>
                <ChevronRight size={14} />
              </button>

            </div>
          </div>

        </div>
      </section>

      {/* Section 1: Company Impact & Verified Metrics */}
      <section id="section-highlights" className="py-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Award size={13} />
            <span>Năng Lực & Uy Tín VEXE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Những Con Số Khẳng Định Vị Thế Doanh Nghiệp
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-light">
            Chúng tôi xây dựng niềm tin trên từng ki-lô-mét bằng sự an toàn, chuẩn mực và công nghệ tiên phong.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { number: '1.500.000+', label: 'Vé Đã Phục Vụ', desc: 'Đồng hành cùng khách hàng từ năm 2018' },
            { number: '99.8%', label: 'Đúng Giờ Xuất Bến', desc: 'Kiểm soát lộ trình theo thời gian thực' },
            { number: '100+', label: 'Xe Limousine Đời Mới', desc: 'Bảo dưỡng định kỳ theo tiêu chuẩn hãng' },
            { number: '63', label: 'Tỉnh Thành Kết Nối', desc: 'Mạng lưới bến bãi phủ khắp toàn quốc' }
          ].map((metric, idx) => (
            <div 
              key={idx}
              className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/40 transition-all duration-300 shadow-xl group text-center"
            >
              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-mono tracking-tight group-hover:scale-105 transition-transform">
                {metric.number}
              </div>
              <div className="font-bold text-white text-sm sm:text-base mt-2">
                {metric.label}
              </div>
              <div className="text-xs text-slate-400 font-light mt-1">
                {metric.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Fleet Showcase (Đội xe công nghệ 5 sao) */}
      <section id="section-fleet" className="py-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Bus size={13} />
              <span>Đội Xe Hiện Đại</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Đẳng Cấp Trên Từng Dòng Xe VEXE
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-light">
              Mỗi dòng xe được trang bị công nghệ giảm xóc bóng hơi và lọc khí ion âm giúp hành khách không say xe.
            </p>
          </div>

          <button
            onClick={() => navigate('/search')}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-cyan-300 hover:text-white transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <span>Tra cứu theo dòng xe</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Limousine VIP 24 Phòng',
              badge: 'Hạng Nhất (First Class)',
              image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop',
              features: ['Cabin đôi & đơn biệt lập', 'Ghế massage không trọng lực', 'Màn hình Smart TV 24 inch', 'Thực đơn đồ uống miễn phí']
            },
            {
              title: 'Limousine Cung Điện 34 Phòng',
              badge: 'Thương Gia (Business Class)',
              image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop',
              features: ['Rèm che riêng tư', 'Đèn đọc sách tùy chỉnh', 'Cổng sạc Type-C 65W', 'Chăn gối kháng khuẩn']
            },
            {
              title: 'Xe Giường Nằm 45 Chỗ',
              badge: 'Tiêu Chuẩn (Comfort Class)',
              image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop',
              features: ['Giường đệm êm ái', 'Hệ thống điều hòa 2 chiều', 'Cốp hành lý rộng rãi', 'Bảo hiểm trọn chuyến đi']
            }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="rounded-3xl bg-slate-900/70 border border-white/10 hover:border-cyan-500/40 p-6 flex flex-col justify-between space-y-6 transition-all duration-300 shadow-xl group hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden aspect-[16/10] border border-white/10">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/10 text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                    {item.badge}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight">
                  {item.title}
                </h3>

                <ul className="space-y-2 text-xs text-slate-300 font-light">
                  {item.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-cyan-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => navigate('/search')}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 font-bold text-xs transition-all border border-white/10 hover:border-cyan-400 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Xem lịch xe này</span>
                <ChevronRight size={13} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: AI & Persona Personalized Discovery Shelf */}
      <PersonalizedDiscoveryShelf />

      {/* Section 4: Golden Guarantees (Cam kết vàng VEXE) */}
      <section className="py-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="rounded-3xl bg-gradient-to-br from-cyan-950/30 via-slate-900/60 to-blue-950/30 border border-cyan-500/30 p-8 sm:p-12 shadow-2xl">
          <div className="max-w-2xl space-y-3 mb-10">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">Chính Sách Khách Hàng</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              4 Cam Kết Vàng Bảo Vệ Quyền Lợi Hành Khách
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-light">
              Chúng tôi hiểu rằng mỗi chuyến đi là một kế hoạch quan trọng của bạn và gia đình.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                title: 'Đổi Vé Miễn Phí',
                desc: 'Hỗ trợ thay đổi ngày đi hoặc hoàn tiền trước 24 giờ khởi hành trực tiếp qua ứng dụng.'
              },
              {
                icon: Headphones,
                title: 'Hỗ Trợ 24/7',
                desc: 'Đội ngũ tổng đài viên trực tuyến giải quyết mọi khiếu nại trong vòng 30 phút.'
              }
            ].map((card, cIdx) => {
              const Icon = card.icon;
              return (
                <div key={cIdx} className="p-5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Icon size={20} />
                  </div>
                  <h4 className="font-bold text-white text-sm">{card.title}</h4>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Floating / Sticky Quick Booking Dock (Xuất hiện khi lướt đọc) */}
      {showScrollSearch && (
        <aside 
          aria-label="Thanh tra cứu chuyến xe nhanh"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-4xl bg-slate-900/95 backdrop-blur-2xl border border-cyan-500/40 rounded-3xl p-3 sm:p-4 shadow-2xl shadow-cyan-950/60 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-2 sm:gap-3">
            
            <div className="flex-1 w-full relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" />
              <input 
                type="text"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                placeholder="Điểm đi (Sài Gòn)"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white/5 border border-white/10 focus:border-cyan-400 rounded-xl text-white outline-none"
              />
            </div>

            <div className="flex-1 w-full relative">
              <Compass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
              <input 
                type="text"
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
                placeholder="Điểm đến (Đà Lạt / Nha Trang)"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white/5 border border-white/10 focus:border-cyan-400 rounded-xl text-white outline-none"
              />
            </div>

            <div className="w-full md:w-44 relative">
              <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" />
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white/5 border border-white/10 focus:border-cyan-400 rounded-xl text-white outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
            >
              <Search size={15} />
              <span>Tìm chuyến</span>
            </button>

          </form>
        </aside>
      )}

      {/* Quick Search Modal triggered by "Bạn muốn đặt vé?" button */}
      {isQuickSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-cyan-500/40 p-6 sm:p-8 shadow-2xl relative space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Search size={18} className="text-cyan-400" />
                <span>Tra cứu vé xe chuyến đi của bạn</span>
              </div>
              <button 
                onClick={() => setIsQuickSearchOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase">Điểm khởi hành</label>
                  {userLocation && (
                    <span className="text-[11px] text-cyan-400 flex items-center gap-1 font-medium">
                      <MapPin size={11} /> Gần bạn: {userLocation.displayName}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
                  <input 
                    type="text"
                    required
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                    placeholder="Ví dụ: TP.HCM / Sài Gòn"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/15 focus:border-cyan-400 rounded-2xl text-white text-sm outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase">Điểm đến</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" />
                  <input 
                    type="text"
                    required
                    value={arrival}
                    onChange={(e) => setArrival(e.target.value)}
                    placeholder="Ví dụ: Đà Lạt / Nha Trang / Cần Thơ"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/15 focus:border-cyan-400 rounded-2xl text-white text-sm outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase">Ngày xuất bến</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
                  <input 
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/15 focus:border-cyan-400 rounded-2xl text-white text-sm outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/25 mt-2 cursor-pointer"
              >
                <Search size={18} />
                <span>Tìm Vé Chuyến Đi Ngay</span>
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Location Permission & Realtime Geolocation Prompt */}
      <LocationPermissionModal onLocationGranted={(loc) => setDeparture(loc.city)} />

      {/* Decorative Bottom Spacing */}
      <div className="h-20 bg-slate-950"></div>
    </div>
  );
};
