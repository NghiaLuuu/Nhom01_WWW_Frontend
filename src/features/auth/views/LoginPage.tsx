import React, { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Bus, User, Lock, Eye, EyeOff, ArrowRight, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { useAuthStore } from '../../../store/useAuthStore';
import toast from 'react-hot-toast';
import { ProfileService } from '../../../services/profile.service';

const CONTENT = {
  NAV_LINKS: ["Trang chủ", "Trải nghiệm", "Ưu đãi", "Hỗ trợ"],
  LOGO_TEXT: "VEXE",
  TITLE: "Vượt Tầm Phố Thị",
  SUBTITLE: "Đăng nhập để tiếp tục hành trình và khám phá những chân trời mới với trải nghiệm đẳng cấp.",
  INPUT_IDENTIFIER_LABEL: "Tài khoản",
  INPUT_IDENTIFIER_PLACEHOLDER: "Số điện thoại hoặc Email",
  INPUT_PASSWORD_LABEL: "Mật khẩu",
  INPUT_PASSWORD_PLACEHOLDER: "Nhập mật khẩu",
  FORGOT_PASSWORD_TEXT: "Quên mật khẩu?",
  SUBMIT_BUTTON_TEXT: "BẮT ĐẦU",
  NO_ACCOUNT_TEXT: "Chưa có tài khoản?",
  REGISTER_TEXT: "Đăng ký ngay",
  BG_IMAGE_URL: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop"
};

interface LoginPageProps {
  onToggleView?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onToggleView }) => {
  useDocumentTitle("Đăng nhập | " + CONTENT.LOGO_TEXT);
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);
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
        setLoginError(response.data.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      setLoginError(error.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#0b1120] text-slate-100 font-sans selection:bg-blue-500/30">
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #0f172a inset !important;
          -webkit-text-fill-color: white !important;
          caret-color: white !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      {/* Cinematic Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${CONTENT.BG_IMAGE_URL})` }}
        />
        <div className="absolute inset-0 bg-[#0b1120]/80" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
          
          {/* Left Typography - Desktop Only */}
          <div className="hidden lg:flex flex-col max-w-lg">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-blue-400 text-xs font-semibold mb-6 w-fit">
              <Compass size={16} />
              <span>Nền tảng đặt vé xe thông minh</span>
            </div>
            <h1 className="text-5xl font-black text-white leading-tight mb-5 tracking-tight">
              {CONTENT.TITLE.split(' ').slice(0, 2).join(' ')}{' '}
              <span className="text-blue-400">
                {CONTENT.TITLE.split(' ').slice(2).join(' ')}
              </span>
            </h1>
            <p className="text-base text-slate-300 leading-relaxed max-w-md font-normal">
              {CONTENT.SUBTITLE}
            </p>
          </div>

          {/* Right Form Card */}
          <div className="w-full max-w-[420px]">
            <div className="bg-slate-800 border border-slate-700 p-8 sm:p-9 rounded-2xl shadow-xl">
              <div className="mb-6 lg:hidden text-center">
                <h2 className="text-2xl font-bold text-white mb-2">{CONTENT.TITLE}</h2>
                <p className="text-xs text-slate-400">{CONTENT.SUBTITLE}</p>
              </div>

              {loginError && (
                <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                  <div className="text-red-400 mt-0.5 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  </div>
                  <div className="text-xs font-medium text-red-300">
                    {loginError}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Identifier Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
                    {CONTENT.INPUT_IDENTIFIER_LABEL}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl text-white text-sm placeholder:text-slate-500 transition-colors outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder={CONTENT.INPUT_IDENTIFIER_PLACEHOLDER}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      {CONTENT.INPUT_PASSWORD_LABEL}
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {CONTENT.FORGOT_PASSWORD_TEXT}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-11 py-2.5 bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl text-white text-sm placeholder:text-slate-500 transition-colors outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder={CONTENT.INPUT_PASSWORD_PLACEHOLDER}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>{CONTENT.SUBMIT_BUTTON_TEXT}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Footer Link */}
              <div className="mt-6 pt-5 border-t border-slate-700 text-center text-xs">
                <span className="text-slate-400">{CONTENT.NO_ACCOUNT_TEXT} </span>
                <button 
                  type="button"
                  onClick={onToggleView}
                  className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors cursor-pointer ml-1"
                >
                  {CONTENT.REGISTER_TEXT}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
