/**
 * CẤU HÌNH ĐÃ CHỐT
 * Ngành: Du lịch/Vận tải · Loại hệ thống: E-commerce / Đặt vé
 * Mức độ WOW: 9 (Hypebeast/Campaign) - Đột phá thị giác
 * Nền tảng: Web · Stack: React 18 + Tailwind v3.4
 *
 * TƯ DUY THIẾT KẾ (WOW 9):
 * - Bố cục: Hero lệch trục kết hợp thẻ Glassmorphism nổi.
 * - Ánh sáng & Chất liệu: Sử dụng backdrop-blur mạnh, viền gradient siêu mỏng (1px), glow tinh tế khi focus.
 * - Chuyển động (Micro-animations): Các input có hiệu ứng hover mượt mà, nút submit có dải sáng lướt qua (shine effect).
 * - Background: Ảnh nền chất lượng cao, có hiệu ứng zoom siêu chậm (Ken Burns effect) tạo cảm giác không gian và hành trình.
 */

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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
    <div className="min-h-screen w-full relative overflow-hidden bg-slate-950 font-sans selection:bg-blue-500/30">
      <style>{`
        @keyframes kenburns {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.05) translate(-1%, -1%); }
          100% { transform: scale(1) translate(0, 0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .bg-kenburns {
          animation: kenburns 30s ease-in-out infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px rgba(255, 255, 255, 0.05) inset !important;
          -webkit-text-fill-color: white !important;
          caret-color: white !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-kenburns scale-105 origin-center"
          style={{ backgroundImage: `url(${CONTENT.BG_IMAGE_URL})` }}
        />
        {/* Dynamic Overlays for Depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/60 to-blue-950/80 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent opacity-60 mix-blend-screen" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-950 to-transparent opacity-90" />
      </div>

      {/* Navbar (Absolute to float over content) */}
      <nav className={`absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 lg:px-12 lg:py-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 group-hover:bg-white/20 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Bus size={22} className="text-white relative z-10" />
          </div>
          <span className="text-2xl font-black tracking-widest text-white uppercase drop-shadow-md">
            {CONTENT.LOGO_TEXT}
          </span>
        </div>
        
        <div className="hidden md:flex gap-8 text-sm font-medium">
          {CONTENT.NAV_LINKS.map((link, idx) => (
            <a key={idx} href="#" className="text-slate-300 hover:text-white transition-colors relative group">
              {link}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-blue-500 group-hover:w-full transition-all duration-300 ease-out"></span>
            </a>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center lg:justify-between px-6 lg:px-24">
        
        {/* Left Typography - Desktop Only */}
        <div className={`hidden lg:flex flex-col max-w-xl transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-blue-300 text-sm font-semibold mb-6 w-fit animate-float">
            <Compass size={16} />
            <span>Mở ra kỷ nguyên di chuyển mới</span>
          </div>
          <h1 className="text-6xl xl:text-7xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
            {CONTENT.TITLE.split(' ').slice(0, 2).join(' ')} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]">
              {CONTENT.TITLE.split(' ').slice(2).join(' ')}
            </span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-md font-light">
            {CONTENT.SUBTITLE}
          </p>
        </div>

        {/* Right Form Card - Glassmorphism */}
        <div className={`w-full max-w-[420px] transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="relative group rounded-[2rem]">
            {/* Animated Glow Behind Card */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-70 transition duration-700 animate-pulse-glow pointer-events-none"></div>
            
            {/* Glass Card Surface */}
            <div className="relative bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-[2rem] shadow-2xl overflow-hidden">
              {/* Internal Reflections */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10">
                <div className="mb-8 lg:hidden text-center">
                  <h2 className="text-3xl font-bold text-white mb-2">{CONTENT.TITLE}</h2>
                  <p className="text-sm text-slate-400">{CONTENT.SUBTITLE}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Identifier Input */}
                  <div className="space-y-2 group/input">
                    <label className="text-xs font-bold tracking-wider text-slate-300 uppercase">
                      {CONTENT.INPUT_IDENTIFIER_LABEL}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-blue-400 transition-colors z-10">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white/5 hover:bg-white/[0.07] focus:bg-white/10 border border-white/10 focus:border-blue-400/50 rounded-xl text-white text-base placeholder:text-slate-500 transition-all outline-none focus:ring-4 focus:ring-blue-500/10 relative z-0"
                        placeholder={CONTENT.INPUT_IDENTIFIER_PLACEHOLDER}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2 group/input">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold tracking-wider text-slate-300 uppercase">
                        {CONTENT.INPUT_PASSWORD_LABEL}
                      </label>
                      <button
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {CONTENT.FORGOT_PASSWORD_TEXT}
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-blue-400 transition-colors z-10">
                        <Lock size={18} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3.5 bg-white/5 hover:bg-white/[0.07] focus:bg-white/10 border border-white/10 focus:border-blue-400/50 rounded-xl text-white text-base placeholder:text-slate-500 transition-all outline-none focus:ring-4 focus:ring-blue-500/10 relative z-0"
                        placeholder={CONTENT.INPUT_PASSWORD_PLACEHOLDER}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors z-10"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button - Signature Move: Advanced Hover & Shine */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group/btn relative w-full mt-8 overflow-hidden rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[15px] shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 w-full h-full pointer-events-none">
                      <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[30deg] group-hover/btn:animate-[shine_1s_ease-in-out]"></div>
                    </div>
                    <div className="relative py-4 flex items-center justify-center gap-2">
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>{CONTENT.SUBMIT_BUTTON_TEXT}</span>
                          <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                        </>
                      )}
                    </div>
                  </button>

                  <style>{`
                    @keyframes shine {
                      100% { left: 200%; }
                    }
                  `}</style>
                </form>

                {/* Footer Link */}
                <div className="mt-8 text-center text-sm">
                  <span className="text-slate-400">{CONTENT.NO_ACCOUNT_TEXT} </span>
                  <button 
                    type="button"
                    onClick={onToggleView}
                    className="text-white font-bold hover:text-blue-400 transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-px after:bg-blue-400/0 hover:after:bg-blue-400/100 after:transition-colors inline-block"
                  >
                    {CONTENT.REGISTER_TEXT}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
