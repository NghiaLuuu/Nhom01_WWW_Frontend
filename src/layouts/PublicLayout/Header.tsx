import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bus, User, Ticket } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Bus className="text-blue-600" size={32} />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">VEXE</span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`font-medium transition-colors ${
                location.pathname === '/' ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Trang chủ
            </Link>
            <Link 
              to="/search" 
              className={`font-medium transition-colors ${
                location.pathname.startsWith('/search') ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Tìm chuyến xe
            </Link>
            {isAuthenticated && (
              <Link 
                to="/bookings" 
                className={`font-medium transition-colors flex items-center space-x-1.5 ${
                  location.pathname.startsWith('/bookings') ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Ticket size={16} />
                <span>Vé của tôi</span>
              </Link>
            )}
          </nav>

          {/* Auth/Profile */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-xs sm:text-sm font-semibold text-gray-700 hidden lg:inline-block">
                  Chào, {user?.fullName || user?.email?.split('@')[0]}
                </span>
                
                <Link
                  to="/bookings"
                  className="md:hidden flex items-center space-x-1 p-2 rounded-xl text-gray-600 hover:bg-gray-50"
                  title="Vé của tôi"
                >
                  <Ticket size={18} />
                </Link>

                {user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_STAFF') ? (
                  <button 
                    onClick={() => navigate('/admin')}
                    className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Dashboard
                  </button>
                ) : null}
                
                <button 
                  onClick={() => navigate('/profile')}
                  className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Hồ sơ
                </button>
                
                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-colors shadow-sm shadow-blue-500/30"
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
