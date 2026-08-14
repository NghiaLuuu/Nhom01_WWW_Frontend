import React from 'react';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="h-16 min-h-[4rem] bg-white border-b border-gray-200 flex items-center justify-center px-6 sticky top-0 z-10 shadow-sm">
      <h1 className="text-xl font-bold text-gray-800 tracking-wide uppercase">
        {title || ''}
      </h1>
    </header>
  );
};
