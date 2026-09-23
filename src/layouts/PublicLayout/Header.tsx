import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, User } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

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
            <Link to="/" className="text-slate-300 hover:text-white font-medium transition-colors relative group">
              Trang chủ
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-blue-500 group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
            <Link to="/search" className="text-slate-300 hover:text-white font-medium transition-colors relative group">
              Tra cứu vé
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-blue-500 group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
            <Link to="#" className="text-slate-300 hover:text-white font-medium transition-colors relative group">
              Liên hệ
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-blue-500 group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
          </nav>

          {/* Auth/Profile */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-slate-300 hidden sm:block">Chào, <span className="text-white font-bold">{user?.fullName || user?.email}</span></span>
                {user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_STAFF') ? (
                  <button 
                    onClick={() => navigate('/admin')}
                    className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Vào Dashboard
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
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
              >
                <User size={18} />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
