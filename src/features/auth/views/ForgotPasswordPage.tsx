import React, { useState } from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Bus, Mail, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

export const ForgotPasswordPage: React.FC = () => {
  useDocumentTitle("Quên Mật Khẩu");
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
    <div 
      className="min-h-screen relative flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(https://images.unsplash.com/photo-1464082354059-27db6ce50048?q=80&w=2070&auto=format&fit=crop)` }}
    >
      <div className="absolute inset-0 bg-black/50 sm:bg-gradient-to-tr from-black/80 via-black/40 to-transparent z-0"></div>

      <main className="z-10 w-full max-w-md px-4 sm:px-0">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/50">
          
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Bus size={36} className="text-blue-600" />
              <span className="text-3xl font-black text-blue-900 tracking-tight">VEXE</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 text-center">
              Khôi Phục Mật Khẩu
            </h1>
            <p className="text-sm text-gray-500 text-center leading-relaxed px-2">
              {step === 1 ? 'Nhập email của bạn để nhận mã OTP khôi phục mật khẩu.' : 'Nhập mã OTP và mật khẩu mới của bạn.'}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none hover:bg-white transition-all"
                    placeholder="Nhập email của bạn"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold text-[15px] rounded-xl shadow-lg transition-all"
              >
                {isLoading ? 'ĐANG GỬI...' : 'GỬI MÃ OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Mã OTP</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                    <CheckCircle size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-white"
                    placeholder="Nhập mã 6 số"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Mật khẩu mới</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-white"
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold text-[15px] rounded-xl shadow-lg transition-all"
              >
                {isLoading ? 'ĐANG XỬ LÝ...' : 'ĐỔI MẬT KHẨU'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-sm border-t border-gray-100 pt-6">
            <Link to="/login" className="inline-flex items-center space-x-1 text-gray-600 hover:text-blue-600 font-medium transition-colors">
              <ArrowLeft size={16} />
              <span>Quay lại đăng nhập</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
