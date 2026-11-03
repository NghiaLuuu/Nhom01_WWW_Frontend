import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bus, User, ChevronDown, PhoneCall, HelpCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [supportDropdownOpen, setSupportDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-50 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
              <Bus size={22} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 tracking-tight font-sans flex items-center gap-1.5">
                VEXE
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-blue-50 text-blue-700 border border-blue-200/60 uppercase">
                  Việt Nam
                </span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:block">Hệ thống đặt vé xe liên tỉnh</span>
            </div>
          </Link>

          {/* Navigation Links: Trang chủ -> Giới thiệu -> Thành tích -> Tra cứu & Đặt vé -> Hỗ trợ & Liên hệ */}
          <nav className="hidden md:flex items-center space-x-1">
            
            {/* 1. Trang chủ */}
            <Link 
              to="/" 
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/') 
                  ? 'text-blue-700 bg-blue-50/90' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              Trang chủ
            </Link>

            {/* 2. Giới thiệu */}
            <Link 
              to="/about" 
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/about') 
                  ? 'text-blue-700 bg-blue-50/90' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              Giới thiệu
            </Link>

            {/* 3. Thành tích */}
            <Link 
              to="/achievements" 
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/achievements') 
                  ? 'text-blue-700 bg-blue-50/90' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              Thành tích
            </Link>

            {/* 4. Tra cứu & Đặt vé */}
            <Link 
              to="/search" 
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/search') 
                  ? 'text-blue-700 bg-blue-50/90' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              Tra cứu & Đặt vé
            </Link>

            {/* 5. Hỗ trợ & Liên hệ Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setSupportDropdownOpen(true)}
              onMouseLeave={() => setSupportDropdownOpen(false)}
            >
              <button 
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  isActive('/contact') || isActive('/faq')
                    ? 'text-blue-700 bg-blue-50/90'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <span>Hỗ trợ & Liên hệ</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${supportDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {supportDropdownOpen && (
                <div className="absolute top-full left-0 w-64 pt-2 z-50">
                  <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-2 space-y-1">
                    <Link
                      to="/contact"
                      onClick={() => setSupportDropdownOpen(false)}
                      className="block px-3 py-2.5 rounded-lg text-xs font-medium text-slate-700 hover:text-blue-700 hover:bg-blue-50/60 transition-colors"
                    >
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <PhoneCall size={14} className="text-blue-600" />
                        <span>Liên hệ & Bến xe</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal mt-0.5">Hotline 24/7 và mạng lưới bến đỗ</div>
                    </Link>
                    <Link
                      to="/faq"
                      onClick={() => setSupportDropdownOpen(false)}
                      className="block px-3 py-2.5 rounded-lg text-xs font-medium text-slate-700 hover:text-blue-700 hover:bg-blue-50/60 transition-colors"
                    >
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <HelpCircle size={14} className="text-blue-600" />
                        <span>Hỏi đáp & Đổi trả vé</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal mt-0.5">Quy định hoàn tiền và bảo vệ quyền lợi</div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-600 hidden sm:inline mr-1">
                  Chào, <span className="text-slate-900 font-semibold">{user?.fullName || user?.email}</span>
                </span>

                <button 
                  onClick={() => navigate('/profile')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Vé của tôi
                </button>

                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-colors shadow-xs cursor-pointer"
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
