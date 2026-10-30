import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bus, User, ChevronDown, PhoneCall, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [supportDropdownOpen, setSupportDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-slate-950/85 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand Logo with Glow */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
                <Bus className="text-cyan-400 group-hover:scale-110 transition-transform" size={20} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-wider uppercase font-mono flex items-center gap-1.5">
                VEXE
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-sans font-semibold border border-cyan-500/30">AI</span>
              </span>
              <span className="text-[9px] text-slate-400 tracking-tight font-medium hidden sm:block">Nền tảng đặt vé thế hệ mới</span>
            </div>
          </Link>

          {/* Navigation Links with Glass Dropdowns */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/') ? 'text-white bg-white/10 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Trang chủ
            </Link>

            <Link 
              to="/search" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/search') ? 'text-white bg-white/10 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Tra cứu chuyến xe
            </Link>

            {/* Về VEXE Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setAboutDropdownOpen(true)}
              onMouseLeave={() => setAboutDropdownOpen(false)}
            >
              <button 
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <span>Về VEXE</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${aboutDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {aboutDropdownOpen && (
                <div className="absolute top-full left-0 w-56 pt-2 z-50 animate-fadeIn">
                  <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-2 space-y-1">
                    <Link
                      to="/about"
                      onClick={() => setAboutDropdownOpen(false)}
                      className="block px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <div className="text-white font-bold">Giới thiệu & Sứ mệnh</div>
                      <div className="text-[11px] text-slate-400 font-normal">Hành trình số hóa vận tải hành khách</div>
                    </Link>
                    <Link
                      to="/achievements"
                      onClick={() => setAboutDropdownOpen(false)}
                      className="block px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <div className="text-cyan-300 font-bold flex items-center gap-1">
                        <Sparkles size={12} />
                        <span>Thành tích & Đối tác</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-normal">1.500.000+ vé và 100+ nhà xe hợp tác</div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Hỗ trợ Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setSupportDropdownOpen(true)}
              onMouseLeave={() => setSupportDropdownOpen(false)}
            >
              <button 
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <span>Hỗ trợ & Liên hệ</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${supportDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {supportDropdownOpen && (
                <div className="absolute top-full left-0 w-60 pt-2 z-50 animate-fadeIn">
                  <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-2 space-y-1">
                    <Link
                      to="/contact"
                      onClick={() => setSupportDropdownOpen(false)}
                      className="block px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <div className="text-white font-bold flex items-center gap-1.5">
                        <PhoneCall size={12} className="text-cyan-400" />
                        <span>Liên hệ & Bến xe</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-normal">Hotline 24/7 và mạng lưới bến đỗ</div>
                    </Link>
                    <Link
                      to="/faq"
                      onClick={() => setSupportDropdownOpen(false)}
                      className="block px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <div className="text-white font-bold">Hỏi đáp & Đổi trả vé</div>
                      <div className="text-[11px] text-slate-400 font-normal">Quy định hoàn tiền và bảo vệ khách</div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-300 hidden sm:inline">
                  Chào, <span className="text-white font-bold">{user?.fullName || user?.email}</span>
                </span>

                <button 
                  onClick={() => navigate('/profile')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  Hồ sơ
                </button>

                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-300 shadow-md shadow-blue-500/20 hover:shadow-cyan-500/30 cursor-pointer"
              >
                <User size={15} />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
