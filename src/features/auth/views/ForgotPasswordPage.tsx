import React, { useState } from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Bus, Mail, Lock, KeyRound, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen w-full relative flex items-center justify-center bg-[#0b1120] text-slate-100 font-sans selection:bg-cyan-500/30 overflow-hidden px-4 py-12">
      {/* Main Reset Card */}
      <main className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-8 sm:p-9 shadow-xl">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck size={12} className="text-blue-400" />
              <span>Xác thực an toàn hai lớp</span>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">
              Khôi Phục Mật Khẩu
            </h1>
            <p className="text-xs text-slate-400 mt-1.5">
              {step === 1 ? 'Nhập email tài khoản để nhận mã OTP khôi phục bảo mật.' : 'Nhập mã OTP vừa nhận và đặt lại mật khẩu mới.'}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Email tài khoản VEXE
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl text-white text-xs sm:text-sm outline-none transition-colors placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="khachhang@vexe.vn"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                <span>{isLoading ? 'Đang gửi mã...' : 'GỬI MÃ OTP XÁC NHẬN'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider">
                  Mã OTP (6 số từ Email)
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-amber-500/40 focus:border-amber-400 rounded-xl text-amber-300 font-mono text-center tracking-widest text-base outline-none transition-colors placeholder:text-slate-600 focus:ring-1 focus:ring-amber-500"
                    placeholder="123456"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl text-white text-xs sm:text-sm outline-none transition-colors placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                <span>{isLoading ? 'Đang cập nhật...' : 'CẬP NHẬT MẬT KHẨU'}</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200 mt-2 block"
              >
                Nhập lại email khác
              </button>
            </form>
          )}

          {/* Footer Back Link */}
          <div className="mt-6 text-center text-xs border-t border-slate-700 pt-4">
            <Link 
              to="/login"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors font-medium cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Quay lại Đăng nhập</span>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
};
