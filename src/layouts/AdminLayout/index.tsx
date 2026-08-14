import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
   const titles: Record<string, string> = {
    "/admin": "Bảng điều khiển",
    "/admin/trips": "Quản lý chuyến xe",
    "/admin/tickets": "Quản lý đặt vé",
    "/admin/passengers": "Quản lý hành khách",
    "/admin/vehicles-drivers": "Quản lý xe & tài xế",
    "/admin/routes": "Quản lý tuyến đường",
    "/admin/reports": "Báo cáo & thống kê",
    "/admin/settings": "Cài đặt",
  };
  useDocumentTitle(titles[location.pathname] || "Quản trị");
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Fixed Sidebar Skeleton */}
      <Sidebar />
      
      {/* Main Content Area Wrapper */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Fixed Header */}
        <Header title={titles[location.pathname] || "Quản trị"} />
        
        {/* Dynamic Page Content Skeleton */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
