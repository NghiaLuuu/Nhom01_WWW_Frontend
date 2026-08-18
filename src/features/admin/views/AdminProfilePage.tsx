import React, { useState } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { ProfileService } from '../../../services/profile.service';
import toast from 'react-hot-toast';
import { User, Mail, Key, UserCircle, Briefcase, MapPin } from 'lucide-react';

export const AdminProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'PASSWORD'>('PROFILE');
  
  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Profile update state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState((user as any)?.phoneNumber || '');
  const [dateOfBirth, setDateOfBirth] = useState((user as any)?.dateOfBirth ? String((user as any).dateOfBirth).split('T')[0] : '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
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
      // Update local state if the backend returns the updated user object
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 flex items-center space-x-6">
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
          <User size={40} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{user?.fullName || 'Nhân viên'}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center text-gray-600 space-x-2">
              <Mail size={16} className="text-gray-400" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center text-gray-600 space-x-2">
              <Briefcase size={16} className="text-gray-400" />
              <span>Vai trò: <strong className="text-gray-800">{(user as any)?.role?.name?.replace('ROLE_', '') || user?.role || 'Nhân viên'}</strong></span>
            </div>
            <div className="flex items-center text-gray-600 space-x-2">
              <MapPin size={16} className="text-gray-400" />
              <span>Trạm làm việc: <strong className="text-gray-800">{(user as any)?.workStation || 'Không xác định'}</strong></span>
            </div>
            <div className="flex items-center text-gray-600 space-x-2">
              <span className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold">#</span>
              <span>Mã NV: <strong className="text-gray-800">{(user as any)?.staffCode || 'N/A'}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`pb-4 flex items-center space-x-2 font-semibold transition-colors ${
            activeTab === 'PROFILE' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserCircle size={20} />
          <span>Thông tin cá nhân</span>
        </button>
        <button
          onClick={() => setActiveTab('PASSWORD')}
          className={`pb-4 flex items-center space-x-2 font-semibold transition-colors ${
            activeTab === 'PASSWORD' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Key size={20} />
          <span>Đổi mật khẩu</span>
        </button>
      </div>

      {activeTab === 'PROFILE' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-2xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Cập nhật thông tin</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Họ và Tên</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-white"
                placeholder="Nhập họ và tên"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Số điện thoại</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-white"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Ngày sinh</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-white"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="mt-4 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
            >
              {isUpdatingProfile ? 'Đang cập nhật...' : 'Lưu Thay Đổi'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-2xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Đổi mật khẩu</h2>
          <form onSubmit={handleChangePassword} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Mật khẩu cũ</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-white"
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Mật khẩu mới</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-white"
                placeholder="Nhập mật khẩu mới"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-white"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="mt-4 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
            >
              {isUpdatingPassword ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
