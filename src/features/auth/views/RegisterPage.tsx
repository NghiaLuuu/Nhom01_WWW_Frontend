import React, { useState } from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Bus, User, Lock, Eye, EyeOff, Mail, KeyRound, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

const CONTENT = {
  LOGO_TEXT: "VEXE",
  TITLE: "ĐĂNG KÝ THÀNH VIÊN",
  SUBTITLE: "Mở tài khoản VEXE để nhận ưu đãi AI độc quyền và quản lý vé thông minh.",
  INPUT_FULLNAME_LABEL: "Họ và tên",
  INPUT_FULLNAME_PLACEHOLDER: "Nguyễn Văn An",
  INPUT_EMAIL_LABEL: "Email",
  INPUT_EMAIL_PLACEHOLDER: "khachhang@vexe.vn",
  INPUT_PASSWORD_LABEL: "Mật khẩu",
  INPUT_PASSWORD_PLACEHOLDER: "Nhập mật khẩu (tối thiểu 6 ký tự)",
  SUBMIT_BUTTON_TEXT: "ĐĂNG KÝ TÀI KHOẢN",
  ALREADY_HAVE_ACCOUNT_TEXT: "Đã có tài khoản?",
  LOGIN_TEXT: "Đăng nhập ngay"
};

interface RegisterPageProps {
  onToggleView?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onToggleView }) => {
  useDocumentTitle("Đăng ký thành viên | " + CONTENT.LOGO_TEXT);
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!showOtp) {
        // Step 1: Register
        const response = await api.post('/auth/register', { fullName, email, password });
        if (response.data.success) {
          toast.success(response.data.message || 'Đăng ký thành công, vui lòng nhập mã OTP!');
          setShowOtp(true);
        } else {
          toast.error(response.data.message || 'Đăng ký thất bại');
        }
      } else {
        // Step 2: Verify OTP
        const response = await api.post('/auth/verify-otp', { email, otp });
        if (response.data.success) {
          toast.success(response.data.message || 'Xác thực thành công! Bạn có thể đăng nhập.');
          if (onToggleView) onToggleView();
        } else {
          toast.error(response.data.message || 'Xác thực thất bại');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-slate-950 font-sans selection:bg-cyan-500/30 overflow-hidden px-4 py-12">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(56, 189, 248, 0.3) 1px, transparent 0)`,
            backgroundSize: '36px 36px'
          }}
        />
        <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/15 rounded-full blur-[140px]" />
        <div aria-hidden="true" className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/15 rounded-full blur-[140px]" />
      </div>

      {/* Main Glass Register Card */}
      <main className="relative z-10 w-full max-w-md">
        <div className="relative rounded-[2rem] bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 shadow-2xl shadow-cyan-950/40">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles size={12} className="text-cyan-400" />
              <span>Gia nhập cộng đồng VEXE VIP</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {CONTENT.TITLE}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 font-light">
              {CONTENT.SUBTITLE}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                {CONTENT.INPUT_FULLNAME_LABEL}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/15 focus:border-cyan-400 rounded-xl text-white text-xs sm:text-sm outline-none transition-all placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder={CONTENT.INPUT_FULLNAME_PLACEHOLDER}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                {CONTENT.INPUT_EMAIL_LABEL}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/15 focus:border-cyan-400 rounded-xl text-white text-xs sm:text-sm outline-none transition-all placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder={CONTENT.INPUT_EMAIL_PLACEHOLDER}
                />
              </div>
            </div>

            {/* Password */}
            {!showOtp && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {CONTENT.INPUT_PASSWORD_LABEL}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-950/80 border border-white/15 focus:border-cyan-400 rounded-xl text-white text-xs sm:text-sm outline-none transition-all placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500/20"
                    placeholder={CONTENT.INPUT_PASSWORD_PLACEHOLDER}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* OTP Input Step */}
            {showOtp && (
              <div className="space-y-1.5 animate-in fade-in duration-300">
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Mã xác thực OTP (Đã gửi qua Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-400">
                    <KeyRound size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-amber-400/50 focus:border-amber-400 rounded-xl text-amber-300 font-mono text-center tracking-widest text-base outline-none transition-all placeholder:text-slate-600 focus:ring-2 focus:ring-amber-500/20"
                    placeholder="Nhập mã OTP 6 số"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/50 cursor-pointer active:scale-95"
            >
              <span>{isLoading ? 'Đang kích hoạt tài khoản...' : (showOtp ? 'XÁC NHẬN MÃ OTP' : CONTENT.SUBMIT_BUTTON_TEXT)}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Footer Card */}
          <div className="mt-6 text-center text-xs border-t border-white/10 pt-4 text-slate-400">
            <span>{CONTENT.ALREADY_HAVE_ACCOUNT_TEXT} </span>
            <button 
              type="button"
              onClick={onToggleView}
              className="text-cyan-400 font-bold hover:text-cyan-300 hover:underline transition-colors cursor-pointer ml-1"
            >
              {CONTENT.LOGIN_TEXT}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};
