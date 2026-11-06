import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  Ticket, 
  Users, 
  TrendingUp, 
  RefreshCw, 
  Bus, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Calendar, 
  FileSpreadsheet,
  MapPin,
  Eye
} from 'lucide-react';
import { UserService } from '../api/user.service';
import { BookingService } from '../../booking/api/booking.service';
import type { BookingItem } from '../../booking/types/booking.types';
import toast from 'react-hot-toast';

export const ReportManagement: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);
  const [allBookings, setAllBookings] = useState<BookingItem[]>([]);
  const [filterPeriod, setFilterPeriod] = useState<'ALL' | 'TODAY' | 'MONTH'>('ALL');

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const [statsRes, bookingsRes] = await Promise.allSettled([
        UserService.getRevenueStatistics(),
        BookingService.getAllBookingsAdmin()
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setStatsData(statsRes.value.data);
      } else if (statsRes.status === 'fulfilled' && statsRes.value && !statsRes.value.success) {
        setStatsData(statsRes.value.data || statsRes.value);
      }

      if (bookingsRes.status === 'fulfilled' && bookingsRes.value?.success && Array.isArray(bookingsRes.value.data)) {
        setAllBookings(bookingsRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
      toast.error('Lỗi khi tải dữ liệu báo cáo thống kê');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatVND = (amount: number | string | undefined | null) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const totalRevenue = statsData?.totalRevenue ?? 
    allBookings.filter(b => b.status === 'PAID' || b.status === 'COMPLETED').reduce((acc, b) => acc + (b.totalPrice || 0), 0);

  const totalBookings = statsData?.totalBookings ?? allBookings.length;
  const paidBookings = statsData?.paidBookings ?? allBookings.filter(b => b.status === 'PAID' || b.status === 'COMPLETED').length;
  const pendingBookings = statsData?.pendingBookings ?? allBookings.filter(b => b.status === 'PENDING_PAYMENT' || (b.status as string) === 'PENDING').length;
  const cancelledBookings = statsData?.cancelledBookings ?? allBookings.filter(b => b.status === 'CANCELLED' || b.status === 'CANCEL_REQUESTED').length;
  const totalTickets = statsData?.totalTickets ?? allBookings.reduce((acc, b) => acc + (b.tickets?.length || (b.seats?.length || 1)), 0);
  const totalCustomers = statsData?.totalCustomers ?? 0;
  const totalTrips = statsData?.totalTrips ?? 0;

  const revenueByRoute: Record<string, number> = statsData?.revenueByRoute || {};
  const routeEntries = Object.entries(revenueByRoute).sort((a, b) => Number(b[1]) - Number(a[1]));
  const maxRouteRevenue = routeEntries.length > 0 ? Math.max(...routeEntries.map(e => Number(e[1]))) : 1;

  // Filter bookings for the transaction list
  const filteredBookings = allBookings.filter(b => {
    if (filterPeriod === 'ALL') return true;
    const createdAt = new Date(b.createdAt);
    const now = new Date();
    if (filterPeriod === 'TODAY') {
      return createdAt.toDateString() === now.toDateString();
    }
    if (filterPeriod === 'MONTH') {
      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <BarChart3 size={16} />
            <span>Trung Tâm Báo Cáo & Phân Tích</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Báo Cáo Doanh Thu & Hiệu Quả Hoạt Động
          </h1>
          <p className="text-xs text-gray-500">
            Tổng hợp dữ liệu doanh thu thực tế, lưu lượng đặt vé, và phân bổ hiệu suất tuyến đường.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterPeriod('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterPeriod === 'ALL' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterPeriod('MONTH')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterPeriod === 'MONTH' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Tháng này
            </button>
            <button
              onClick={() => setFilterPeriod('TODAY')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterPeriod === 'TODAY' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Hôm nay
            </button>
          </div>

          <button
            onClick={fetchReports}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors flex items-center space-x-2 text-xs font-bold"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin text-blue-600' : ''} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign size={24} />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp size={12} className="mr-1" />
              Thực thu
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng Doanh Thu</p>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
              {formatVND(totalRevenue)}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">Từ các đơn hàng thanh toán thành công</p>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Ticket size={24} />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {paidBookings} thành công
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng Đơn Đặt Vé</p>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
              {totalBookings.toLocaleString()} <span className="text-sm font-semibold text-gray-400">đơn</span>
            </h3>
            <div className="flex items-center space-x-2 text-[11px] text-gray-500 mt-1">
              <span className="text-emerald-600 font-semibold">{paidBookings} đã thanh toán</span>
              <span>•</span>
              <span className="text-rose-600 font-semibold">{cancelledBookings} đã hủy</span>
            </div>
          </div>
        </div>

        {/* Total Tickets Sold */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Bus size={24} />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {totalTrips} chuyến xe
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Số Ghế Đã Phát Hành</p>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
              {totalTickets.toLocaleString()} <span className="text-sm font-semibold text-gray-400">vé</span>
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">Tổng số vé lẻ đã được phát hành</p>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users size={24} />
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Hệ thống
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Khách Hàng Thành Viên</p>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
              {totalCustomers.toLocaleString()} <span className="text-sm font-semibold text-gray-400">người</span>
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">Tài khoản khách hàng đã kích hoạt</p>
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Revenue Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Doanh Thu Theo Tuyến Đường</h3>
                <p className="text-xs text-gray-500">Phân tích tuyến đường đóng góp doanh số cao nhất</p>
              </div>
            </div>
            <span className="text-xs font-bold text-gray-400">
              {routeEntries.length} tuyến có dữ liệu
            </span>
          </div>

          {routeEntries.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              Chưa có dữ liệu doanh thu cho từng tuyến đường
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {routeEntries.slice(0, 6).map(([route, amount], idx) => {
                const percent = Math.round((amount / (totalRevenue || 1)) * 100);
                const barWidth = Math.round((amount / maxRouteRevenue) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-800 truncate max-w-[280px]">
                        {idx + 1}. {route}
                      </span>
                      <div className="flex items-center space-x-3 shrink-0">
                        <span className="font-black text-gray-900">{formatVND(amount)}</span>
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {percent}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status Distribution Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-1 pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Tỷ Lệ Trạng Thái Đơn Vé</h3>
            <p className="text-xs text-gray-500">Phân loại theo tiến trình thanh toán</p>
          </div>

          <div className="space-y-3 py-2">
            {/* Paid */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">Đã thanh toán (PAID)</p>
                  <p className="text-[11px] text-emerald-700">Đơn vé hoàn tất hợp lệ</p>
                </div>
              </div>
              <span className="text-base font-black text-emerald-800">
                {paidBookings} <span className="text-xs font-medium">({Math.round((paidBookings / (totalBookings || 1)) * 100)}%)</span>
              </span>
            </div>

            {/* Pending */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
              <div className="flex items-center space-x-2.5">
                <Clock size={16} className="text-amber-600" />
                <div>
                  <p className="text-xs font-bold text-amber-900">Đang giữ chỗ / Chờ</p>
                  <p className="text-[11px] text-amber-700">Trong thời hạn 5 phút</p>
                </div>
              </div>
              <span className="text-base font-black text-amber-800">
                {pendingBookings} <span className="text-xs font-medium">({Math.round((pendingBookings / (totalBookings || 1)) * 100)}%)</span>
              </span>
            </div>

            {/* Cancelled */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/60 border border-rose-100">
              <div className="flex items-center space-x-2.5">
                <XCircle size={16} className="text-rose-600" />
                <div>
                  <p className="text-xs font-bold text-rose-900">Đã hủy / Hoàn tiền</p>
                  <p className="text-[11px] text-rose-700">Khách hủy hoặc hết hạn</p>
                </div>
              </div>
              <span className="text-base font-black text-rose-800">
                {cancelledBookings} <span className="text-xs font-medium">({Math.round((cancelledBookings / (totalBookings || 1)) * 100)}%)</span>
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex justify-between">
            <span>Tỷ lệ hoàn tất đơn hàng:</span>
            <span className="font-black text-emerald-600">
              {Math.round((paidBookings / (totalBookings || 1)) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Recent Bookings Transaction List */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Danh Sách Giao Dịch Đặt Vé</h3>
            <p className="text-xs text-gray-500">Chi tiết tất cả đơn vé theo thời gian thực</p>
          </div>
          <span className="text-xs font-bold text-gray-500">
            Hiển thị {filteredBookings.length} đơn đặt chỗ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Mã Đơn</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Chuyến Xe</th>
                <th className="py-3 px-4">Thời Gian Khởi Hành</th>
                <th className="py-3 px-4">Số Ghế</th>
                <th className="py-3 px-4 text-right">Tổng Tiền</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Ngày Tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    Không có giao dịch nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredBookings.slice(0, 15).map((booking) => {
                  const trip = booking.trip;
                  const routeName = trip?.route 
                    ? `${trip.route.departureLocation} → ${trip.route.arrivalLocation}` 
                    : 'N/A';
                  const seatCount = booking.tickets?.length || booking.seats?.length || 1;
                  
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        #{booking.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">{booking.customer?.fullName || 'Khách vãng lai'}</div>
                        <div className="text-[11px] text-gray-400">{booking.customer?.phoneNumber || booking.customer?.email || '-'}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {routeName}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {trip?.departureTime ? new Date(trip.departureTime).toLocaleString('vi-VN') : '-'}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-700">
                        {seatCount} ghế
                      </td>
                      <td className="py-3 px-4 font-black text-gray-900 text-right">
                        {formatVND(booking.totalPrice)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          booking.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          booking.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          booking.status === 'PENDING_PAYMENT' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          booking.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {booking.status === 'PAID' ? 'Đã thanh toán' :
                           booking.status === 'COMPLETED' ? 'Đã hoàn thành' :
                           booking.status === 'PENDING_PAYMENT' ? 'Đang giữ chỗ' :
                           booking.status === 'CANCELLED' ? 'Đã hủy' :
                           booking.status === 'EXPIRED' ? 'Hết hạn' :
                           booking.status === 'CANCEL_REQUESTED' ? 'Yêu cầu hủy' : booking.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-right font-mono text-[11px]">
                        {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
