import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  Navigation, 
  Clock, 
  Bus, 
  ShieldCheck, 
  Zap, 
  TrendingUp 
} from 'lucide-react';
import { BookingService, type RouteLocations } from '../api/booking.service';
import { type Route } from '../../admin/api/route.service';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [date, setDate] = useState(() => {
    // Mặc định là ngày hôm nay dạng YYYY-MM-DD
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [locations, setLocations] = useState<RouteLocations>({ departures: [], arrivals: [] });
  const [popularRoutes, setPopularRoutes] = useState<Route[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  useEffect(() => {
    setIsLoaded(true);

    // Tải danh sách địa điểm gợi ý từ Backend API
    BookingService.getRouteLocations().then(res => {
      if (res.success && res.data) {
        setLocations(res.data);
      }
    });

    // Tải danh sách tuyến đường phổ biến cho khách hàng
    setLoadingRoutes(true);
    BookingService.getActiveRoutes().then(res => {
      if (res.success && res.data) {
        setPopularRoutes(res.data);
      }
    }).finally(() => {
      setLoadingRoutes(false);
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (departure && arrival) {
      navigate(`/search?departure=${encodeURIComponent(departure)}&arrival=${encodeURIComponent(arrival)}&date=${date}`);
    }
  };

  const handleSelectPopularRoute = (route: Route) => {
    navigate(`/search?departure=${encodeURIComponent(route.departureLocation)}&arrival=${encodeURIComponent(route.arrivalLocation)}&date=${date}`);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + 'đ';
  };

  return (
    <div className="w-full relative overflow-hidden bg-slate-950 font-sans selection:bg-blue-500/30">
      <style>{`
        @keyframes kenburns-slow {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.05) translate(-1%, -1%); }
          100% { transform: scale(1) translate(0, 0); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulse-glow-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @keyframes shine {
          100% { left: 200%; }
        }
        
        .bg-kenburns {
          animation: kenburns-slow 40s ease-in-out infinite;
        }
        .animate-float {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow-slow 4s ease-in-out infinite;
        }
        
        ::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.6;
          cursor: pointer;
        }
        ::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
      `}</style>

      {/* Datalists hỗ trợ autocomplete gợi ý địa điểm từ Database */}
      <datalist id="departures-list">
        {locations.departures.map((item, idx) => (
          <option key={idx} value={item} />
        ))}
      </datalist>

      <datalist id="arrivals-list">
        {locations.arrivals.map((item, idx) => (
          <option key={idx} value={item} />
        ))}
      </datalist>

      {/* Cinematic Hero Section */}
      <div className="relative min-h-[calc(100vh-64px)] lg:min-h-[750px] flex items-center overflow-hidden">
        
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-kenburns scale-105 origin-center"
            style={{ backgroundImage: `url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop)` }}
          />
          {/* Complex Gradients for Depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/70 to-blue-950/60 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-80 mix-blend-screen" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative z-10 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pt-8 pb-16">
          
          {/* Left Side: Typography */}
          <div className={`lg:col-span-7 space-y-8 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-cyan-300 text-sm font-semibold w-fit animate-float">
              <Sparkles size={16} />
              <span>Tiên phong trải nghiệm du lịch số</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.15] tracking-tight text-balance">
              Khám phá hành trình{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 drop-shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                tuyệt vời&nbsp;nhất
              </span>
            </h1>
            
            <p className="text-slate-300 text-lg md:text-xl max-w-xl leading-relaxed font-light">
              Hệ thống đặt vé xe trực tuyến đẳng cấp. Trực quan sơ đồ ghế, giữ chỗ an toàn trong 5 phút và thanh toán bảo mật tức thì.
            </p>

            <div className="flex gap-6 items-center pt-4 opacity-80">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-12 h-12 rounded-full border-2 border-slate-900 object-cover" />
                ))}
              </div>
              <div className="text-sm text-slate-300">
                <span className="font-bold text-white block">Hơn 500.000+</span> 
                Hành khách tin dùng
              </div>
            </div>
          </div>

          {/* Right Side: Glassmorphism Search Box */}
          <div className={`lg:col-span-5 relative z-20 w-full max-w-[480px] mx-auto transition-all duration-500 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="relative group rounded-[2.5rem]">
              {/* Glowing aura */}
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/40 to-cyan-500/40 rounded-[2.5rem] blur-2xl opacity-60 group-hover:opacity-80 transition duration-1000 animate-pulse-glow pointer-events-none"></div>
              
              {/* Glass Card */}
              <div className="relative bg-slate-900/60 backdrop-blur-3xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                
                <h2 className="text-3xl font-bold text-white mb-2">Bạn muốn đi đâu?</h2>
                <p className="text-sm text-slate-400 mb-8">Tra cứu nhanh tuyến và chuyến xe hôm nay</p>
                
                <form onSubmit={handleSearch} className="flex flex-col gap-5">
                  
                  {/* Điểm đi */}
                  <div className="space-y-2 group/input">
                    <label className="text-xs font-bold tracking-wider text-slate-300 uppercase pl-1">
                      Điểm đi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-blue-400 transition-colors z-10">
                        <Navigation size={18} className="transform -rotate-45" />
                      </div>
                      <input 
                        type="text" 
                        required
                        list="departures-list"
                        value={departure}
                        onChange={(e) => setDeparture(e.target.value)}
                        placeholder="Ví dụ: Hồ Chí Minh" 
                        className="w-full pl-12 pr-4 py-4 bg-white/5 hover:bg-white/[0.08] focus:bg-white/10 border border-white/10 focus:border-blue-400/60 rounded-2xl text-white text-base placeholder:text-slate-500 transition-all outline-none focus:ring-4 focus:ring-blue-500/15 relative z-0"
                      />
                    </div>
                  </div>
                  
                  {/* Điểm đến */}
                  <div className="space-y-2 group/input">
                    <label className="text-xs font-bold tracking-wider text-slate-300 uppercase pl-1">
                      Điểm đến
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-blue-400 transition-colors z-10">
                        <MapPin size={18} />
                      </div>
                      <input 
                        type="text" 
                        required
                        list="arrivals-list"
                        value={arrival}
                        onChange={(e) => setArrival(e.target.value)}
                        placeholder="Ví dụ: Đà Lạt" 
                        className="w-full pl-12 pr-4 py-4 bg-white/5 hover:bg-white/[0.08] focus:bg-white/10 border border-white/10 focus:border-blue-400/60 rounded-2xl text-white text-base placeholder:text-slate-500 transition-all outline-none focus:ring-4 focus:ring-blue-500/15 relative z-0"
                      />
                    </div>
                  </div>

                  {/* Ngày đi */}
                  <div className="space-y-2 group/input">
                    <label className="text-xs font-bold tracking-wider text-slate-300 uppercase pl-1">
                      Ngày khởi hành
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-blue-400 transition-colors z-10">
                        <Calendar size={18} />
                      </div>
                      <input 
                        type="date" 
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 hover:bg-white/[0.08] focus:bg-white/10 border border-white/10 focus:border-blue-400/60 rounded-2xl text-white text-base transition-all outline-none focus:ring-4 focus:ring-blue-500/15 relative z-0"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    className="group/btn relative w-full mt-3 overflow-hidden rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.7)] transition-all duration-300 active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 w-full h-full pointer-events-none">
                      <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[30deg] group-hover/btn:animate-[shine_1s_ease-in-out]"></div>
                    </div>
                    <div className="relative py-4 flex items-center justify-center gap-2">
                      <Search size={20} className="group-hover/btn:scale-110 transition-transform duration-300" />
                      <span>Tìm Vé Chuyến Đi</span>
                      <ArrowRight size={18} className="absolute right-6 opacity-0 -translate-x-4 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
                    </div>
                  </button>

                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: TUYẾN ĐƯỜNG PHỔ BIẾN (TRA CỨU DANH SÁCH TUYẾN CHO KHÁCH) */}
      <section className="py-20 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <TrendingUp size={14} />
              <span>Tuyến xe nổi bật</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Các tuyến đường được đặt nhiều nhất
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Khám phá các tuyến xe liên tỉnh kết nối các điểm du lịch và kinh tế hàng đầu.
            </p>
          </div>

          <button
            onClick={() => navigate('/search?tab=routes')}
            className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm flex items-center gap-1.5 transition-colors group"
          >
            <span>Xem tất cả tuyến đường</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loadingRoutes ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 bg-slate-900/60 rounded-3xl border border-white/5 animate-pulse"></div>
            ))}
          </div>
        ) : popularRoutes.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            Chưa có tuyến đường nào được kích hoạt.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRoutes.slice(0, 6).map((route) => (
              <div
                key={route.id}
                onClick={() => handleSelectPopularRoute(route)}
                className="group cursor-pointer bg-slate-900/50 hover:bg-slate-900/80 border border-white/10 hover:border-blue-500/50 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-blue-500/10 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                      <Bus size={20} />
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      Đang khai thác
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                      <span>{route.departureLocation}</span>
                      <ArrowRight size={16} className="text-slate-500 group-hover:text-cyan-300 transition-colors" />
                      <span>{route.arrivalLocation}</span>
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                      {route.distanceKm && (
                        <span>{route.distanceKm} km</span>
                      )}
                      {route.durationMinutes && (
                        <span>{Math.floor(route.durationMinutes / 60)}h {route.durationMinutes % 60}p</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Giá vé từ</span>
                    <span className="text-lg font-black text-blue-400">
                      {formatCurrency(route.basePrice)}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white bg-blue-600/20 group-hover:bg-blue-600 px-3 py-1.5 rounded-xl transition-all">
                    Tìm chuyến
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Decorative transition */}
      <div className="h-12 bg-slate-950"></div>
    </div>
  );
};
