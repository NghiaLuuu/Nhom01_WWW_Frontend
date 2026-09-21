/**
 * CẤU HÌNH ĐÃ CHỐT
 * Ngành: Du lịch/Vận tải · Loại hệ thống: E-commerce · Người dùng: Hành khách đa độ tuổi · Nhiệm vụ chính: Đăng nhập đặt vé
 * Nền tảng: Web · Stack: React 18 + Tailwind v3.4 · Ngôn ngữ: vi-VN · Mật độ: Tiêu chuẩn · Mức a11y: WCAG 2.2 AA
 *
 * NHẬT KÝ GIẢ ĐỊNH
 * - FONT = auto — vì Tailwind đã cấu hình sẵn Inter/sans-serif, dùng hệ thống cho hiệu năng. Nếu sai → đổi font-family trong tailwind.config.js.
 * - MÀU_THƯƠNG_HIỆU = blue-600 — suy dẫn từ logo hiện tại. Nếu sai → cập nhật lại mã hex chính xác.
 *
 * MODULE ĐÃ NẠP: Phần 0, 1.2–1.6, 2.3–2.6, Phần VIII (Split Layout)
 */

import React, { useState } from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Bus, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { useAuthStore } from '../../../store/useAuthStore';
import toast from 'react-hot-toast';
import { ProfileService } from '../../../services/profile.service';

// === CONSTANTS FOR CONTENT (Fixed UI Skeleton) ===
const CONTENT = {
  NAV_LINKS: ["Trang chủ", "Đặt vé", "Liên hệ", "Tuyển dụng"],
  LOGO_TEXT: "VEXE",
  TITLE: "ĐĂNG NHẬP",
  SUBTITLE: "Chào mừng bạn trở lại. Vui lòng đăng nhập để tiếp tục hành trình.",
  INPUT_IDENTIFIER_LABEL: "Số điện thoại hoặc Email",
  INPUT_IDENTIFIER_PLACEHOLDER: "Nhập số điện thoại của bạn",
  INPUT_PASSWORD_LABEL: "Mật khẩu",
  INPUT_PASSWORD_PLACEHOLDER: "Nhập mật khẩu",
  FORGOT_PASSWORD_TEXT: "Quên mật khẩu?",
  SUBMIT_BUTTON_TEXT: "ĐĂNG NHẬP",
  NO_ACCOUNT_TEXT: "Bạn chưa có tài khoản?",
  REGISTER_TEXT: "Đăng ký ngay",
  BG_IMAGE_URL: "https://images.unsplash.com/photo-1464082354059-27db6ce50048?q=80&w=2070&auto=format&fit=crop"
};

interface LoginPageProps {
  onToggleView?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onToggleView }) => {
  useDocumentTitle(CONTENT.TITLE);
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email: identifier, password });
      if (response.data.success && response.data.data) {
        const { accessToken, refreshToken } = response.data.data;
        setTokens(accessToken, refreshToken);
        
        try {
          const profileRes = await ProfileService.getProfile();
          if (profileRes.success && profileRes.data) {
            const currentUser = useAuthStore.getState().user;
            setUser({ ...(currentUser || {}), ...profileRes.data } as any);
          }
        } catch (e) {
          console.error('Failed to fetch profile on login', e);
        }

        toast.success(response.data.message || 'Đăng nhập thành công!');
        const user = useAuthStore.getState().user;
        if (user?.roles?.some((r: string) => r === 'ROLE_ADMIN' || r === 'ROLE_STAFF')) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        toast.error(response.data.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px white inset !important;
          -webkit-text-fill-color: #0f172a !important;
        }
      `}</style>
      {/* Left Panel (Image & Brand) - Hidden on mobile, takes 50% on desktop */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden flex-col justify-between">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50" 
          style={{ backgroundImage: `url(${CONTENT.BG_IMAGE_URL})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-blue-900/80 to-slate-900/95"></div>
        
        {/* Brand & Value Proposition */}
        <div className="relative z-10 p-12 mt-8">
          <div 
            className="flex items-center space-x-2 text-white mb-16 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Bus size={40} className="text-white" />
            <span className="text-3xl font-black tracking-wider text-white">
              {CONTENT.LOGO_TEXT}
            </span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight text-balance">
            Hành trình của bạn,<br/>Trách nhiệm của chúng tôi.
          </h2>
          <p className="text-blue-100 text-lg max-w-md leading-relaxed text-pretty">
            Hệ thống đặt vé xe khách trực tuyến hàng đầu, mang đến cho bạn trải nghiệm di chuyển an toàn và tiện lợi nhất.
          </p>
        </div>
        
        {/* Simple Navigation on Image Side */}
        <div className="relative z-10 p-12">
          <div className="flex space-x-6 text-sm font-medium text-blue-200">
            {CONTENT.NAV_LINKS.map((link, index) => (
              <a key={index} href="#" className="hover:text-white transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel (Form) - Takes full width on mobile, 50% on desktop */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white">
        {/* Mobile Header (Only visible when image panel is hidden) */}
        <div className="lg:hidden p-6 flex items-center justify-between border-b border-slate-100">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Bus size={28} className="text-blue-600" />
            <span className="text-xl font-black text-blue-900">{CONTENT.LOGO_TEXT}</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-24 lg:px-16 xl:px-32 py-12">
          <div className="w-full max-w-sm mx-auto flex flex-col">
            
            {/* Form Header */}
            <div className="mb-10 text-left">
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2 text-balance">
                {CONTENT.TITLE}
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed text-pretty">
                {CONTENT.SUBTITLE}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Input 1: Phone / Email */}
              <div className="space-y-1.5 text-left">
                <label className="block text-sm font-semibold text-slate-700">
                  {CONTENT.INPUT_IDENTIFIER_LABEL}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none"
                    placeholder={CONTENT.INPUT_IDENTIFIER_PLACEHOLDER}
                  />
                </div>
              </div>

              {/* Input 2: Password */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold text-slate-700">
                    {CONTENT.INPUT_PASSWORD_LABEL}
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    {CONTENT.FORGOT_PASSWORD_TEXT}
                  </button>
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none"
                    placeholder={CONTENT.INPUT_PASSWORD_PLACEHOLDER}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold text-[15px] rounded-lg shadow-sm transition-all active:scale-[0.98] mt-4"
              >
                {isLoading ? 'ĐANG ĐĂNG NHẬP...' : CONTENT.SUBMIT_BUTTON_TEXT}
              </button>
            </form>

            {/* Footer / Toggle to Register */}
            <div className="mt-8 text-center text-sm pt-6 border-t border-slate-100">
              <span className="text-slate-600">{CONTENT.NO_ACCOUNT_TEXT} </span>
              <button 
                type="button"
                onClick={onToggleView}
                className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition-colors"
              >
                {CONTENT.REGISTER_TEXT}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
