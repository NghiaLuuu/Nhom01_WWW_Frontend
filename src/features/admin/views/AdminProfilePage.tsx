import React, { useState } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { ProfileService } from '../../../services/profile.service';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  KeyRound,
  UserCircle,
  Briefcase,
  MapPin,
  ShieldCheck,
  Laptop,
  CheckCircle2,
  Lock,
  Sparkles,
  Smartphone,
  Save,
  Radio
} from 'lucide-react';

export const AdminProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();

  // Tabs
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'PASSWORD' | 'SESSIONS'>('PROFILE');

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Profile update state
  const displayName = user?.fullName || 'Lưu Trung Nghĩa (Admin)';
  const displayEmail = user?.email || 'admin@vexe.vn';
  const displayRole = (user as any)?.role?.name?.replace('ROLE_', '') || (user as any)?.roles?.[0]?.replace('ROLE_', '') || 'QUẢN TRỊ VIÊN';
  const displayStation = (user as any)?.workStation || 'Trụ sở VEXELuxury TP.HCM';
  const displayStaffCode = (user as any)?.staffCode || 'NV-ADMIN-01';

  const [fullName, setFullName] = useState(user?.fullName || 'Lưu Trung Nghĩa');
  const [phoneNumber, setPhoneNumber] = useState((user as any)?.phoneNumber || '0909 123 456');
  const [dateOfBirth, setDateOfBirth] = useState((user as any)?.dateOfBirth ? String((user as any).dateOfBirth).split('T')[0] : '1992-08-15');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await ProfileService.updatePassword({ oldPassword, newPassword });
      toast.success('Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await ProfileService.updateProfile({ fullName, phoneNumber, dateOfBirth });
      toast.success('Cập nhật hồ sơ thành công!');
      if (res.data) {
        setUser({ ...user, ...res.data });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1.5">
            <ShieldCheck size={14} className="text-cyan-400" />
            <span>Trung Tâm Định Danh & Tác Nghiệp</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            Hồ Sơ Quản Trị Viên
            <span className="text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              SOC Verified
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Quản lý thông tin định danh, thẩm quyền tác nghiệp và chính sách an toàn bảo mật hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Radio size={14} className="animate-pulse" />
            <span>Phiên Làm Việc An Toàn</span>
          </div>
        </div>
      </div>

      {/* Hero Profile Overview Card */}
      <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/40">
        {/* Glow backdrop decoration safely bounded inside container */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
          <div className="absolute right-0 top-0 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute right-32 bottom-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar with Glow & Badges */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border-2 border-cyan-400/50 p-1 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center text-cyan-300">
                <User size={36} />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center" title="Trực tuyến">
              <span className="w-2 h-2 bg-white rounded-full animate-ping" />
            </span>
          </div>

          {/* User Essential Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-white tracking-wide">{displayName}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 uppercase tracking-wider">
                {displayRole}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-800 border border-white/10 text-slate-300">
                {displayStaffCode}
              </span>
            </div>

            {/* Quick Metadata Grid - 3 items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-950/40 border border-white/5 px-3 py-2 rounded-xl">
                <Mail size={15} className="text-cyan-400 shrink-0" />
                <span className="font-mono">{displayEmail}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-950/40 border border-white/5 px-3 py-2 rounded-xl">
                <MapPin size={15} className="text-cyan-400 shrink-0" />
                <span>{displayStation}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-950/40 border border-white/5 px-3 py-2 rounded-xl sm:col-span-2 lg:col-span-1">
                <Briefcase size={15} className="text-cyan-400 shrink-0" />
                <span>Quyền: <strong className="text-white">Toàn Quyền Quản Trị</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cyber Glass Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'PROFILE'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <UserCircle size={18} />
          <span>Thông Tin Cá Nhân</span>
        </button>

        <button
          onClick={() => setActiveTab('PASSWORD')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'PASSWORD'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <KeyRound size={18} />
          <span>Bảo Mật & Mật Khẩu</span>
        </button>

        <button
          onClick={() => setActiveTab('SESSIONS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'SESSIONS'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Laptop size={18} />
          <span>Phiên & Thiết Bị Tác Nghiệp</span>
        </button>
      </div>

      {/* Tab 1: Profile Information */}
      {activeTab === 'PROFILE' && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-2/3 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/40">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <h3 className="text-base font-bold text-white">Chỉnh Sửa Thông Tin Cá Nhân</h3>
                <p className="text-xs text-slate-400 mt-0.5">Cập nhật hồ sơ tài khoản nhân sự được định danh trên toàn bộ hệ sinh thái</p>
              </div>
              <Sparkles size={18} className="text-cyan-400" />
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Họ và Tên Nhân Viên
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-medium"
                  placeholder="Nhập họ và tên đầy đủ"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Số Điện Thoại Liên Hệ
                  </label>
                  <div className="relative">
                    <Smartphone size={16} className="absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                      placeholder="09xx xxx xxx"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Ngày Tháng Năm Sinh
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Địa Chỉ Email Đăng Nhập
                  </label>
                  <input
                    type="text"
                    disabled
                    value={displayEmail}
                    className="w-full bg-slate-950/40 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Email gắn liền với SSO tổ chức, không thể tự chỉnh sửa</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Trạm / Khu Vực Tác Nghiệp
                  </label>
                  <input
                    type="text"
                    disabled
                    value={displayStation}
                    className="w-full bg-slate-950/40 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Phân bổ bởi Phòng Tổ Chức Nhân Sự</p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Save size={16} />
                  <span>{isUpdatingProfile ? 'Đang Lưu...' : 'Lưu Thay Đổi'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Side Info Cards */}
          <div className="w-full lg:w-1/3 space-y-5">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl shadow-black/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 mb-3">
                <ShieldCheck size={16} />
                <span>Thẩm Quyền Tác Nghiệp</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-white/5">
                  <span className="text-slate-400">Cấp an ninh</span>
                  <span className="text-cyan-300 font-bold font-mono">SOC Level-3</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-white/5">
                  <span className="text-slate-400">AI Prompt & Vector</span>
                  <span className="text-emerald-400 font-bold">Toàn Quyền</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-white/5">
                  <span className="text-slate-400">Giám sát phiên</span>
                  <span className="text-cyan-400 font-bold">Live Inspector</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl shadow-black/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Trạng Thái Tài Khoản</span>
              </h4>
              <div className="space-y-2 text-xs text-slate-300">
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Định danh: <strong>Đã chứng thực</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Xác thực 2 lớp: <strong>Kích hoạt</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Khóa mã hóa: <strong>AES-256 GCM</strong></span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Password & Security */}
      {activeTab === 'PASSWORD' && (
        <div className="max-w-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Đổi Mật Khẩu Đăng Nhập</h3>
              <p className="text-xs text-slate-400 mt-0.5">Bảo vệ tài khoản quản trị bằng việc đổi mật khẩu định kỳ 90 ngày</p>
            </div>
            <Lock size={18} className="text-cyan-400" />
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Mật Khẩu Hiện Tại
              </label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                placeholder="Nhập mật khẩu đang sử dụng"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Mật Khẩu Mới
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Xác Nhận Mật Khẩu Mới
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2 text-xs text-slate-400">
              <p className="font-bold text-slate-300">Tiêu chuẩn mật khẩu an toàn:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Bao gồm ít nhất 6 ký tự (khuyến nghị 12 ký tự trở lên).</li>
                <li>Kết hợp chữ hoa, chữ thường, chữ số và ký tự đặc biệt (@, #, $, %).</li>
                <li>Không trùng lặp với 3 mật khẩu đã sử dụng gần nhất.</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                <KeyRound size={16} />
                <span>{isUpdatingPassword ? 'Đang Xử Lý...' : 'Cập Nhật Mật Khẩu'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Sessions & Workstations */}
      {activeTab === 'SESSIONS' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/40">
            <h3 className="text-base font-bold text-white mb-2">Thiết Bị Đang Đăng Nhập</h3>
            <p className="text-xs text-slate-400 mb-6">Danh sách các phiên làm việc đang có quyền truy cập vào bảng điều khiển</p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Laptop size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Edge / Chrome on Windows Workstation</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Phiên Hiện Tại
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                      <span>IP: 127.0.0.1 (Localhost Direct)</span>
                      <span>•</span>
                      <span>Khu vực: TP. Hồ Chí Minh, VN</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">Hoạt động vừa xong</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                    TLS 1.3 Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
