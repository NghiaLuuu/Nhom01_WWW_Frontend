import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const AdminLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const titles: Record<string, string> = {
    "/admin": "Bảng điều khiển",
    "/admin/trips": "Quản lý chuyến xe",
    "/admin/tickets": "Quản lý đặt vé",
    "/admin/users": "Tài khoản & quyền",
    "/admin/profile": "Hồ sơ cá nhân",
    "/admin/vehicles-drivers": "Quản lý xe & tài xế",
    "/admin/routes": "Quản lý tuyến đường",
    "/admin/reports": "Báo cáo & thống kê",
    "/admin/audit-logs": "Nhật ký hệ thống",
  };
  useDocumentTitle(titles[location.pathname] || "Quản trị");

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header title={titles[location.pathname] || "Quản trị"} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
