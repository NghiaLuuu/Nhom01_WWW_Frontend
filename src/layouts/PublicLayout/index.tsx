import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatbotWidget } from '../../features/chatbot/components/ChatbotWidget';
import { useAuthStore } from '../../store/useAuthStore';
import { useUserTracker } from '../../hooks/useUserTracker';

export const PublicLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  // Strict Separation: Admin & Staff must only operate in /admin
  const roles = user?.roles || [];
  if (isAuthenticated && (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_STAFF'))) {
    return <Navigate to="/admin" replace />;
  }
  
  // Continuous User Activity & Behavior Tracking Hook
  useUserTracker();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
};

