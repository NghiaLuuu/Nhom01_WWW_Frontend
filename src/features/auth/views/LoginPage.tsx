import React, { useState } from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Bus, User, Lock, Eye, EyeOff } from 'lucide-react';

// === CONSTANTS FOR CONTENT (Fixed UI Skeleton) ===
const CONTENT = {
  NAV_LINKS: ["Trang chủ", "Đặt vé", "Liên hệ", "Tuyển dụng"],
  LOGO_TEXT: "VEXEBUS",
  TITLE: "ĐĂNG NHẬP",
  SUBTITLE: "Chào mừng bạn trở lại với VEXEBUS.VN - Hệ thống đặt vé xe khách số 1 Việt Nam.",
  INPUT_IDENTIFIER_LABEL: "Số điện thoại hoặc Email",
  INPUT_IDENTIFIER_PLACEHOLDER: "Nhập số điện thoại của bạn",
  INPUT_PASSWORD_LABEL: "Mật khẩu",
  INPUT_PASSWORD_PLACEHOLDER: "Nhập mật khẩu",
  FORGOT_PASSWORD_TEXT: "Quên mật khẩu?",
  SUBMIT_BUTTON_TEXT: "ĐĂNG NHẬP",
  SOCIAL_LOGIN_TEXT: "Hoặc đăng nhập bằng:",
  NO_ACCOUNT_TEXT: "Bạn chưa có tài khoản?",
  REGISTER_TEXT: "Đăng ký ngay",
  BG_IMAGE_URL: "https://images.unsplash.com/photo-1464082354059-27db6ce50048?q=80&w=2070&auto=format&fit=crop"
};

interface LoginPageProps {
  onToggleView?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onToggleView }) => {
  useDocumentTitle(CONTENT.TITLE);
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit:", { identifier, password });
  };

  return (
    <div 
      className="min-h-screen relative flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${CONTENT.BG_IMAGE_URL})` }}
    >
      {/* Dark Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/50 sm:bg-gradient-to-tr from-black/80 via-black/40 to-transparent z-0"></div>

      {/* Header / Navbar */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4 md:px-8 lg:px-12 backdrop-blur-md bg-white/80 border-b border-gray-200 flex flex-wrap justify-between items-center shadow-sm">
        {/* Logo */}
        <div className="flex items-center space-x-2 cursor-pointer">
          <Bus size={32} className="text-blue-900" />
          <span className="text-2xl font-black tracking-wider text-blue-900">
            {CONTENT.LOGO_TEXT}
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-5 lg:space-x-8 text-sm font-bold text-gray-800">
          {CONTENT.NAV_LINKS.map((link, index) => (
            <React.Fragment key={index}>
              <a href="#" className="hover:text-blue-600 transition-colors">
                {link}
              </a>
              {index < CONTENT.NAV_LINKS.length - 1 && (
                <span className="text-gray-400 font-normal">|</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </header>

      {/* Main Login Card */}
      <main className="z-10 w-full max-w-md px-4 sm:px-0 mt-20">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/50">
          
          {/* Header Card */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Bus size={36} className="text-blue-600" />
              <span className="text-3xl font-black text-blue-900 tracking-tight">
                {CONTENT.LOGO_TEXT}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 text-center">
              {CONTENT.TITLE}
            </h1>
            <p className="text-sm text-gray-500 text-center leading-relaxed px-2">
              {CONTENT.SUBTITLE}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input 1: Phone / Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                {CONTENT.INPUT_IDENTIFIER_LABEL}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none hover:bg-white"
                  placeholder={CONTENT.INPUT_IDENTIFIER_PLACEHOLDER}
                />
              </div>
            </div>

            {/* Input 2: Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                {CONTENT.INPUT_PASSWORD_LABEL}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none hover:bg-white"
                  placeholder={CONTENT.INPUT_PASSWORD_PLACEHOLDER}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-center pt-2">
              <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                {CONTENT.FORGOT_PASSWORD_TEXT}
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] mt-2"
            >
              {CONTENT.SUBMIT_BUTTON_TEXT}
            </button>
          </form>



          <div className="mt-8 text-center text-sm border-t border-gray-100 pt-6">
            <span className="text-gray-600">{CONTENT.NO_ACCOUNT_TEXT} </span>
            <button 
              type="button"
              onClick={onToggleView}
              className="text-blue-600 font-extrabold hover:text-blue-800 hover:underline transition-colors"
            >
              {CONTENT.REGISTER_TEXT}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
