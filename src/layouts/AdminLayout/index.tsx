import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Fixed Sidebar Skeleton */}
      <Sidebar />
      
      {/* Main Content Area Wrapper */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Fixed Header Skeleton */}
        <Header />
        
        {/* Dynamic Page Content Skeleton */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
