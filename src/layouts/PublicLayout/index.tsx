import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatbotWidget } from '../../features/chatbot/components/ChatbotWidget';
import { useAuthStore } from '../../store/useAuthStore';

export const PublicLayout: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      {isAuthenticated && <ChatbotWidget />}
    </div>
  );
};

