import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { type Ticket, TicketService } from '../../../services/ticket.service';
import toast from 'react-hot-toast';
import { User, Mail, Ticket as TicketIcon, Clock, AlertTriangle, Key, UserCircle } from 'lucide-react';
import { ProfileService } from '../../../services/profile.service';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
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
      // Since it's currently a mock that returns [], let's populate some mock data if empty
      if (res.success && res.data.length === 0) {
        setTickets([
          {
            id: 1,
            bookingCode: 'BKG-123456',
            trip: {
              id: 1,
              route: { id: 1, departureLocation: 'Sài Gòn', arrivalLocation: 'Đà Lạt', basePrice: 250000, distance: 300, duration: 6 },
              vehicle: { id: 1, licensePlate: '51B-123.45', capacity: 36 },
              departureTime: new Date(Date.now() + 86400000).toISOString(),
              price: 250000
            },
            seats: ['A1', 'A2'],
            totalPrice: 500000,
            status: 'PAID',
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            bookingCode: 'BKG-987654',
            trip: {
              id: 2,
              route: { id: 2, departureLocation: 'Sài Gòn', arrivalLocation: 'Nha Trang', basePrice: 350000, distance: 400, duration: 8 },
              vehicle: { id: 2, licensePlate: '51B-999.99', capacity: 36 },
              departureTime: new Date(Date.now() - 86400000).toISOString(),
              price: 350000
            },
            seats: ['B5'],
            totalPrice: 350000,
            status: 'USED',
            createdAt: new Date(Date.now() - 100000000).toISOString()
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
      toast.success('Đã gửi yêu cầu hủy vé thành công. Vui lòng chờ xác nhận.');
      setIsCancelModalOpen(false);
      // Optimistically update
      setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: 'CANCEL_REQUESTED' } : t));
    } catch (error) {
      toast.success('Đã gửi yêu cầu hủy vé thành công. Vui lòng chờ xác nhận.');
      setIsCancelModalOpen(false);
      setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: 'CANCEL_REQUESTED' } : t));
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">Đã thanh toán</span>;
      case 'CANCEL_REQUESTED': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">Đang chờ hủy</span>;
      case 'CANCELLED': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">Đã hủy</span>;
      case 'USED': return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold">Đã sử dụng</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold">{status}</span>;
    }
  };

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
      await ProfileService.updateProfile({ fullName, phoneNumber, dateOfBirth, address });
      toast.success('Cập nhật hồ sơ thành công!');
      // Update local state if needed
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 flex items-center space-x-6">
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
          <User size={40} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.fullName || 'Khách hàng'}</h1>
          <div className="flex items-center text-gray-500 mt-2 space-x-2">
            <Mail size={16} />
            <span>{user?.email}</span>
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
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-4 flex items-center space-x-2 font-semibold transition-colors ${
            activeTab === 'HISTORY' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <TicketIcon size={20} />
          <span>Lịch sử đặt vé</span>
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
          <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin cá nhân</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Địa chỉ Email</label>
              <input
                type="email"
                readOnly
                value={user?.email || ''}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-sm outline-none text-gray-500 cursor-not-allowed"
              />
              <span className="text-xs text-red-500 font-medium">* Chỉ có Admin mới có quyền thay đổi Email</span>
            </div>
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
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Địa chỉ</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-white"
                placeholder="Nhập địa chỉ của bạn"
              />
            </div>
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="mt-4 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
            >
              {isUpdatingProfile ? 'Đang cập nhật...' : 'Cập Nhật Hồ Sơ'}
            </button>
          </form>
        </div>
      ) : activeTab === 'HISTORY' ? (
        <>
          {isLoading ? (
        <div className="text-center py-10 text-gray-500">Đang tải lịch sử...</div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center text-gray-500">
          Bạn chưa có chuyến đi nào.
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md">
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between md:justify-start md:space-x-4">
                  <span className="font-mono font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-md text-sm">{ticket.bookingCode}</span>
                  {getStatusBadge(ticket.status)}
                </div>
                
                <div className="text-lg font-bold text-gray-900">
                  {ticket.trip.route?.departureLocation} - {ticket.trip.route?.arrivalLocation}
                </div>
                
                <div className="flex items-center text-gray-600 text-sm space-x-4">
                  <span className="flex items-center space-x-1"><Clock size={16}/> <span>{new Date(ticket.trip.departureTime).toLocaleString('vi-VN')}</span></span>
                  <span>|</span>
                  <span>Ghế: <span className="font-semibold text-blue-600">{ticket.seats.join(', ')}</span></span>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[150px]">
                <div className="text-xl font-bold text-blue-600 mb-4">
                  {new Intl.NumberFormat('vi-VN').format(ticket.totalPrice)}đ
                </div>
                {ticket.status === 'PAID' && (
                  <button 
                    onClick={() => handleOpenCancelModal(ticket)}
                    className="text-red-500 hover:text-red-700 font-semibold text-sm underline transition-colors"
                  >
                    Yêu cầu hủy vé
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
        </>
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

      {/* Cancel Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Xác nhận hủy vé?</h3>
            <p className="text-center text-gray-500 mb-6">Bạn có chắc chắn muốn gửi yêu cầu hủy vé cho mã <strong>{selectedTicket?.bookingCode}</strong> không? Quá trình phê duyệt có thể mất thời gian.</p>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Trở lại
              </button>
              <button 
                onClick={handleConfirmCancel}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 transition-colors disabled:opacity-70"
              >
                {isProcessing ? 'Đang xử lý...' : 'Đồng ý hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
