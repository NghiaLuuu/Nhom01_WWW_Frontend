import React, { useState, useEffect, useRef } from 'react';
import { isAxiosError, isCancel } from 'axios';
import { 
  BarChart3, 
  DollarSign, 
  Ticket, 
  Users, 
  TrendingUp, 
  RefreshCw, 
  Bus, 
  Search, ChevronLeft, ChevronRight, AlertCircle,
  MapPin
} from 'lucide-react';
import { RevenueReportService, type RevenueReport, type RevenueReportFilter, type RevenueTransactionPage, type RevenueTransactionFilter } from '../api/revenue-report.service';
import { RevenueTrendChart } from '../components/RevenueTrendChart';

type ReportPeriod = 'ALL' | 'TODAY' | 'MONTH' | 'YEAR' | 'CUSTOM';

function todayInVietnam() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const value = (type: string) => parts.find(part => part.type === type)?.value || '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

function periodFilter(period: ReportPeriod, scope: RevenueReportFilter['scope']): RevenueReportFilter {
  const today = todayInVietnam();
  const year = today.slice(0, 4);
  if (period === 'TODAY') return { fromDate: today, toDate: today, scope, groupBy: 'DAY' };
  if (period === 'YEAR') return { fromDate: `${year}-01-01`, toDate: `${year}-12-31`, scope, groupBy: 'MONTH' };
  if (period === 'ALL') return { scope, groupBy: 'MONTH' };
  const [y, month] = today.split('-').map(Number);
  const lastDay = new Date(Date.UTC(y, month, 0)).getUTCDate();
  return { fromDate: `${today.slice(0, 7)}-01`, toDate: `${today.slice(0, 7)}-${lastDay}`, scope, groupBy: 'DAY' };
}

function reportError(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) return error.response?.status === 403
    ? 'Bạn chưa được cấp quyền VIEW_STATISTICS để xem báo cáo.'
    : error.response?.data?.message || 'Không thể kết nối máy chủ báo cáo. Vui lòng thử lại.';
  return error instanceof Error ? error.message : 'Không thể tải báo cáo.';
}

const BOOKING_STATUS_LABELS: Record<string, string> = { PAID: 'Đã thanh toán', COMPLETED: 'Đã hoàn thành', PENDING_PAYMENT: 'Chờ thanh toán', CANCELLED: 'Đã hủy', PARTIALLY_CANCELLED: 'Hủy một phần', CANCEL_REQUESTED: 'Chờ duyệt hủy', EXPIRED: 'Hết hạn' };
const PAYMENT_STATUS_LABELS: Record<string, string> = { SUCCESS: 'Thành công', SIMULATED_PAID: 'Thành công mô phỏng', PENDING: 'Chờ thanh toán', FAILED: 'Thất bại', CANCELLED: 'Giao dịch đã hủy', REFUNDED: 'Đã đánh dấu hoàn tiền' };

