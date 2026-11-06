import React, { useState } from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Shield, ShieldAlert, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, Terminal, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { useAuthStore } from '../../../store/useAuthStore';
import toast from 'react-hot-toast';
import { ProfileService } from '../../../services/profile.service';

export const AdminLoginPage: React.FC = () => {
  useDocumentTitle("Cổng Quản Trị Hệ Thống | VEXE Command Center");
  const navigate = useNavigate();
  const { setTokens, setUser, logout } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await api.post('/auth/login', { email: identifier, password });
      
      if (response.data.success && response.data.data) {
        const { accessToken, refreshToken } = response.data.data;
        setTokens(accessToken, refreshToken);

        // Fetch user profile
        try {
          const profileRes = await ProfileService.getProfile();
          if (profileRes.success && profileRes.data) {
            const currentUser = useAuthStore.getState().user;
            setUser({ ...(currentUser || {}), ...profileRes.data } as any);
          }
        } catch (e) {
          console.error('Failed to fetch profile', e);
        }

        // Strict Role Verification
        const currentUser = useAuthStore.getState().user;
        const roles: string[] = currentUser?.roles || [];
        const isAdminOrStaff = roles.includes('ROLE_ADMIN') || roles.includes('ROLE_STAFF');

        if (!isAdminOrStaff) {
          logout();
          setErrorMessage("TRUY CẬP BỊ TỪ CHỐI: Tài khoản của bạn là tài khoản Khách hàng thông thường, không có quyền vào Cổng Quản trị VEXE.");
          toast.error("Tài khoản không có thẩm quyền Quản trị!");
          return;
        }

        toast.success("Xác thực Quản trị viên thành công! Đang chuyển hướng...");
        navigate('/admin');
      } else {
        setErrorMessage(response.data.message || 'Đăng nhập thất bại.');
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Lỗi xác thực hệ thống hoặc sai mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-[#0b1120] text-slate-100 font-sans selection:bg-blue-500/30 overflow-hidden px-4 py-12">
      <div className="relative z-10 w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-400 text-xs font-semibold tracking-wider uppercase mb-3">
            <Cpu size={14} />
            <span>Trung Tâm Điều Hành & An Ninh VEXE</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center justify-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Shield size={20} />
            </div>
            <span>PORTAL ADMIN</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1.5">
            Xác thực phiên làm việc đặc quyền dành cho Quản trị viên & Điều phối viên
          </p>
        </div>

        {/* Security Card */}
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-8 sm:p-9 shadow-xl">
          {/* Error Notification Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
              <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username/Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Mã Cán Bộ / Email Quản Trị
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
                  placeholder="admin@vexe.vn hoặc STAFF001"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 transition-colors outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Mật Mã Bảo Mật
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 transition-colors outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <span>{isLoading ? 'Đang xác minh quyền...' : 'XÁC THỰC & MỞ DASHBOARD'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Helper Credentials Note */}
          <div className="mt-6 pt-5 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Terminal size={14} className="text-cyan-400" />
              <span>Mặc định: <code className="text-slate-200 font-mono">admin@vexe.vn / 123456</code></span>
            </div>
          </div>
        </div>

        {/* Back to Client Home Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Quay về Cổng Khách Hàng</span>
          </button>
        </div>
      </div>
    </div>
  );
};
