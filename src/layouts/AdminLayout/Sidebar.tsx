import React from 'react';
import { 
  Bus, 
  LayoutDashboard, 
  Ticket, 
  Users, 
  Car, 
  Map, 
  BarChart3, 
  Settings 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const MENU_ITEMS = [
  { name: 'Bảng Điều Khiển', icon: LayoutDashboard, path: '/admin', roles: ['ROLE_ADMIN', 'ROLE_STAFF'] },
  { name: 'Quản Lý Chuyến Xe', icon: Bus, path: '/admin/trips', roles: ['ROLE_ADMIN', 'ROLE_STAFF'] },
  { name: 'Đơn Đặt Vé', icon: Ticket, path: '/admin/tickets', roles: ['ROLE_ADMIN', 'ROLE_STAFF'] },
  { name: 'Tài Khoản & Quyền', icon: Users, path: '/admin/users', roles: ['ROLE_ADMIN'] },
  { name: 'Xe & Tài Xế', icon: Car, path: '/admin/vehicles-drivers', roles: ['ROLE_ADMIN'] },
  { name: 'Tuyến Đường', icon: Map, path: '/admin/routes', roles: ['ROLE_ADMIN'] },
  { name: 'Báo Cáo Thống Kê', icon: BarChart3, path: '/admin/reports', roles: ['ROLE_ADMIN'] },
  { name: 'Cài Đặt', icon: Settings, path: '/admin/settings', roles: ['ROLE_ADMIN'] },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuthStore();
  const userRoles = user?.roles || [];

  const visibleItems = MENU_ITEMS.filter(item => 
    item.roles.some(role => userRoles.includes(role))
  );

  return (
    <aside className="w-64 bg-slate-800 h-screen flex flex-col shadow-xl fixed left-0 top-0 z-20 text-slate-300">
      {/* Logo Section */}
      <div className="h-16 min-h-[4rem] flex items-center px-6 bg-slate-900/50 border-b border-slate-700/50">
        <Bus className="text-blue-400 mr-3" size={28} />
        <span className="text-xl font-bold text-white tracking-wider">VEXE</span>
      </div>
      
      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
        {visibleItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (currentPath.startsWith(item.path) && item.path !== '/admin');
          
          return (
            <Link 
              key={index} 
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/20' 
                  : 'hover:bg-slate-700/50 hover:text-white font-medium'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700/50">
        <button 
          onClick={() => { useAuthStore.getState().logout(); window.location.href = '/'; }}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-medium transition-all group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};
