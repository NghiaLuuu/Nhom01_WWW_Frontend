import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [date, setDate] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (departure && arrival && date) {
      navigate(`/search?departure=${encodeURIComponent(departure)}&arrival=${encodeURIComponent(arrival)}&date=${date}`);
    }
  };

  return (
    <div className="w-full">
      {/* Asymmetric Hero Section */}
      <div className="relative pt-24 pb-32 min-h-[600px] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-bg.jpg" 
            alt="VEXE travel background" 
            className="w-full h-full object-cover" 
          />
          {/* Subtle gradient overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40"></div>
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Side: Typography */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight animate-fade-in-up">
              Khám phá hành trình <br className="hidden md:block"/>
              <span className="text-blue-400">tuyệt vời nhất</span>
            </h1>
            <p className="text-slate-200 text-lg md:text-xl max-w-lg leading-relaxed opacity-90">
              Hệ thống đặt vé xe trực tuyến hàng đầu. Trải nghiệm dịch vụ sang trọng, an toàn và nhanh chóng trên mọi nẻo đường.
            </p>
          </div>

          {/* Right Side: Search Box */}
          <div className="lg:col-span-5 relative z-20">
             <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 border border-white/20 animate-fade-in">
               <h2 className="text-2xl font-bold text-slate-900 mb-6">Bạn muốn đi đâu?</h2>
               <form onSubmit={handleSearch} className="flex flex-col gap-4">
                 
                 <div className="space-y-2">
                   <label className="text-sm font-semibold text-slate-700 flex items-center space-x-1">
                     <MapPin size={16} className="text-blue-600"/>
                     <span>Điểm đi</span>
                   </label>
                   <input 
                     type="text" 
                     required
                     value={departure}
                     onChange={(e) => setDeparture(e.target.value)}
                     placeholder="Ví dụ: Sài Gòn" 
                     className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                   />
                 </div>
                 
                 <div className="space-y-2">
                   <label className="text-sm font-semibold text-slate-700 flex items-center space-x-1">
                     <MapPin size={16} className="text-blue-600"/>
                     <span>Điểm đến</span>
                   </label>
                   <input 
                     type="text" 
                     required
                     value={arrival}
                     onChange={(e) => setArrival(e.target.value)}
                     placeholder="Ví dụ: Đà Lạt" 
                     className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                   />
                 </div>

                 <div className="space-y-2">
                   <label className="text-sm font-semibold text-slate-700 flex items-center space-x-1">
                     <Calendar size={16} className="text-blue-600"/>
                     <span>Ngày đi</span>
                   </label>
                   <input 
                     type="date" 
                     required
                     value={date}
                     onChange={(e) => setDate(e.target.value)}
                     className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700"
                   />
                 </div>

                 <button 
                   type="submit"
                   className="w-full h-[52px] mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm"
                 >
                   <Search size={20} />
                   <span>Tìm Vé Chuyến Đi</span>
                 </button>

               </form>
             </div>
          </div>
        </div>
      </div>
      
      {/* Some padding for the bottom of the page */}
      <div className="h-32 bg-slate-50"></div>
    </div>
  );
};
