import React from 'react';
import { 
  Bus, LayoutDashboard, Ticket, Users, Car, Map, 
  BarChart3, UserCircle, FileText, ChevronLeft, ChevronRight, LogOut 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

const MENU_GROUPS = [
  {
    title: 'Tổng Quan',
    items: [
      { name: 'Bảng Điều Khiển', icon: LayoutDashboard, path: '/admin', roles: ['ROLE_ADMIN', 'ROLE_STAFF'] },
    ]
  },
  {
    title: 'Nghiệp Vụ',
    items: [
      { name: 'Quản Lý Chuyến Xe', icon: Bus, path: '/admin/trips', roles: ['ROLE_ADMIN', 'TRIP_MANAGE'] },
      { name: 'Đơn Đặt Vé', icon: Ticket, path: '/admin/tickets', roles: ['ROLE_ADMIN', 'MANAGE_TICKET'] },
      { name: 'Xe & Tài Xế', icon: Car, path: '/admin/vehicles-drivers', roles: ['ROLE_ADMIN', 'VEHICLE_MANAGE'] },
      { name: 'Tuyến Đường', icon: Map, path: '/admin/routes', roles: ['ROLE_ADMIN', 'ROUTE_MANAGE'] },
    ]
  },
  {
    title: 'Hệ Thống',
    items: [
      { name: 'Báo Cáo Thống Kê', icon: BarChart3, path: '/admin/reports', roles: ['ROLE_ADMIN', 'VIEW_STATISTICS'] },
      { name: 'Tài Khoản & Quyền', icon: Users, path: '/admin/users', roles: ['ROLE_ADMIN', 'STAFF_MANAGE', 'CUSTOMER_MANAGE'] },
      { name: 'Nhật Ký Hệ Thống', icon: FileText, path: '/admin/audit-logs', roles: ['ROLE_ADMIN'] },
      { name: 'Hồ Sơ Cá Nhân', icon: UserCircle, path: '/admin/profile', roles: ['ROLE_ADMIN', 'ROLE_STAFF'] },
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, logout } = useAuthStore();
  const userRoles = user?.roles || [];

  return (
    <aside className={`bg-slate-900 h-screen flex flex-col fixed left-0 top-0 z-20 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="h-14 min-h-[3.5rem] flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/50">
        <div className={`flex items-center overflow-hidden transition-all ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
          <Bus className="text-blue-500 mr-2 shrink-0" size={24} />
          <span className="text-lg font-bold text-white tracking-wide">VEXE</span>
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
          title={isCollapsed ? "Mở rộng" : "Thu gọn"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      
      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {MENU_GROUPS.map((group, groupIdx) => {
          const visibleItems = group.items.filter(item => item.roles.some(role => userRoles.includes(role)));
          if (visibleItems.length === 0) return null;

          return (
            <div key={groupIdx} className="flex flex-col space-y-1">
              {!isCollapsed && (
                <div className="px-3 mb-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                  {group.title}
                </div>
              )}
              {visibleItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path || (currentPath.startsWith(item.path) && item.path !== '/admin');
                
                return (
                  <Link 
                    key={idx} 
                    to={item.path}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center px-3 py-2 rounded-md transition-colors group relative ${
                      isActive 
                        ? 'bg-blue-600/10 text-blue-400 font-medium' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {isActive && !isCollapsed && (
                      <div className="absolute left-0 top-1 bottom-1 w-1 bg-blue-500 rounded-r-full" />
                    )}
                    <Icon size={18} className={`shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`} />
                    {!isCollapsed && <span className="text-sm truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/50">
        <button 
          onClick={() => { logout(); window.location.href = '/'; }}
          title={isCollapsed ? "Đăng xuất" : undefined}
          className="w-full flex items-center px-3 py-2 rounded-md text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors group"
        >
          <LogOut size={18} className={`shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
          {!isCollapsed && <span className="text-sm font-medium">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};
