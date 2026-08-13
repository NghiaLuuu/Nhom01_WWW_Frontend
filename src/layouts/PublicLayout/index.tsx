import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatbotWidget } from '../../features/chatbot/components/ChatbotWidget';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
};

