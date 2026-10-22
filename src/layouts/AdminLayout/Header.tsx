import React from 'react';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="h-14 min-h-[3.5rem] bg-white border-b border-gray-200 flex items-center px-6 sticky top-0 z-10">
      <h1 className="text-lg font-semibold text-gray-800 tracking-tight">
        {title || ''}
      </h1>
    </header>
  );
};
