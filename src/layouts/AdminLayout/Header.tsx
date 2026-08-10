import React from 'react';
import { Search, Bell, MessageSquare, ChevronDown } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 min-h-[4rem] bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      {/* Left: Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400"
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Right: Actions & User Profile */}
      <div className="flex items-center space-x-5 pl-6">
        <button className="text-gray-500 hover:text-blue-600 transition-colors relative">
          <MessageSquare size={22} />
        </button>
        
        <button className="text-gray-500 hover:text-blue-600 transition-colors relative">
          <Bell size={22} />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            3
          </span>
        </button>

        <div className="h-8 w-px bg-gray-200 mx-2"></div>

        <button className="flex items-center space-x-3 hover:bg-gray-50 p-1.5 rounded-xl transition-colors cursor-pointer text-left">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
            alt="User Avatar" 
            className="h-9 w-9 rounded-full object-cover border border-gray-200 shadow-sm"
          />
          <div className="hidden md:block">
            <p className="text-sm font-bold text-gray-700 leading-tight">Nguyễn Văn A</p>
            <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Quản lý</p>
          </div>
          <ChevronDown size={16} className="text-gray-400 ml-1" />
        </button>
      </div>
    </header>
  );
};
