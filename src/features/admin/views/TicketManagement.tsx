import React, { useState, useEffect } from 'react';
import { BookingService } from '../../booking/api/booking.service';
import type { BookingItem, TicketItem, CancelRequestItem } from '../../booking/types/booking.types';
import { 
  Search, 
  RefreshCw, 
  Ticket, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Phone, 
  QrCode, 
  Eye, 
  ShieldCheck, 
  AlertCircle,
  FileCheck2,
  ListFilter
} from 'lucide-react';
import toast from 'react-hot-toast';

export const TicketManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BOOKINGS' | 'CANCEL_REQUESTS'>('BOOKINGS');
  
  // Bookings state
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchTicketCode, setSearchTicketCode] = useState('');

  // Cancel requests state
  const [cancelRequests, setCancelRequests] = useState<CancelRequestItem[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Selected Booking for Tickets Modal
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [bookingTickets, setBookingTickets] = useState<TicketItem[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  // Fetch Bookings from backend
  const fetchBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const res = await BookingService.searchBookings({
        phoneNumber: searchPhone.trim() || undefined,
        ticketCode: searchTicketCode.trim() || undefined,
      });
      if (res.success && Array.isArray(res.data)) {
        setBookings(res.data);
      } else {
        setBookings([]);
      }
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast.error('Lỗi khi tải danh sách đơn đặt vé');
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Fetch Cancel Requests
  const fetchCancelRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const res = await BookingService.getPendingCancelRequests();
      if (res.success && Array.isArray(res.data)) {
        setCancelRequests(res.data);
      } else {
        setCancelRequests([]);
      }
    } catch (error: any) {
      console.error('Error fetching cancel requests:', error);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'BOOKINGS') {
      fetchBookings();
    } else {
      fetchCancelRequests();
    }
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  // Open Tickets Modal for a booking
  const handleOpenTicketsModal = async (booking: BookingItem) => {
    setSelectedBooking(booking);
    setIsLoadingTickets(true);
    try {
      const res = await BookingService.getTicketsByBookingId(booking.id);
      if (res.success && Array.isArray(res.data)) {
        setBookingTickets(res.data);
      } else {
        setBookingTickets([]);
      }
    } catch (err) {
      toast.error('Không thể tải chi tiết danh sách vé');
    } finally {
      setIsLoadingTickets(false);
    }
  };

  // Update specific ticket status (Soát vé / Check-in)
  const handleUpdateTicketStatus = async (ticketId: number, status: 'USED' | 'CANCELLED' | 'ISSUED') => {
    const toastId = toast.loading('Đang cập nhật trạng thái vé...');
    try {
      const res = await BookingService.updateTicketStatus(ticketId, status);
      if (res.success) {
        toast.success(status === 'USED' ? 'Đã soát vé thành công (USED)!' : 'Đã cập nhật trạng thái vé!', { id: toastId });
        setBookingTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
      } else {
        toast.error(res.message || 'Cập nhật thất bại', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái vé', { id: toastId });
    }
  };

  // Resolve Cancel Request (Approve / Reject)
  const handleResolveRequest = async (requestId: number, isApproved: boolean) => {
    let rejectReason = '';
    if (!isApproved) {
      const promptRes = window.prompt('Nhập lý do từ chối yêu cầu hủy vé:');
      if (promptRes === null) return;
      rejectReason = promptRes;
    }

    const toastId = toast.loading(isApproved ? 'Đang duyệt hủy vé...' : 'Đang từ chối yêu cầu...');
    try {
      const res = await BookingService.resolveCancelRequest(requestId, isApproved, rejectReason);
      if (res.success) {
        toast.success(isApproved ? 'Đã duyệt hủy vé và hoàn tiền!' : 'Đã từ chối yêu cầu hủy vé!', { id: toastId });
        fetchCancelRequests();
        if (activeTab === 'BOOKINGS') fetchBookings();
      } else {
        toast.error(res.message || 'Xử lý thất bại', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi xử lý yêu cầu hủy vé', { id: toastId });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} className="mr-1" />
            Đã thanh toán
          </span>
        );
      case 'PENDING_PAYMENT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} className="mr-1" />
            Đang giữ chỗ
          </span>
        );
      case 'CANCEL_REQUESTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <AlertCircle size={12} className="mr-1" />
            Yêu cầu hủy
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={12} className="mr-1" />
            Đã hủy
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
            Hết hạn giữ chỗ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Ticket size={16} />
            <span>Hệ thống Quản lý Vé & Đơn Đặt Chỗ</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Quản lý Đơn Đặt Vé & Soát Vé
          </h1>
          <p className="text-xs text-gray-500">
            Tra cứu đơn vé thời gian thực theo số điện thoại, mã vé, soát vé lên xe và xử lý yêu cầu hủy vé.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (activeTab === 'BOOKINGS') fetchBookings();
              else fetchCancelRequests();
            }}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors flex items-center space-x-2 text-xs font-bold"
          >
            <RefreshCw size={15} className={isLoadingBookings || isLoadingRequests ? 'animate-spin text-blue-600' : ''} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher & Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('BOOKINGS')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'BOOKINGS'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Đơn đặt vé ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('CANCEL_REQUESTS')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'CANCEL_REQUESTS'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Yêu cầu hủy vé ({cancelRequests.length})
            </button>
          </div>

          {activeTab === 'BOOKINGS' && (
            <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
              <input 
                type="text"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="Tìm theo Số điện thoại..."
                className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <input 
                type="text"
                value={searchTicketCode}
                onChange={(e) => setSearchTicketCode(e.target.value)}
                placeholder="Tìm theo Mã vé (VX...)..."
                className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1"
              >
                <Search size={14} />
                <span>Tìm kiếm</span>
              </button>
              {(searchPhone || searchTicketCode) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchPhone('');
                    setSearchTicketCode('');
                    BookingService.searchBookings({}).then(res => {
                      if (res.success && Array.isArray(res.data)) setBookings(res.data);
                    });
                  }}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-semibold"
                >
                  Xóa lọc
                </button>
              )}
            </form>
          )}
        </div>

        {/* Content Area */}
        {activeTab === 'BOOKINGS' ? (
          <div className="overflow-x-auto">
            {isLoadingBookings ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-500 font-medium">Đang tải danh sách đơn đặt vé...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 text-gray-500 space-y-2">
                <Ticket size={40} className="mx-auto text-gray-300" />
                <p className="text-sm font-bold text-gray-700">Không tìm thấy đơn đặt vé nào</p>
                <p className="text-xs text-gray-400">Hãy thử tìm kiếm với số điện thoại hoặc mã vé khác.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Mã đơn</th>
                    <th className="py-3.5 px-4">Khách hàng</th>
                    <th className="py-3.5 px-4">Tuyến xe</th>
                    <th className="py-3.5 px-4">Thời gian chạy</th>
                    <th className="py-3.5 px-4">Tổng tiền</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-black text-blue-600 whitespace-nowrap">
                        #{b.id}
                        <div className="text-[10px] text-gray-400 font-normal">
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString('vi-VN') : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{b.customer?.fullName || 'Khách vãng lai'}</div>
                        <div className="text-[11px] text-gray-500 flex items-center space-x-1">
                          <Phone size={10} className="text-gray-400" />
                          <span>{b.customer?.phoneNumber || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-800">
                          {b.trip?.route?.departureLocation} → {b.trip?.route?.arrivalLocation}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {b.trip?.vehicle?.licensePlate} ({b.trip?.vehicle?.type || 'Xe khách'})
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">
                          {b.trip?.departureTime ? new Date(b.trip.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {b.trip?.departureTime ? new Date(b.trip.departureTime).toLocaleDateString('vi-VN') : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-black text-gray-900 whitespace-nowrap">
                        {new Intl.NumberFormat('vi-VN').format(b.totalPrice)}₫
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(b.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenTicketsModal(b)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-colors inline-flex items-center space-x-1.5"
                        >
                          <QrCode size={13} />
                          <span>Soát vé & QR</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          /* Cancel Requests Tab */
          <div className="overflow-x-auto">
            {isLoadingRequests ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-500 font-medium">Đang tải danh sách yêu cầu hủy vé...</p>
              </div>
            ) : cancelRequests.length === 0 ? (
              <div className="text-center py-16 text-gray-500 space-y-2">
                <CheckCircle2 size={40} className="mx-auto text-emerald-400" />
                <p className="text-sm font-bold text-gray-700">Hiện không có yêu cầu hủy vé nào đang chờ xử lý</p>
                <p className="text-xs text-gray-400">Tất cả các đơn đã được giải quyết hoặc chưa có yêu cầu mới.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Mã Yêu Cầu</th>
                    <th className="py-3.5 px-4">Mã Đơn Đặt</th>
                    <th className="py-3.5 px-4">Lý do hủy</th>
                    <th className="py-3.5 px-4">Thời gian gửi</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Xử lý (Staff)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {cancelRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        REQ-{req.id}
                      </td>
                      <td className="py-3.5 px-4 font-black text-blue-600">
                        #{req.booking?.id || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs text-gray-800">
                        {req.reason || 'Khách yêu cầu hủy vé'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-500">
                        {req.createdAt ? new Date(req.createdAt).toLocaleString('vi-VN') : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          req.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {req.status === 'PENDING' ? 'Chờ duyệt' : req.status === 'APPROVED' ? 'Đã duyệt hủy' : 'Đã từ chối'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {req.status === 'PENDING' && (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleResolveRequest(req.id, true)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors text-xs"
                            >
                              Duyệt hủy
                            </button>
                            <button
                              onClick={() => handleResolveRequest(req.id, false)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl transition-colors text-xs"
                            >
                              Từ chối
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Tickets & QR Inspection Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  CHI TIẾT SOÁT VÉ
                </span>
                <h3 className="text-xl font-black text-gray-900">
                  Đơn hàng #{selectedBooking.id} • {selectedBooking.customer?.fullName || 'Khách hàng'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold"
              >
                ✕
              </button>
            </div>

            {isLoadingTickets ? (
              <div className="text-center py-12 space-y-2">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-500">Đang tải danh sách vé và mã QR...</p>
              </div>
            ) : bookingTickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Không có vé riêng lẻ nào được tạo cho đơn này.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookingTickets.map((ticket) => (
                  <div key={ticket.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      {/* QR Thumbnail */}
                      <div className="w-20 h-20 bg-white p-1 rounded-xl border border-gray-200 flex items-center justify-center flex-shrink-0">
                        {ticket.qrCode ? (
                          <img 
                            src={`data:image/png;base64,${ticket.qrCode}`} 
                            alt="QR" 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <QrCode size={40} className="text-gray-400" />
                        )}
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-blue-600 text-sm font-mono">{ticket.ticketCode}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ticket.status === 'USED' ? 'bg-blue-100 text-blue-800' :
                            ticket.status === 'ISSUED' ? 'bg-emerald-100 text-emerald-800' :
                            ticket.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {ticket.status === 'USED' ? 'Đã soát vé (USED)' : ticket.status}
                          </span>
                        </div>
                        <p className="text-gray-700 font-bold">
                          Ghế: <span className="text-blue-700 text-sm">{ticket.seat?.seatName || 'N/A'}</span> (Tầng {ticket.seat?.floor || 1})
                        </p>
                        <p className="text-gray-500 text-[11px]">
                          Giá vé: {new Intl.NumberFormat('vi-VN').format(ticket.price)}₫
                        </p>
                      </div>
                    </div>

                    {/* Staff Control Buttons */}
                    <div className="flex items-center space-x-2">
                      {ticket.status !== 'USED' && (
                        <button
                          onClick={() => handleUpdateTicketStatus(ticket.id, 'USED')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
                        >
                          Soát vé lên xe
                        </button>
                      )}
                      {ticket.status === 'USED' && (
                        <button
                          onClick={() => handleUpdateTicketStatus(ticket.id, 'ISSUED')}
                          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold text-xs transition-colors"
                        >
                          Hoàn tác
                        </button>
                      )}
                      {ticket.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleUpdateTicketStatus(ticket.id, 'CANCELLED')}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold text-xs transition-colors"
                        >
                          Hủy vé
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

