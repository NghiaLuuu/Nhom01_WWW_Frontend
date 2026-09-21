import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowRight, Sparkles, Navigation } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [date, setDate] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (departure && arrival && date) {
      navigate(`/search?departure=${encodeURIComponent(departure)}&arrival=${encodeURIComponent(arrival)}&date=${date}`);
    }
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
        
        /* Cải thiện date picker icon màu trắng */
        ::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.6;
          cursor: pointer;
        }
        ::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
      `}</style>

      {/* Cinematic Hero Section */}
      <div className="relative min-h-[100vh] lg:min-h-[800px] flex items-center overflow-hidden pt-20">
        
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

        <div className="relative z-10 px-6 sm:px-12 lg:px-24 max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Side: Typography */}
          <div className={`lg:col-span-7 space-y-8 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-cyan-300 text-sm font-semibold w-fit animate-float">
              <Sparkles size={16} />
              <span>Tiên phong trải nghiệm du lịch số</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.15] tracking-tight text-balance">
              Khám phá hành trình <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 drop-shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                tuyệt vời&nbsp;nhất
              </span>
            </h1>
            
            <p className="text-slate-300 text-lg md:text-xl max-w-xl leading-relaxed font-light">
              Hệ thống đặt vé xe trực tuyến đẳng cấp. Trải nghiệm dịch vụ sang trọng, an toàn và nhanh chóng trên mọi nẻo đường, được thiết kế riêng cho bạn.
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
          <div className={`lg:col-span-5 relative z-20 w-full max-w-[480px] mx-auto lg:ml-auto transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="relative group rounded-[2.5rem]">
              {/* Glowing aura */}
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/40 to-cyan-500/40 rounded-[2.5rem] blur-2xl opacity-60 group-hover:opacity-80 transition duration-1000 animate-pulse-glow pointer-events-none"></div>
              
              {/* Glass Card */}
              <div className="relative bg-slate-900/50 backdrop-blur-3xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl overflow-hidden">
                {/* Refection lines */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                
                <h2 className="text-3xl font-bold text-white mb-2">Bạn muốn đi đâu?</h2>
                <p className="text-sm text-slate-400 mb-8">Điền thông tin chuyến đi của bạn</p>
                
                <form onSubmit={handleSearch} className="flex flex-col gap-5">
                  
                  {/* Departure */}
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
                        value={departure}
                        onChange={(e) => setDeparture(e.target.value)}
                        placeholder="Ví dụ: Sài Gòn" 
                        className="w-full pl-12 pr-4 py-4 bg-white/5 hover:bg-white/[0.08] focus:bg-white/10 border border-white/10 focus:border-blue-400/60 rounded-2xl text-white text-base placeholder:text-slate-500 transition-all outline-none focus:ring-4 focus:ring-blue-500/15 relative z-0"
                      />
                    </div>
                  </div>
                  
                  {/* Arrival */}
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
                        value={arrival}
                        onChange={(e) => setArrival(e.target.value)}
                        placeholder="Ví dụ: Đà Lạt" 
                        className="w-full pl-12 pr-4 py-4 bg-white/5 hover:bg-white/[0.08] focus:bg-white/10 border border-white/10 focus:border-blue-400/60 rounded-2xl text-white text-base placeholder:text-slate-500 transition-all outline-none focus:ring-4 focus:ring-blue-500/15 relative z-0"
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div className="space-y-2 group/input">
                    <label className="text-xs font-bold tracking-wider text-slate-300 uppercase pl-1">
                      Ngày đi
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
                    className="group/btn relative w-full mt-4 overflow-hidden rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.7)] transition-all duration-300 active:scale-[0.98]"
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
      
      {/* Decorative transition to next section (if any) */}
      <div className="h-24 bg-slate-950"></div>
    </div>
  );
};
