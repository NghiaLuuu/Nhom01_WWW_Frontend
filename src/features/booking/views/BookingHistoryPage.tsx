import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Ticket, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Hourglass, 
  Bus, 
  ArrowRight,
  LayoutGrid,
  List as ListIcon,
  QrCode,
  Download,
  Receipt
} from 'lucide-react';
import type { BookingItem, BookingStatus } from '../types/booking.types';
import { BookingService } from '../api/booking.service';
import { CancelTicketModal } from '../components/CancelTicketModal';
import { useAuthStore } from '../../../store/useAuthStore';
import toast from 'react-hot-toast';

const STATUS_TABS: { label: string; value: string; countKey?: string }[] = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Đã thanh toán', value: 'PAID' },
  { label: 'Chờ thanh toán', value: 'PENDING_PAYMENT' },
  { label: 'Đã hoàn thành', value: 'COMPLETED' },
  { label: 'Đã hủy', value: 'CANCELLED' },
];

const TIME_FILTERS = [
  { label: 'Mọi lúc', value: 'ALL' },
  { label: '7 ngày gần đây', value: '7_DAYS' },
  { label: '30 ngày gần đây', value: '30_DAYS' },
  { label: 'Năm nay', value: 'THIS_YEAR' },
];

export const BookingHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [activeStatus, setActiveStatus] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  // Cancel Modal State
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<BookingItem | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await BookingService.getMyHistory();
      if (res.success && Array.isArray(res.data)) {
        setBookings(res.data);
      } else if (Array.isArray(res.data)) {
        setBookings(res.data);
      } else {
        setBookings([]);
      }
    } catch (err: any) {
      console.error('Fetch booking history failed:', err);
      const msg = err.response?.data?.message || 'Không thể tải danh sách vé. Vui lòng thử lại sau.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  // Status Counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: bookings.length,
      PAID: 0,
      PENDING_PAYMENT: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    bookings.forEach((b) => {
      if (b.status === 'PAID') {
        const isPast = b.trip?.departureTime && new Date(b.trip.departureTime).getTime() < Date.now();
        if (isPast) {
          counts['COMPLETED'] = (counts['COMPLETED'] || 0) + 1;
        } else {
          counts['PAID'] = (counts['PAID'] || 0) + 1;
        }
      } else if (counts[b.status] !== undefined) {
        counts[b.status] = (counts[b.status] || 0) + 1;
      }
    });

    return counts;
  }, [bookings]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Status Filter
      const isPast = b.trip?.departureTime && new Date(b.trip.departureTime).getTime() < Date.now();
      const derivedStatus = b.status === 'PAID' && isPast ? 'COMPLETED' : b.status;

      if (activeStatus !== 'ALL' && derivedStatus !== activeStatus) {
        return false;
      }

      // 2. Time Filter
      if (timeFilter !== 'ALL' && b.createdAt) {
        const created = new Date(b.createdAt).getTime();
        const now = Date.now();
        const diffDays = (now - created) / (1000 * 60 * 60 * 24);

        if (timeFilter === '7_DAYS' && diffDays > 7) return false;
        if (timeFilter === '30_DAYS' && diffDays > 30) return false;
        if (timeFilter === 'THIS_YEAR') {
          const currentYear = new Date().getFullYear();
          if (new Date(b.createdAt).getFullYear() !== currentYear) return false;
        }
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const code = `bkg-${b.id}`.toLowerCase();
        const dep = b.trip?.route?.departureLocation?.toLowerCase() || '';
        const arr = b.trip?.route?.arrivalLocation?.toLowerCase() || '';
        const plate = b.trip?.vehicle?.licensePlate?.toLowerCase() || '';

        return (
          code.includes(q) ||
          dep.includes(q) ||
          arr.includes(q) ||
          plate.includes(q) ||
          b.id.toString().includes(q)
        );
      }

      return true;
    });
  }, [bookings, activeStatus, timeFilter, searchQuery]);

  // Paginated Bookings
  const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatus, timeFilter, searchQuery]);

  const getStatusBadge = (status: BookingStatus, departureTime?: string) => {
    const isPast = departureTime && new Date(departureTime).getTime() < Date.now();
    const effectiveStatus = status === 'PAID' && isPast ? 'COMPLETED' : status;

    switch (effectiveStatus) {
      case 'PAID':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} className="mr-1.5 text-emerald-600" />
            Đã thanh toán
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Bus size={13} className="mr-1.5 text-blue-600" />
            Đã hoàn thành
          </span>
        );
      case 'PENDING_PAYMENT':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Hourglass size={13} className="mr-1.5 text-amber-600" />
            Chờ thanh toán
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={13} className="mr-1.5 text-rose-600" />
            Đã hủy
          </span>
        );
      case 'CANCEL_REQUESTED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Hourglass size={13} className="mr-1.5 text-purple-600" />
            Đang yêu cầu hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 tracking-wider uppercase">
              <Ticket size={16} />
              <span>Quản lý chuyến đi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Lịch sử đặt vé của tôi
            </h1>
            <p className="text-sm text-gray-500">
              Xem lại các chuyến xe đã đặt, tải vé điện tử hoặc quản lý hủy vé dễ dàng.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors flex items-center justify-center"
              title="Tải lại dữ liệu"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin text-blue-600' : ''} />
            </button>
            <Link
              to="/search"
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-600/20 transition-all"
            >
              <Bus size={18} />
              <span>Đặt chuyến mới</span>
            </Link>
          </div>
        </div>

        {/* Filters & Status Tabs */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4">
          {/* Status Tabs Bar */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none border-b border-gray-100">
            {STATUS_TABS.map((tab) => {
              const count = statusCounts[tab.value] ?? 0;
              const isActive = activeStatus === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveStatus(tab.value)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search, Time Filter, View Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo mã đơn #ID, điểm đi, điểm đến, biển số..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  Xóa
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2.5">
              {/* Time Range Filter */}
              <div className="flex items-center space-x-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700">
                <Calendar size={14} className="text-gray-400" />
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="bg-transparent border-none text-xs font-semibold text-gray-800 focus:outline-none pr-2 cursor-pointer"
                >
                  {TIME_FILTERS.map((tf) => (
                    <option key={tf.value} value={tf.value}>
                      {tf.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Switcher (Desktop) */}
              <div className="hidden sm:flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                  }`}
                  title="Xem dạng thẻ"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                  }`}
                  title="Xem dạng bảng"
                >
                  <ListIcon size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          /* Loading Skeleton */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-pulse space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-gray-200 rounded-lg w-28" />
                  <div className="h-6 bg-gray-200 rounded-full w-24" />
                </div>
                <div className="h-10 bg-gray-100 rounded-xl" />
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="h-8 bg-gray-100 rounded-lg" />
                  <div className="h-8 bg-gray-100 rounded-lg" />
                  <div className="h-8 bg-gray-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-white rounded-3xl p-12 text-center border border-red-100 shadow-sm space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Không thể tải dữ liệu</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{error}</p>
            <button
              onClick={fetchBookings}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
            >
              <RefreshCw size={16} />
              <span>Thử lại</span>
            </button>
          </div>
        ) : filteredBookings.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-4 max-w-md mx-auto">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <Ticket size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900">Chưa có vé nào</h3>
              <p className="text-sm text-gray-500">
                {searchQuery || activeStatus !== 'ALL'
                  ? 'Không tìm thấy vé nào phù hợp với bộ lọc hiện tại.'
                  : 'Bạn chưa có lịch sử đặt vé nào. Hãy bắt đầu lên kế hoạch cho chuyến đi của bạn!'}
              </p>
            </div>
            {searchQuery || activeStatus !== 'ALL' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveStatus('ALL');
                  setTimeFilter('ALL');
                }}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
              >
                Đặt lại bộ lọc
              </button>
            ) : (
              <Link
                to="/search"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5"
              >
                <Bus size={18} />
                <span>Tìm & Đặt vé ngay</span>
              </Link>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedBookings.map((booking) => {
              const depTime = booking.trip?.departureTime ? new Date(booking.trip.departureTime) : null;
              const isCanCancel = booking.status === 'PAID' && depTime && depTime.getTime() > Date.now();

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 overflow-hidden flex flex-col justify-between group"
                >
                  {/* Card Top */}
                  <div className="p-6 space-y-4">
                    {/* Header: Code, Booking Date & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black tracking-wider text-gray-400 uppercase">
                            MÃ ĐƠN
                          </span>
                          <span className="text-sm font-extrabold text-blue-600">
                            #{booking.id}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center space-x-1">
                          <Clock size={11} className="text-gray-400" />
                          <span>
                            Ngày đặt: {booking.createdAt ? new Date(booking.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(booking.status, booking.trip?.departureTime)}
                    </div>

                    {/* Route Line */}
                    <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 group-hover:bg-blue-50/40 transition-colors">
                      <div className="flex items-center justify-between text-base font-extrabold text-gray-900">
                        <span>{booking.trip?.route?.departureLocation || 'Điểm đi'}</span>
                        <ArrowRight size={18} className="text-blue-600 mx-2 flex-shrink-0" />
                        <span>{booking.trip?.route?.arrivalLocation || 'Điểm đến'}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-2.5 pt-2 border-t border-gray-200/60">
                        <span className="flex items-center space-x-1">
                          <Bus size={13} className="text-gray-400" />
                          <span>{booking.trip?.vehicle?.type || 'Xe khách'}</span>
                        </span>
                        <span className="font-semibold text-gray-700">
                          {booking.trip?.vehicle?.licensePlate || ''}
                        </span>
                      </div>
                    </div>

                    {/* Departure & Seat Details */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <span className="text-gray-400 block mb-0.5">Khởi hành</span>
                        <div className="font-bold text-gray-900">
                          {depTime ? depTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </div>
                        <div className="text-gray-500 text-[11px]">
                          {depTime ? depTime.toLocaleDateString('vi-VN') : 'Chưa có'}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <span className="text-gray-400 block mb-0.5">Vị trí ghế</span>
                        <div className="font-bold text-blue-700">
                          {booking.tickets?.map(t => t.seatNumber).join(', ') || booking.seats?.join(', ') || 'Ghế đặt'}
                        </div>
                        <div className="text-gray-500 text-[11px]">
                          Tổng: {Number(booking.totalPrice).toLocaleString('vi-VN')}₫
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="px-6 py-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      {booking.status === 'PAID' && (
                        <Link
                          to={`/bookings/${booking.id}/e-ticket`}
                          className="p-2 rounded-xl bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 text-gray-700 transition-colors"
                          title="Xem vé điện tử"
                        >
                          <QrCode size={16} />
                        </Link>
                      )}
                      {booking.status === 'PENDING_PAYMENT' && (
                        <Link
                          to="/checkout"
                          state={{ booking }}
                          className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center space-x-1"
                        >
                          <span>Thanh toán ngay</span>
                        </Link>
                      )}
                      {isCanCancel && (
                        <button
                          onClick={() => setSelectedBookingForCancel(booking)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-2 rounded-xl transition-colors"
                        >
                          Hủy vé
                        </button>
                      )}
                    </div>

                    <Link
                      to={`/bookings/${booking.id}`}
                      className="flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-colors"
                    >
                      <span>Chi tiết vé</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Mã đơn</th>
                    <th className="py-4 px-6">Tuyến xe</th>
                    <th className="py-4 px-6">Thời gian khởi hành</th>
                    <th className="py-4 px-6">Ghế & Xe</th>
                    <th className="py-4 px-6">Tổng tiền</th>
                    <th className="py-4 px-6">Trạng thái</th>
                    <th className="py-4 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {paginatedBookings.map((booking) => {
                    const depTime = booking.trip?.departureTime ? new Date(booking.trip.departureTime) : null;
                    const isCanCancel = booking.status === 'PAID' && depTime && depTime.getTime() > Date.now();

                    return (
                      <tr key={booking.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="font-extrabold text-blue-600">
                            #{booking.id}
                          </span>
                          <div className="text-[11px] text-gray-500 font-normal flex items-center space-x-1 mt-0.5">
                            <Clock size={10} className="text-gray-400" />
                            <span>
                              {booking.createdAt ? new Date(booking.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-gray-900 flex items-center space-x-1.5">
                            <span>{booking.trip?.route?.departureLocation}</span>
                            <ArrowRight size={14} className="text-gray-400" />
                            <span>{booking.trip?.route?.arrivalLocation}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">
                            {depTime ? depTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {depTime ? depTime.toLocaleDateString('vi-VN') : ''}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="font-bold text-blue-700">
                            {booking.tickets?.map(t => t.seatNumber).join(', ') || booking.seats?.join(', ') || 'N/A'}
                          </span>
                          <div className="text-xs text-gray-400">
                            {booking.trip?.vehicle?.type} • {booking.trip?.vehicle?.licensePlate}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-extrabold text-gray-900 whitespace-nowrap">
                          {Number(booking.totalPrice).toLocaleString('vi-VN')}₫
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          {getStatusBadge(booking.status, booking.trip?.departureTime)}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            {booking.status === 'PAID' && (
                              <Link
                                to={`/bookings/${booking.id}/e-ticket`}
                                className="p-2 rounded-xl hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"
                                title="Vé điện tử"
                              >
                                <QrCode size={16} />
                              </Link>
                            )}
                            {isCanCancel && (
                              <button
                                onClick={() => setSelectedBookingForCancel(booking)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                Hủy
                              </button>
                            )}
                            <Link
                              to={`/bookings/${booking.id}`}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors inline-flex items-center space-x-1"
                            >
                              <span>Chi tiết</span>
                              <ChevronRight size={14} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredBookings.length > pageSize && (
          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm text-sm">
            <span className="text-xs text-gray-500">
              Hiển thị <strong>{(currentPage - 1) * pageSize + 1}</strong> -{' '}
              <strong>{Math.min(currentPage * pageSize, filteredBookings.length)}</strong> trên{' '}
              <strong>{filteredBookings.length}</strong> vé
            </span>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Ticket Modal */}
      {selectedBookingForCancel && (
        <CancelTicketModal
          isOpen={!!selectedBookingForCancel}
          onClose={() => setSelectedBookingForCancel(null)}
          booking={selectedBookingForCancel}
          onCancelSuccess={() => {
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};
