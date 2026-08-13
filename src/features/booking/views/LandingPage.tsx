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
      {/* Hero Section */}
      <div className="relative bg-blue-700 pt-24 pb-32 flex items-center justify-center">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
          <div className="absolute top-12 -right-12 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            VEXE - Đặt vé xe chất lượng cao <br className="hidden md:block"/> nhanh chóng & an toàn
          </h1>
          <p className="text-blue-100 text-lg md:text-xl mb-12">
            Hệ thống xe khách hàng đầu với hơn 1000+ chuyến xe mỗi ngày.
          </p>
        </div>
      </div>

      {/* Search Box */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/10 p-6 md:p-8 border border-gray-100">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/3 space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                <MapPin size={16} className="text-blue-500"/>
                <span>Điểm đi</span>
              </label>
              <input 
                type="text" 
                required
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                placeholder="Ví dụ: Sài Gòn" 
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
            </div>
            
            <div className="w-full md:w-1/3 space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                <MapPin size={16} className="text-red-500"/>
                <span>Điểm đến</span>
              </label>
              <input 
                type="text" 
                required
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
                placeholder="Ví dụ: Đà Lạt" 
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
            </div>

            <div className="w-full md:w-1/4 space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                <Calendar size={16} className="text-blue-500"/>
                <span>Ngày đi</span>
              </label>
              <input 
                type="date" 
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
            </div>

            <div className="w-full md:w-auto mt-4 md:mt-0">
              <button 
                type="submit"
                className="w-full md:w-auto h-12 md:h-[52px] px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center space-x-2"
              >
                <Search size={20} />
                <span>Tìm Vé</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Some padding for the bottom of the page */}
      <div className="h-32"></div>
    </div>
  );
};