export const ReportManagement: React.FC = () => {
  const [filterPeriod, setFilterPeriod] = useState<ReportPeriod>('MONTH');
  const [filters, setFilters] = useState<RevenueReportFilter>(() => periodFilter('MONTH', 'REAL'));
  const [draftFrom, setDraftFrom] = useState(() => periodFilter('MONTH', 'REAL').fromDate || '');
  const [draftTo, setDraftTo] = useState(todayInVietnam);
  const [dateError, setDateError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<RevenueReport | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<RevenueTransactionPage | null>(null);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');
  const transactionSectionRef = useRef<HTMLDivElement>(null);
  const [sort, setSort] = useState<RevenueTransactionFilter['sort']>('NEWEST');

  useEffect(() => {
    const timer = setTimeout(() => { setQuery(search.trim()); setPage(0); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true); setStatsData(null); setSummaryError(null);
    RevenueReportService.summary(filters, controller.signal)
      .then(data => { if (!controller.signal.aborted) setStatsData(data); })
      .catch(error => { if (!controller.signal.aborted && !isCancel(error)) setSummaryError(reportError(error)); })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, [filters, refreshKey]);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingTransactions(true); setTransactions(null); setTransactionError(null);
    RevenueReportService.transactions({ ...filters, page, size: 15, search: query || undefined, status: paymentStatus || undefined, bookingStatus: bookingStatus || undefined, sort }, controller.signal)
      .then(data => { if (!controller.signal.aborted) setTransactions(data); })
      .catch(error => { if (!controller.signal.aborted && !isCancel(error)) setTransactionError(reportError(error)); })
      .finally(() => { if (!controller.signal.aborted) setLoadingTransactions(false); });
    return () => controller.abort();
  }, [filters, page, query, paymentStatus, bookingStatus, sort, refreshKey]);

  const filterByBookingStatus = (status: string) => {
    setBookingStatus(status);
    setPaymentStatus('');
    setSearch('');
    setQuery('');
    setPage(0);
    transactionSectionRef.current?.focus({ preventScroll: true });
    transactionSectionRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const choosePeriod = (period: ReportPeriod) => {
    setFilterPeriod(period); setDateError(null);
    if (period !== 'CUSTOM') { setFilters(periodFilter(period, filters.scope)); setPage(0); }
  };
  const applyDates = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draftFrom || !draftTo || draftFrom > draftTo) { setDateError('Vui lòng chọn khoảng ngày hợp lệ; ngày bắt đầu không được sau ngày kết thúc.'); return; }
    setDateError(null); setFilters({ ...filters, fromDate: draftFrom, toDate: draftTo }); setPage(0);
  };

  const formatVND = (amount: number | string | undefined | null) => {
    if (amount == null) return '—';
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const totalRevenue = statsData?.totals.successfulAmount;
  const totalBookings = statsData?.totals.bookingCount;
  const paidBookings = statsData?.totals.successfulBookingCount;
  const cancelledBookings = statsData?.bookingStatuses.find(item => item.status === 'CANCELLED')?.count || 0;
  const totalTickets = statsData?.totals.ticketCount;
  const totalCustomers = statsData?.totals.customerCount;
  const totalTrips = statsData?.totals.tripCount;
  const routeEntries = statsData?.routes || [];
  const maxRouteRevenue = Math.max(...routeEntries.map(item => Number(item.amount)), 1);
  const number = (value?: number) => value == null ? '—' : value.toLocaleString('vi-VN');
  const formatDate = (value: string | null) => value ? new Date(/(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? value : `${value}+07:00`).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : 'Chưa có thông tin';

  return (
    <div className="space-y-6 text-slate-100 [color-scheme:dark]" aria-busy={isLoading || loadingTransactions}>
      {/* Header Banner */}
      <div className="bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <BarChart3 size={16} />
            <span>Trung Tâm Báo Cáo & Phân Tích</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Báo Cáo Doanh Thu & Hiệu Quả Hoạt Động
          </h1>
          <p className="text-xs text-slate-400">
            Khai thác payment và booking theo cùng khoảng ngày tạo giao dịch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-xl text-xs font-bold">
            {([['ALL', 'Tất cả'], ['MONTH', 'Tháng này'], ['TODAY', 'Hôm nay'], ['YEAR', 'Năm nay'], ['CUSTOM', 'Tùy chọn']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => choosePeriod(value)} aria-pressed={filterPeriod === value} className={`px-3 py-1.5 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${filterPeriod === value ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}>{label}</button>)}
          </div>

          <button
            onClick={() => setRefreshKey(value => value + 1)}
            disabled={isLoading || loadingTransactions}
            className="p-2.5 rounded-xl border border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-100 transition-colors flex items-center space-x-2 text-xs font-bold disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin text-blue-600' : ''} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-3xl border border-slate-700 p-5 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-full min-w-0 sm:w-auto"><label htmlFor="revenue-scope" className="block mb-1.5 text-xs font-semibold text-slate-300">Phạm vi dữ liệu</label><select id="revenue-scope" value={filters.scope} onChange={event => { setFilters({ ...filters, scope: event.target.value as RevenueReportFilter['scope'] }); setPage(0); }} className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30">
            <option value="REAL">Thanh toán không gắn nhãn demo</option><option value="DEMO">Chỉ thanh toán mô phỏng</option>
          </select></div>
          <div className="w-full min-w-0 sm:w-auto"><label htmlFor="revenue-group" className="block mb-1.5 text-xs font-semibold text-slate-300">Nhóm biểu đồ</label><select id="revenue-group" value={filters.groupBy} onChange={event => setFilters({ ...filters, groupBy: event.target.value as RevenueReportFilter['groupBy'] })} className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"><option value="DAY">Theo ngày (tối đa 366 ngày)</option><option value="MONTH">Theo tháng</option></select></div>
          <p className="text-xs text-slate-400">Đang áp dụng: {filters.fromDate || 'Từ đầu dữ liệu'} → {filters.toDate || 'Tất cả ngày'} (giờ Việt Nam).</p>
        </div>
        {filterPeriod === 'CUSTOM' && <form onSubmit={applyDates} className="flex flex-wrap items-end gap-3">
          <div><label htmlFor="revenue-from" className="block mb-1 text-xs font-semibold text-slate-300">Từ ngày</label><input id="revenue-from" type="date" required value={draftFrom} onChange={event => setDraftFrom(event.target.value)} className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30" /></div>
          <div><label htmlFor="revenue-to" className="block mb-1 text-xs font-semibold text-slate-300">Đến ngày (bao gồm ngày này)</label><input id="revenue-to" type="date" required value={draftTo} onChange={event => setDraftTo(event.target.value)} className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30" /></div>
          <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">Áp dụng khoảng ngày</button>
          {dateError && <p role="alert" className="w-full text-xs text-rose-300">{dateError}</p>}
        </form>}
        <p className="text-xs leading-relaxed text-slate-300">Báo cáo cộng số tiền của payment đang thành công, theo ngày tạo payment — không phải ngày tạo booking hay ngày khởi hành. Dữ liệu thực/demo được phân loại theo phương thức, trạng thái và mã giao dịch hiện có. Booking bị hủy không tự làm giảm tiền đã thanh toán. Trạng thái REFUNDED không cung cấp số tiền/thời điểm hoàn thực tế, nên báo cáo này không tính tiền thu ròng hoặc cộng phí hủy lần nữa.</p>
        {filters.scope === 'DEMO' && <p role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm font-semibold text-amber-300">Đang xem dữ liệu mô phỏng, không phải doanh thu tiền thật.</p>}
      </div>
      {summaryError && <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-sm text-rose-300"><AlertCircle size={18} className="shrink-0" /><div><p className="font-semibold">Không tải được tổng hợp báo cáo</p><p className="mt-1">{summaryError}</p><button type="button" onClick={() => setRefreshKey(value => value + 1)} className="mt-3 underline font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-300">Thử lại</button></div></div>}
      {isLoading && <p role="status" className="text-sm text-slate-300">Đang tổng hợp dữ liệu theo bộ lọc...</p>}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign size={24} />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <TrendingUp size={12} className="mr-1" />
              Tổng hợp
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{filters.scope === 'DEMO' ? 'Tiền thành công mô phỏng' : 'Tiền giao dịch đang thành công'}</p>
            <h3 data-testid="report-successful-amount" className="text-2xl font-black text-emerald-300 tracking-tight mt-1">
              {formatVND(totalRevenue)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">{number(statsData?.totals.successfulPayments)} payment thành công theo trạng thái hiện tại</p>
            <p className="text-[11px] text-slate-400">{number(statsData?.totals.refundedPayments)} payment đã đánh dấu hoàn tiền, không gộp vào số tiền trên</p>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl border border-blue-500/25 bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              <Ticket size={24} />
            </div>
            <span className="text-xs font-bold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full">
              {number(paidBookings)} đơn có payment thành công
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Đơn có giao dịch trong kỳ</p>
            <h3 className="text-2xl font-black text-white tracking-tight mt-1">
              {number(totalBookings)} <span className="text-sm font-semibold text-slate-400">đơn</span>
            </h3>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1">
              <span className="text-emerald-400 font-semibold">{number(paidBookings)} có thanh toán thành công</span>
              <span>•</span>
              <span className="text-rose-400 font-semibold">{statsData ? cancelledBookings : '—'} đã hủy</span>
            </div>
          </div>
        </div>

        {/* Total Tickets Sold */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl border border-amber-500/25 bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Bus size={24} />
            </div>
            <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full">
              {number(totalTrips)} chuyến có giao dịch
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Vé thuộc đơn có payment thành công</p>
            <h3 className="text-2xl font-black text-white tracking-tight mt-1">
              {number(totalTickets)} <span className="text-sm font-semibold text-slate-400">vé</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Đếm mỗi vé một lần, gồm cả vé đã hủy trong các đơn này</p>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl border border-indigo-500/25 bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
              <Users size={24} />
            </div>
            <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              Theo bộ lọc
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Khách có giao dịch trong kỳ</p>
            <h3 className="text-2xl font-black text-white tracking-tight mt-1">
              {number(totalCustomers)} <span className="text-sm font-semibold text-slate-400">người</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Số khách khác nhau trong các payment đã lọc</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-700 bg-slate-800 p-6 lg:col-span-2">
          <h2 className="font-bold text-white">Diễn biến tiền thanh toán thành công</h2>
          <p className="mt-1 text-xs text-slate-400">Theo {filters.groupBy === 'DAY' ? 'ngày' : 'tháng'} tạo giao dịch, không bao gồm payment thất bại hoặc đang chờ.</p>
          {!statsData ? <p className="py-16 text-center text-sm text-slate-400">{isLoading ? 'Đang tải biểu đồ...' : 'Chưa có dữ liệu báo cáo hợp lệ.'}</p> : <RevenueTrendChart points={statsData.trend} groupBy={statsData.groupBy} formatMoney={formatVND} />}
        </div>
        <div className="rounded-3xl border border-slate-700 bg-slate-800 p-6 space-y-4">
          <h2 className="font-bold text-white">Theo phương thức thanh toán</h2>
          {statsData?.methods.length ? statsData.methods.map(method => <div key={method.paymentMethod} className="flex items-center justify-between gap-3 border-b border-slate-700 pb-3 text-xs"><div><p className="font-semibold text-slate-100">{method.paymentMethod}</p><p className="mt-1 text-slate-400">{method.paymentCount} giao dịch thành công</p></div><span className="font-bold text-emerald-300">{formatVND(method.amount)}</span></div>) : <p className="py-10 text-center text-sm text-slate-400">{isLoading ? 'Đang tải...' : 'Chưa có giao dịch thành công.'}</p>}
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Revenue Breakdown */}
        <div className="lg:col-span-2 bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Doanh Thu Theo Tuyến Đường</h3>
                <p className="text-xs text-slate-400">Phân tích tuyến đường đóng góp doanh số cao nhất</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {routeEntries.length} tuyến có dữ liệu
            </span>
          </div>

          {routeEntries.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Chưa có dữ liệu doanh thu cho từng tuyến đường
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {routeEntries.slice(0, 6).map((item, idx) => {
                const amount = Number(item.amount);
                const route = `${item.departureLocation || 'Chưa có điểm đi'} → ${item.arrivalLocation || 'Chưa có điểm đến'}`;
                const percent = Math.round((amount / (totalRevenue || 1)) * 100);
                const barWidth = Math.round((amount / maxRouteRevenue) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-100 truncate max-w-[280px]">
                        {idx + 1}. {route}
                      </span>
                      <div className="flex items-center space-x-3 shrink-0">
                        <span className="font-black text-white">{formatVND(amount)}</span>
                        <span className="text-[11px] font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                            {percent}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Existing status panel now uses the same payment cohort as the other metrics. */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-sm space-y-4">
          <div className="space-y-1 pb-3 border-b border-slate-700">
            <h3 className="text-sm font-bold text-white">Trạng thái hiện tại của đơn vé</h3>
            <p className="text-xs text-slate-400">Chỉ các đơn có payment thuộc bộ lọc, không phải mọi booking trong hệ thống.</p>
          </div>
          <div className="space-y-3 py-2">
            {statsData?.bookingStatuses.length ? statsData.bookingStatuses.map(item => <button key={item.status} type="button" aria-label={`Lọc giao dịch theo đơn: ${BOOKING_STATUS_LABELS[item.status] || item.status}`} aria-pressed={bookingStatus === item.status} onClick={() => filterByBookingStatus(item.status)} className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${bookingStatus === item.status ? 'border-cyan-400/60 bg-cyan-500/10' : 'border-slate-700 bg-slate-900/60 hover:border-cyan-400/40 hover:bg-slate-700/60'}`}>
              <span className="font-semibold text-slate-300">{BOOKING_STATUS_LABELS[item.status] || item.status}</span>
              <span className="font-bold text-white">{item.count} ({Math.round(item.count / (totalBookings || 1) * 100)}%)</span>
            </button>) : <p className="py-10 text-center text-sm text-slate-400">{isLoading ? 'Đang tải...' : 'Chưa có đơn thuộc bộ lọc.'}</p>}
          </div>
          <p className="border-t border-slate-700 pt-3 text-xs text-slate-400">Bấm vào một trạng thái để xem giao dịch của các đơn tương ứng. Đơn đã hủy vẫn có thể có payment thành công nếu chưa hoàn tiền.</p>
        </div>
      </div>

      {/* Paginated payments, rather than a truncated list of bookings. */}
      <div ref={transactionSectionRef} tabIndex={-1} role="region" aria-label="Kết quả lọc giao dịch" className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-sm space-y-4 scroll-mt-20 focus:outline-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
          <div>
            <h3 className="text-sm font-bold text-white">Danh sách giao dịch thanh toán</h3>
            <p className="text-xs text-slate-400">Một dòng mỗi payment. Các bộ lọc bảng được kết hợp với nhau; trạng thái đơn vé khác trạng thái payment.</p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {transactions ? `${transactions.totalElements.toLocaleString('vi-VN')} giao dịch` : '—'}
          </span>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
          <div className="min-w-0 flex-1"><label htmlFor="revenue-search" className="block mb-1.5 text-xs font-semibold text-slate-300">Tìm mã giao dịch, mã đơn hoặc khách</label><div className="relative"><Search size={15} aria-hidden="true" className="absolute left-3 top-3 text-slate-400" /><input id="revenue-search" type="search" maxLength={100} value={search} onChange={event => setSearch(event.target.value)} placeholder="Nhập từ khóa..." className="w-full rounded-xl border border-slate-600 bg-slate-900 py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30" /></div></div>
          <div><label htmlFor="revenue-booking-status" className="block mb-1.5 text-xs font-semibold text-slate-300">Trạng thái đơn vé</label><select id="revenue-booking-status" value={bookingStatus} onChange={event => { setBookingStatus(event.target.value); setPage(0); }} className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"><option value="">Tất cả trạng thái đơn</option>{Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
          <div><label htmlFor="revenue-payment-status" className="block mb-1.5 text-xs font-semibold text-slate-300">Trạng thái payment</label><select id="revenue-payment-status" value={paymentStatus} onChange={event => { setPaymentStatus(event.target.value); setPage(0); }} className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"><option value="">Tất cả trạng thái</option>{Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
          <div><label htmlFor="revenue-sort" className="block mb-1.5 text-xs font-semibold text-slate-300">Sắp xếp</label><select id="revenue-sort" value={sort} onChange={event => { setSort(event.target.value as RevenueTransactionFilter['sort']); setPage(0); }} className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"><option value="NEWEST">Mới nhất</option><option value="OLDEST">Cũ nhất</option><option value="AMOUNT_DESC">Số tiền giảm dần</option><option value="AMOUNT_ASC">Số tiền tăng dần</option></select></div>
        </div>
        {paymentStatus === 'CANCELLED' && !bookingStatus && <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-200">Bạn đang lọc giao dịch thanh toán bị hủy, không phải đơn vé bị hủy. <button type="button" onClick={() => filterByBookingStatus('CANCELLED')} className="font-semibold text-cyan-300 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">Xem đơn vé đã hủy</button></p>}
        {(bookingStatus || paymentStatus || query) && <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>{bookingStatus ? `Lọc đơn vé: ${BOOKING_STATUS_LABELS[bookingStatus] || bookingStatus}. ` : ''}{paymentStatus ? `Lọc payment: ${PAYMENT_STATUS_LABELS[paymentStatus] || paymentStatus}.` : ''}</span>
          <button type="button" onClick={() => { setBookingStatus(''); setPaymentStatus(''); setSearch(''); setQuery(''); setPage(0); }} className="font-semibold text-cyan-300 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">Xóa bộ lọc bảng</button>
        </div>}
        {transactionError && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">{transactionError}</p>}

        <div className="overflow-x-auto">
          <table aria-label="Giao dịch thanh toán" className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/60 text-slate-300 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Giao dịch / Đơn</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Chuyến Xe</th>
                <th className="py-3 px-4">Số vé trong đơn</th>
                <th className="py-3 px-4">Phương thức</th>
                <th className="py-3 px-4 text-right">Số tiền payment</th>
                <th className="py-3 px-4 text-center">Payment / Booking</th>
                <th className="py-3 px-4 text-right">Ngày tạo payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loadingTransactions ? <tr><td colSpan={8} role="status" className="py-10 text-center text-slate-400">Đang tải giao dịch...</td></tr> : transactionError ? <tr><td colSpan={8} className="py-8 text-center text-slate-400">Chưa có danh sách giao dịch hợp lệ để hiển thị.</td></tr> : !transactions?.content.length ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Không có giao dịch nào phù hợp
                  </td>
                </tr>
              ) : (
                transactions.content.map(payment => <tr key={payment.paymentId} className="hover:bg-slate-700/40 transition-colors">
                  <td className="py-3 px-4"><div className="max-w-48 break-words font-semibold text-slate-100">{payment.transactionId || `Payment #${payment.paymentId}`}</div><span className="mt-1 inline-block font-semibold text-cyan-300">Đơn #{payment.bookingId}</span></td>
                  <td className="py-3 px-4 font-medium text-slate-100">{payment.customerName || 'Chưa có tên khách'}</td>
                  <td className="py-3 px-4"><div className="font-medium text-slate-200">{payment.departureLocation || 'Chưa có điểm đi'} → {payment.arrivalLocation || 'Chưa có điểm đến'}</div><div className="mt-1 text-slate-400">Khởi hành: {formatDate(payment.departureTime)}</div></td>
                  <td className="py-3 px-4 text-slate-300">{payment.ticketCount} vé</td>
                  <td className="py-3 px-4 text-slate-300">{payment.paymentMethod}</td>
                  <td className="py-3 px-4 text-right font-bold text-white whitespace-nowrap">{formatVND(payment.amount)}</td>
                  <td className="py-3 px-4 text-center"><span className={`inline-flex rounded-full border px-2.5 py-1 font-semibold ${['SUCCESS', 'SIMULATED_PAID'].includes(payment.paymentStatus) ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : payment.paymentStatus === 'PENDING' ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-slate-600 bg-slate-900/60 text-slate-300'}`}>{PAYMENT_STATUS_LABELS[payment.paymentStatus] || payment.paymentStatus}</span><div className="mt-1 text-slate-400">Đơn: {BOOKING_STATUS_LABELS[payment.bookingStatus] || payment.bookingStatus}</div></td>
                  <td className="py-3 px-4 text-right text-slate-400 whitespace-nowrap">{formatDate(payment.createdAt)}</td>
                </tr>)
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-700 pt-4 text-xs text-slate-400">
          <span>Trang {transactions ? transactions.page + 1 : page + 1} / {Math.max(1, transactions?.totalPages || 0)} · 15 giao dịch mỗi trang</span>
          <div className="flex gap-2">
            <button type="button" aria-label="Trang giao dịch trước" disabled={loadingTransactions || page === 0} onClick={() => setPage(value => value - 1)} className="flex items-center gap-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-200 hover:bg-slate-700 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"><ChevronLeft size={14} />Trước</button>
            <button type="button" aria-label="Trang giao dịch sau" disabled={loadingTransactions || !transactions || page + 1 >= transactions.totalPages} onClick={() => setPage(value => value + 1)} className="flex items-center gap-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-200 hover:bg-slate-700 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">Sau<ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};
