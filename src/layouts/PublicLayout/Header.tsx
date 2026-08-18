import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, User } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

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
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Trang chủ</Link>
            <Link to="/search" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Tra cứu vé</Link>
            <Link to="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Liên hệ</Link>
          </nav>

          {/* Auth/Profile */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Chào, {user?.fullName || user?.email}</span>
                {user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_STAFF') ? (
                  <button 
                    onClick={() => navigate('/admin')}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Vào Dashboard
                  </button>
                ) : null}
                <button 
                  onClick={() => navigate('/profile')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Hồ sơ
                </button>
                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-blue-500/30"
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
