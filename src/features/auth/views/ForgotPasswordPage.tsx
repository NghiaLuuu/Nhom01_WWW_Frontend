import React, { useState } from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Bus, Mail, Lock, KeyRound, ArrowLeft, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

export const ForgotPasswordPage: React.FC = () => {
  useDocumentTitle("Khôi Phục Mật Khẩu | VEXE");
  const navigate = useNavigate();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        toast.success(res.data.message || 'OTP đã được gửi đến email của bạn');
        setStep(2);
      } else {
        toast.error(res.data.message || 'Gửi OTP thất bại');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { email, otp, newPassword });
      if (res.data.success) {
        toast.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
        navigate('/login');
      } else {
        toast.error(res.data.message || 'Đổi mật khẩu thất bại');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'OTP không hợp lệ hoặc đã hết hạn');
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
        <div aria-hidden="true" className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px]" />
      </div>

      {/* Main Glass Reset Card */}
      <main className="relative z-10 w-full max-w-md">
        <div className="relative rounded-[2rem] bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 shadow-2xl shadow-cyan-950/40">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck size={12} className="text-cyan-400" />
              <span>Xác thực an toàn hai lớp</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Khôi Phục Mật Khẩu
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 font-light">
              {step === 1 ? 'Nhập email tài khoản để nhận mã OTP khôi phục bảo mật.' : 'Nhập mã OTP vừa nhận và đặt lại mật khẩu mới.'}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Email tài khoản VEXE
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/15 focus:border-cyan-400 rounded-xl text-white text-xs sm:text-sm outline-none transition-all placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="khachhang@vexe.vn"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/50 cursor-pointer active:scale-95"
              >
                <span>{isLoading ? 'Đang gửi mã xác thực...' : 'GỬI MÃ OTP QUA EMAIL'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Mã OTP đã gửi về {email}
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
                    placeholder="Mã OTP 6 số"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/15 focus:border-cyan-400 rounded-xl text-white text-xs sm:text-sm outline-none transition-all placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/50 cursor-pointer active:scale-95"
              >
                <span>{isLoading ? 'Đang đặt lại mật khẩu...' : 'XÁC NHẬN ĐỔI MẬT KHẨU'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Footer Back Link */}
          <div className="mt-6 text-center text-xs border-t border-white/10 pt-4">
            <Link 
              to="/login"
              className="text-slate-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Quay lại trang Đăng nhập</span>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
};
