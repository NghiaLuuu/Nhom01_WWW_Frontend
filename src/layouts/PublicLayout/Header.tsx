import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bus, User, Ticket } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="bg-slate-950/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 group-hover:bg-white/20 transition-all duration-300">
              <Bus className="text-blue-400 relative z-10" size={20} />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight uppercase">VEXE</span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`font-medium transition-colors relative group ${
                location.pathname === '/' ? 'text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Trang chủ
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-blue-500 group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
            <Link 
              to="/search" 
              className={`font-medium transition-colors relative group ${
                location.pathname.startsWith('/search') ? 'text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Tìm chuyến xe
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-blue-500 group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
            {isAuthenticated && (
              <Link 
                to="/bookings" 
                className={`font-medium transition-colors flex items-center space-x-1.5 relative group ${
                  location.pathname.startsWith('/bookings') ? 'text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Ticket size={16} />
                <span>Vé của tôi</span>
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-blue-500 group-hover:w-full transition-all duration-300 ease-out"></span>
              </Link>
            )}
          </nav>

          {/* Auth/Profile */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-slate-300 hidden sm:block">Chào, <span className="text-white font-bold">{user?.fullName || user?.email?.split('@')[0]}</span></span>
                
                <Link
                  to="/bookings"
                  className="md:hidden flex items-center space-x-1 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Vé của tôi"
                >
                  <Ticket size={18} />
                </Link>

                {user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_STAFF') ? (
                  <button 
                    onClick={() => navigate('/admin')}
                    className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Dashboard
                  </button>
                ) : null}
                
                <button 
                  onClick={() => navigate('/profile')}
                  className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Hồ sơ
                </button>
                
                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-blue-500/30"
              >
                <User size={16} />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
