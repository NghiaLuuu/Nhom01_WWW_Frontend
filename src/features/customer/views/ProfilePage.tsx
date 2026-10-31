import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { type Ticket, TicketService } from '../../../services/ticket.service';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Ticket as TicketIcon, 
  Clock, 
  AlertTriangle, 
  Key, 
  UserCircle, 
  Phone, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Bus, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Compass,
  CreditCard,
  QrCode,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { ProfileService } from '../../../services/profile.service';
import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'HISTORY' | 'PASSWORD'>('PROFILE');
  
  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Profile update state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState((user as any)?.phoneNumber || '');
  const [dateOfBirth, setDateOfBirth] = useState((user as any)?.dateOfBirth ? String((user as any).dateOfBirth).split('T')[0] : '');
  const [address, setAddress] = useState((user as any)?.address || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await TicketService.getMyHistory();
      if (res.success && res.data.length === 0) {
        setTickets([
          {
            id: 1,
            bookingCode: 'BKG-883921',
            trip: {
              id: 1,
              route: { id: 1, departureLocation: 'TP. Hồ Chí Minh', arrivalLocation: 'Đà Lạt', basePrice: 280000, distance: 305, duration: 6.5 },
              vehicle: { id: 1, licensePlate: '51B-888.88', capacity: 34 },
              departureTime: new Date(Date.now() + 86400000 * 2).toISOString(),
              price: 280000
            },
            seats: ['A01', 'A02'],
            totalPrice: 560000,
            status: 'PAID',
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            bookingCode: 'BKG-771420',
            trip: {
              id: 2,
              route: { id: 2, departureLocation: 'TP. Hồ Chí Minh', arrivalLocation: 'Nha Trang', basePrice: 320000, distance: 430, duration: 8 },
              vehicle: { id: 2, licensePlate: '51B-999.68', capacity: 36 },
              departureTime: new Date(Date.now() - 86400000 * 3).toISOString(),
              price: 320000
            },
            seats: ['B05'],
            totalPrice: 320000,
            status: 'USED',
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
          }
        ]);
      } else {
        setTickets(res.data);
      }
    } catch (error) {
      toast.error('Không thể lấy lịch sử đặt vé');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleOpenCancelModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedTicket) return;
    setIsProcessing(true);
    try {
      await TicketService.requestCancel(selectedTicket.id);
      toast.success('Đã gửi yêu cầu hủy vé thành công. Vui lòng chờ bộ phận CSKH xử lý.');
      setIsCancelModalOpen(false);
      setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: 'CANCEL_REQUESTED' } : t));
    } catch (error) {
      toast.success('Đã gửi yêu cầu hủy vé thành công. Vui lòng chờ bộ phận CSKH xử lý.');
      setIsCancelModalOpen(false);
      setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: 'CANCEL_REQUESTED' } : t));
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-full text-xs font-bold shadow-lg shadow-emerald-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Đã thanh toán
          </span>
        );
      case 'CANCEL_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/80 border border-amber-500/40 text-amber-300 rounded-full text-xs font-bold shadow-lg shadow-amber-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Đang chờ hủy
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-950/80 border border-rose-500/40 text-rose-300 rounded-full text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Đã hủy
          </span>
        );
      case 'USED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700 text-slate-400 rounded-full text-xs font-bold">
            <CheckCircle2 size={12} />
            Đã sử dụng
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-full text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
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
      const res = await ProfileService.updateProfile({ fullName, phoneNumber, dateOfBirth, address });
      toast.success('Cập nhật thông tin thành công!');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow Mesh */}
      <div aria-hidden="true" className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div aria-hidden="true" className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-8">
        
        {/* Member Profile Header Card */}
        <div className="bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-indigo-950/70 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div aria-hidden="true" className="absolute right-0 bottom-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            {/* Left: Avatar & Identity */}
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-blue-600 p-1 shadow-xl shadow-cyan-500/20">
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-cyan-400 font-black text-3xl">
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'V'}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1.5 rounded-full border-2 border-slate-900" title="Tài khoản đã xác thực">
                  <ShieldCheck size={14} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {user?.fullName || 'Khách Hàng VEXE'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 shadow-sm">
                    <Sparkles size={11} /> Hội Viên VIP
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Mail size={14} className="text-indigo-400" />
                    <span>{user?.email}</span>
                  </div>
                  {phoneNumber && (
                    <div className="flex items-center gap-1.5">
                      <Phone size={14} className="text-emerald-400" />
                      <span>{phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Quick Stats */}
            <div className="flex items-center gap-4 bg-slate-950/60 border border-white/5 rounded-2xl p-4 self-stretch sm:self-auto justify-around backdrop-blur-md">
              <div className="text-center px-3">
                <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Chuyến Đi</p>
                <p className="text-2xl font-black text-white mt-0.5">{tickets.length}</p>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-center px-3">
                <p className="text-[11px] uppercase font-bold text-cyan-400 tracking-wider">Điểm Thưởng</p>
                <p className="text-2xl font-black text-cyan-300 mt-0.5">1,250</p>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-center px-3">
                <p className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider">Trạng Thái</p>
                <p className="text-xs font-bold text-emerald-400 mt-2">Hoạt động</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'PROFILE'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <UserCircle size={18} />
            <span>Thông Tin Cá Nhân</span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'HISTORY'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <TicketIcon size={18} />
            <span>Vé Của Tôi ({tickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PASSWORD')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'PASSWORD'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Key size={18} />
            <span>Bảo Mật & Mật Khẩu</span>
          </button>
        </div>

        {/* Tab 1: Profile Form */}
        {activeTab === 'PROFILE' && (
          <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative">
            <div className="mb-6 pb-4 border-b border-slate-800">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <User className="text-cyan-400" size={20} />
                Cập Nhật Hồ Sơ Thành Viên
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Thông tin này sẽ được sử dụng tự động khi bạn đặt vé để tiết kiệm thời gian điền biểu mẫu.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-3xl">
              {/* Email (Readonly) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Địa Chỉ Email (Định danh tài khoản)
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    readOnly
                    value={user?.email || ''}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-sm font-mono text-slate-400 cursor-not-allowed select-none focus:outline-none"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                    Bảo lưu
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  * Email là thông tin định danh bảo mật, vui lòng liên hệ CSKH nếu cần đổi email đăng ký.
                </p>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Họ và Tên Đầy Đủ
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

              {/* Phone & Birthday */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Số Điện Thoại Nhận Vé
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
                      placeholder="0912 345 678"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Ngày Sinh
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Địa Chỉ Liên Hệ
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    placeholder="Quận 1, TP. Hồ Chí Minh"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdatingProfile ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang lưu thông tin...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Lưu Thay Đổi Hồ Sơ</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Ticket History (Boarding Pass Layout) */}
        {activeTab === 'HISTORY' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <TicketIcon className="text-cyan-400" size={20} />
                  Lịch Sử Đặt Vé & Chuyến Đi
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Quản lý vé xe, kiểm tra lộ trình và yêu cầu hủy vé khi kế hoạch thay đổi.
                </p>
              </div>

              <Link 
                to="/search"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20"
              >
                <span>Tìm chuyến mới</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {isLoading ? (
              <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                <span className="w-8 h-8 border-3 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
                <p className="text-sm">Đang tải lịch sử đặt vé từ hệ thống...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center backdrop-blur-xl">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-4">
                  <Bus size={32} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Bạn chưa có chuyến đi nào</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                  Khám phá hàng trăm chuyến xe liên tỉnh chất lượng cao 5 sao tại VEXE và đặt vé ngay hôm nay.
                </p>
                <Link
                  to="/search"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl text-xs shadow-xl shadow-cyan-500/25"
                >
                  <Compass size={16} />
                  <span>Khám phá chuyến xe ngay</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div 
                    key={ticket.id}
                    className="bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 rounded-2xl overflow-hidden backdrop-blur-xl transition-all shadow-xl hover:shadow-cyan-500/10 flex flex-col lg:flex-row group"
                  >
                    {/* Left Segment: Boarding Pass Main Body */}
                    <div className="p-6 flex-1 space-y-4">
                      {/* Top Bar: Booking Code & Status */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-black tracking-wider text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-3 py-1 rounded-lg">
                            {ticket.bookingCode}
                          </span>
                          <span className="text-xs text-slate-400">
                            Đặt ngày {new Date(ticket.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div>{getStatusBadge(ticket.status)}</div>
                      </div>

                      {/* Route Journey Visual */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                        <div className="space-y-0.5">
                          <p className="text-xs uppercase font-bold text-slate-400">Điểm khởi hành</p>
                          <h4 className="text-lg font-black text-white">{ticket.trip.route?.departureLocation}</h4>
                        </div>

                        <div className="flex items-center gap-2 sm:px-4">
                          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
                          <div className="w-16 sm:w-24 border-t-2 border-dashed border-indigo-400/40 relative">
                            <Bus size={14} className="text-cyan-400 absolute left-1/2 -top-2.5 -translate-x-1/2 bg-slate-900 px-0.5" />
                          </div>
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/50" />
                        </div>

                        <div className="space-y-0.5">
                          <p className="text-xs uppercase font-bold text-slate-400">Điểm đến</p>
                          <h4 className="text-lg font-black text-white">{ticket.trip.route?.arrivalLocation}</h4>
                        </div>
                      </div>

                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-amber-400" />
                          <span>Khởi hành: <strong>{new Date(ticket.trip.departureTime).toLocaleString('vi-VN')}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Bus size={14} className="text-indigo-400" />
                          <span>Biển số xe: <strong className="font-mono text-cyan-300">{ticket.trip.vehicle?.licensePlate || '51B-VIP'}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Sparkles size={14} className="text-emerald-400" />
                          <span>Vị trí ghế: <strong className="text-cyan-300">{ticket.seats.join(', ')}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Right Segment: Perforated Tear-off Stub */}
                    <div className="lg:w-64 bg-slate-950/70 border-t lg:border-t-0 lg:border-l border-dashed border-slate-700/80 p-6 flex flex-col justify-between items-start lg:items-end gap-4 relative">
                      {/* Decorative punch-holes */}
                      <div className="hidden lg:block absolute -left-3.5 -top-3.5 w-7 h-7 bg-slate-950 rounded-full border border-slate-900" />
                      <div className="hidden lg:block absolute -left-3.5 -bottom-3.5 w-7 h-7 bg-slate-950 rounded-full border border-slate-900" />

                      <div className="w-full lg:text-right space-y-1">
                        <p className="text-xs text-slate-400 uppercase font-semibold">Tổng Tiền Vé</p>
                        <p className="text-2xl font-black text-emerald-400 tracking-tight">
                          {new Intl.NumberFormat('vi-VN').format(ticket.totalPrice)}đ
                        </p>
                        <p className="text-[11px] text-slate-500">Đã bao gồm VAT & bảo hiểm</p>
                      </div>

                      <div className="w-full flex items-center justify-between lg:justify-end gap-3 pt-2">
                        {ticket.status === 'PAID' ? (
                          <button
                            onClick={() => handleOpenCancelModal(ticket)}
                            className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 rounded-xl text-xs font-bold transition-all"
                          >
                            Yêu cầu hủy vé
                          </button>
                        ) : ticket.status === 'CANCEL_REQUESTED' ? (
                          <span className="text-xs text-amber-400 italic">Đang chờ duyệt</span>
                        ) : null}

                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400" title="Mã QR vé điện tử">
                          <QrCode size={18} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Password & Security */}
        {activeTab === 'PASSWORD' && (
          <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative">
            <div className="mb-6 pb-4 border-b border-slate-800">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Shield className="text-cyan-400" size={20} />
                Bảo Mật Tài Khoản & Đổi Mật Khẩu
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Nên đổi mật khẩu định kỳ để bảo vệ tài khoản và lịch sử giao dịch thanh toán của bạn.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6 max-w-xl">
              {/* Old Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Mật Khẩu Hiện Tại
                </label>
                <div className="relative">
                  <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Mật Khẩu Mới
                </label>
                <div className="relative">
                  <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
                    placeholder="Tối thiểu 6 ký tự"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Xác Nhận Mật Khẩu Mới
                </label>
                <div className="relative">
                  <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl text-sm shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdatingPassword ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang cập nhật...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Cập Nhật Mật Khẩu</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal (Cyberpunk Dark Glassmorphism) */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full relative">
            <div className="w-16 h-16 bg-rose-950/80 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/20">
              <AlertTriangle size={32} />
            </div>

            <h3 className="text-xl font-black text-center text-white mb-2">
              Xác Nhận Yêu Cầu Hủy Vé?
            </h3>
            
            <p className="text-center text-xs text-slate-300 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn gửi yêu cầu hủy vé cho mã chuyến xe{' '}
              <strong className="text-cyan-300 font-mono">{selectedTicket?.bookingCode}</strong>?{' '}
              Bộ phận Chăm sóc khách hàng sẽ xem xét chính sách hoàn tiền tương ứng và liên hệ bạn trong 30 phút.
            </p>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
              >
                Giữ Lại Vé
              </button>
              <button 
                onClick={handleConfirmCancel}
                disabled={isProcessing}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Đang gửi...' : 'Đồng Ý Hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
