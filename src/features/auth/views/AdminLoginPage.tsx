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
    <div className="min-h-screen w-full relative flex items-center justify-center bg-slate-950 font-sans selection:bg-cyan-500/30 overflow-hidden px-4">
      {/* Futuristic Background Accents */}
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle Cyber Grid */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(56, 189, 248, 0.3) 1px, transparent 0)`,
            backgroundSize: '36px 36px'
          }}
        />
        {/* Glowing Orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-4 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Cpu size={14} className="animate-pulse" />
            <span>Trung Tâm Điều Hành & An Ninh VEXE</span>
          </div>
          
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
                <Shield className="text-cyan-400" size={22} />
              </div>
            </div>
            <span>PORTAL ADMIN</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Xác thực phiên làm việc đặc quyền dành cho Quản trị viên & Cán bộ Điều phối
          </p>
        </div>

        {/* Security Glass Card */}
        <div className="relative group">
          {/* Glowing Border Reflection */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/30 via-indigo-500/30 to-purple-500/30 rounded-3xl blur-sm group-hover:blur transition duration-500 pointer-events-none" />
          
          <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-9 shadow-2xl">
            {/* Error Notification Alert */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-3 animate-shake">
                <ShieldAlert size={18} className="text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username/Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider pl-1">
                  Mã Cán Bộ / Email Quản Trị
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin@vexe.vn hoặc STAFF001"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 hover:bg-white/[0.08] focus:bg-white/10 border border-white/10 focus:border-cyan-400/80 rounded-xl text-white text-sm placeholder:text-slate-500 transition-all outline-none focus:ring-4 focus:ring-cyan-500/15"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider pl-1">
                  Mật Mã Bảo Mật
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-white/5 hover:bg-white/[0.08] focus:bg-white/10 border border-white/10 focus:border-cyan-400/80 rounded-xl text-white text-sm placeholder:text-slate-500 transition-all outline-none focus:ring-4 focus:ring-cyan-500/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button with High Visual Punch */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 relative group/btn overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 p-[1px] focus:outline-none focus:ring-4 focus:ring-cyan-500/20 disabled:opacity-50 cursor-pointer transition-all duration-300"
              >
                <div className="w-full h-full py-3.5 px-6 rounded-[11px] bg-slate-950/40 group-hover/btn:bg-transparent transition duration-300 flex items-center justify-center gap-2">
                  <span className="text-sm font-bold text-white tracking-wide uppercase">
                    {isLoading ? 'Đang xác minh chữ ký điện tử...' : 'Xác Thực & Mở Dashboard'}
                  </span>
                  <ArrowRight size={16} className="text-cyan-300 group-hover/btn:translate-x-1 transition-transform" />
                </div>
              </button>
            </form>

            {/* Quick Helper Credentials Note */}
            <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Terminal size={14} className="text-cyan-400" />
                <span>Default: <code className="text-slate-200 font-mono">admin@vexe.vn / 123456</code></span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Client Home Link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Quay về Cổng Khách Hàng Công Cộng</span>
          </button>
        </div>
      </div>
    </div>
  );
};
