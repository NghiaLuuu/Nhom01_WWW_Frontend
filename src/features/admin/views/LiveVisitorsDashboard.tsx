import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Users, 
  UserCheck, 
  UserX, 
  Globe, 
  Laptop, 
  Smartphone, 
  Clock, 
  Activity, 
  ExternalLink, 
  RefreshCw, 
  Search, 
  Sparkles, 
  Compass, 
  Eye, 
  MousePointerClick, 
  Bus, 
  Calendar, 
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  ChevronDown,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  trackingService, 
  type LiveVisitorsSummaryResponse, 
  type LiveVisitorDto,
  type LiveRecommendedTripDto
} from '../../../services/tracking.service';
import toast from 'react-hot-toast';

export const LiveVisitorsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<LiveVisitorsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [timeWindow, setTimeWindow] = useState(5); // default 5 minutes
  const [filterType, setFilterType] = useState<'ALL' | 'REGISTERED' | 'GUEST'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected visitor modal / drawer
  const [selectedVisitor, setSelectedVisitor] = useState<LiveVisitorDto | null>(null);

  const fetchLiveVisitors = async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) setRefreshing(true);
    try {
      const res = await trackingService.getLiveVisitors(timeWindow);
      setData(res);
    } catch (err: any) {
      console.error('Error fetching live visitors:', err);
      // Only toast on manual action to avoid spamming toast in auto-refresh
      if (showLoadingSpinner) {
        toast.error('Lỗi khi tải danh sách khách trực tuyến: ' + (err.message || 'Lỗi server'));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveVisitors(true);
  }, [timeWindow]);

  // Auto-refresh interval (every 5 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLiveVisitors(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, timeWindow]);

  // Filter visitors
  const visitors = data?.visitors || [];
  const filteredVisitors = visitors.filter(v => {
    // Type filter
    if (filterType === 'REGISTERED' && !v.isRegisteredCustomer) return false;
    if (filterType === 'GUEST' && v.isRegisteredCustomer) return false;
    
    // Search query filter (IP, name, email, anonymousId, current page)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchIp = v.ipAddress?.toLowerCase().includes(q);
      const matchName = v.customerName?.toLowerCase().includes(q);
      const matchEmail = v.customerEmail?.toLowerCase().includes(q);
      const matchAnon = v.anonymousId?.toLowerCase().includes(q);
      const matchPage = v.currentPageUrl?.toLowerCase().includes(q) || v.currentPageTitle?.toLowerCase().includes(q);
      return matchIp || matchName || matchEmail || matchAnon || matchPage;
    }
    return true;
  });

  const formatDwellTime = (activeSec: number, idleSec: number) => {
    const total = activeSec + idleSec;
    if (total < 60) return `${total}s (Chủ động ${activeSec}s)`;
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}m ${secs}s (Chủ động ${activeSec}s)`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                Realtime Visitor Monitor
              </span>
              <span className="text-xs text-slate-400">
                Cập nhật lúc: {data?.checkedAt ? new Date(data.checkedAt).toLocaleTimeString('vi-VN') : 'Đang tải...'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Khách Đang Trực Tuyến & Đề Xuất Thời Gian Thực
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Giám sát chính xác từng lượt truy cập, địa chỉ IP, trang hiện tại, thời gian tích cực và bộ máy đề xuất chuyến xe tự động.
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                autoRefresh 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Radio size={14} className={autoRefresh ? 'animate-pulse text-emerald-400' : ''} />
              {autoRefresh ? 'Tự động quét (5s)' : 'Tự quét: Đang tắt'}
            </button>

            {/* Time Window Select */}
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(Number(e.target.value))}
              aria-label="Cửa sổ thời gian quét"
              className="bg-slate-800/90 text-slate-200 text-xs font-medium px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value={3}>3 phút gần nhất</option>
              <option value={5}>5 phút gần nhất</option>
              <option value={15}>15 phút gần nhất</option>
              <option value={30}>30 phút gần nhất</option>
            </select>

            {/* Manual Refresh Button */}
            <button
              onClick={() => fetchLiveVisitors(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Làm mới
            </button>
          </div>
        </div>

        {/* Realtime KPI Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 flex items-center justify-between backdrop-blur-md">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Tổng khách Online</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">
                {data?.totalOnline ?? 0}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users size={24} />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 flex items-center justify-between backdrop-blur-md">
            <div>
              <p className="text-xs text-emerald-400 uppercase font-semibold">Khách có tài khoản</p>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">
                {data?.registeredOnline ?? 0}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserCheck size={24} />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 flex items-center justify-between backdrop-blur-md">
            <div>
              <p className="text-xs text-amber-400 uppercase font-semibold">Khách vãng lai (Guest)</p>
              <h3 className="text-3xl font-extrabold text-amber-400 mt-1">
                {data?.guestOnline ?? 0}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserX size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo IP, Tên, Email, Trang..."
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Segmented Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-stretch md:self-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'ALL' 
                ? 'bg-indigo-600 text-white shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất cả ({visitors.length})
          </button>
          <button
            onClick={() => setFilterType('REGISTERED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'REGISTERED' 
                ? 'bg-emerald-600 text-white shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Đã đăng nhập ({visitors.filter(v => v.isRegisteredCustomer).length})
          </button>
          <button
            onClick={() => setFilterType('GUEST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'GUEST' 
                ? 'bg-amber-600 text-white shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Vãng lai ({visitors.filter(v => !v.isRegisteredCustomer).length})
          </button>
        </div>
      </div>

      {/* Main Visitors Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold tracking-wider">
              <tr>
                <th className="px-5 py-4">IP & Thiết Bị (Bắt Buộc)</th>
                <th className="px-5 py-4">Định Danh Khách Hàng</th>
                <th className="px-5 py-4">Trang Đang Xem & Tương Tác</th>
                <th className="px-5 py-4">Hành Động Gần Nhất</th>
                <th className="px-5 py-4">Đang Đề Xuất Gì (AI Realtime)</th>
                <th className="px-5 py-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw size={24} className="animate-spin text-indigo-500" />
                      <span>Đang quét các kết nối trực tuyến realtime...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users size={32} className="text-slate-600" />
                      <p className="font-semibold text-slate-300">Không có khách nào trực tuyến trong {timeWindow} phút qua</p>
                      <p className="text-xs text-slate-500">Mở một tab ẩn danh hoặc truy cập trang chủ để tạo session kiểm tra.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((visitor) => (
                  <tr 
                    key={visitor.sessionId}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedVisitor(visitor)}
                  >
                    {/* 1. IP & Device */}
                    <td className="px-5 py-4 align-top">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded shadow-sm">
                            {visitor.ipAddress || '127.0.0.1'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          {visitor.deviceType === 'Mobile' ? (
                            <Smartphone size={13} className="text-rose-400" />
                          ) : (
                            <Laptop size={13} className="text-indigo-400" />
                          )}
                          <span>{visitor.deviceType || 'Desktop'}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-[11px] text-slate-400 truncate max-w-[140px]" title={visitor.trafficSource}>
                            {visitor.trafficSource || 'Direct'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Customer Identity */}
                    <td className="px-5 py-4 align-top">
                      {visitor.isRegisteredCustomer ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                              <UserCheck size={11} /> Thành viên
                            </span>
                            <span className="font-semibold text-white text-xs truncate max-w-[150px]">
                              {visitor.customerName || 'Khách hàng'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate max-w-[180px]">
                            {visitor.customerEmail}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                            <UserX size={11} /> Khách vãng lai
                          </span>
                          <p className="font-mono text-[11px] text-slate-400 truncate max-w-[160px]" title={visitor.anonymousId}>
                            {visitor.anonymousId}
                          </p>
                        </div>
                      )}
                    </td>

                    {/* 3. Current Page & Dwell */}
                    <td className="px-5 py-4 align-top">
                      <div className="space-y-1 max-w-[240px]">
                        <p className="text-xs font-semibold text-white line-clamp-1" title={visitor.currentPageTitle}>
                          {visitor.currentPageTitle || 'Trang đặt vé'}
                        </p>
                        <p className="text-[11px] font-mono text-indigo-300 truncate" title={visitor.currentPageUrl}>
                          {visitor.currentPageUrl || '/'}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <Clock size={12} className="text-amber-400" />
                          <span>{formatDwellTime(visitor.activeSecondsOnPage, visitor.idleSecondsOnPage)}</span>
                        </div>
                      </div>
                    </td>

                    {/* 4. Last Action */}
                    <td className="px-5 py-4 align-top">
                      <div className="space-y-1 max-w-[200px]">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-300 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded">
                          <MousePointerClick size={11} />
                          {visitor.lastActionType || 'PAGE_VIEW'}
                        </span>
                        {visitor.lastActionPayload && (
                          <p className="text-[11px] text-slate-400 truncate font-mono bg-slate-950/60 px-1.5 py-0.5 rounded" title={visitor.lastActionPayload}>
                            {visitor.lastActionPayload}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-500">
                          {visitor.lastActivityTime ? new Date(visitor.lastActivityTime).toLocaleTimeString('vi-VN') : 'Vừa xong'}
                        </p>
                      </div>
                    </td>

                    {/* 5. Live AI Recommendation */}
                    <td className="px-5 py-4 align-top">
                      <div className="space-y-1.5 max-w-[250px]">
                        <div className="flex items-center gap-1.5">
                          <Sparkles size={12} className="text-cyan-400" />
                          <span className="text-xs font-bold text-cyan-300">
                            {visitor.matchedPersona || 'Khách tìm chuyến nhanh'}
                          </span>
                        </div>
                        {visitor.recommendedTrips && visitor.recommendedTrips.length > 0 ? (
                          <div className="space-y-1">
                            {visitor.recommendedTrips.slice(0, 2).map((trip, idx) => (
                              <div key={idx} className="bg-slate-950/80 border border-indigo-500/20 rounded p-1.5 text-[11px] text-slate-300">
                                <div className="flex items-center justify-between font-semibold text-white">
                                  <span className="truncate max-w-[130px]">{trip.route}</span>
                                  <span className="text-emerald-400">{trip.price}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
                                  <span>{trip.departureTime}</span>
                                  <span className="text-indigo-300">{trip.vehicleType}</span>
                                </div>
                              </div>
                            ))}
                            {visitor.recommendedTrips.length > 2 && (
                              <p className="text-[10px] text-indigo-400 italic">
                                + {visitor.recommendedTrips.length - 2} chuyến khác...
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">
                            Chưa đủ hành vi để gợi ý
                          </p>
                        )}
                      </div>
                    </td>

                    {/* 6. Quick Action */}
                    <td className="px-5 py-4 align-middle text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          const id = visitor.isRegisteredCustomer 
                            ? (visitor.customerEmail || visitor.anonymousId) 
                            : visitor.anonymousId;
                          navigate(`/admin/behavior-analytics?id=${encodeURIComponent(id)}`);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-500 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold transition-all group-hover:scale-105"
                        title="Xem toàn bộ lịch sử hành trình của khách này"
                      >
                        <span>Hành trình</span>
                        <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visitor Detail Modal / Popover */}
      {selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative p-6 custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Chi Tiết Kết Nối Trực Tuyến</h3>
                  <p className="text-xs text-slate-400 font-mono">Session ID: {selectedVisitor.sessionId}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedVisitor(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Visitor Detail Info */}
            <div className="space-y-5">
              {/* Identity & Network Grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Địa chỉ IP (Bắt buộc)</span>
                  <p className="font-mono text-sm font-bold text-cyan-300 mt-0.5">{selectedVisitor.ipAddress}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Loại khách</span>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {selectedVisitor.isRegisteredCustomer ? (
                      <span className="text-emerald-400">Thành viên ({selectedVisitor.customerEmail})</span>
                    ) : (
                      <span className="text-amber-400">Khách vãng lai</span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Anonymous ID</span>
                  <p className="font-mono text-xs text-slate-300 mt-0.5 truncate">{selectedVisitor.anonymousId}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Thiết bị & Nguồn</span>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {selectedVisitor.deviceType} • {selectedVisitor.trafficSource || 'Direct'}
                  </p>
                </div>
              </div>

              {/* Current Page & Activity */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="text-[11px] text-indigo-400 uppercase font-bold tracking-wider">
                  Trang Đang Duyệt & Thời Gian Dừng
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">{selectedVisitor.currentPageTitle || 'Không rõ tiêu đề'}</p>
                  <p className="text-xs font-mono text-indigo-300 break-all">{selectedVisitor.currentPageUrl || '/'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-500">Thời gian chủ động:</span>{' '}
                    <span className="font-semibold text-emerald-400">{selectedVisitor.activeSecondsOnPage}s</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Thời gian dừng (Idle):</span>{' '}
                    <span className="font-semibold text-amber-400">{selectedVisitor.idleSecondsOnPage}s</span>
                  </div>
                </div>
              </div>

              {/* AI Realtime Recommendations */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-cyan-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <Sparkles size={13} />
                    Đề Xuất Thời Gian Thực (AI Engine)
                  </span>
                  <span className="text-xs bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-semibold">
                    {selectedVisitor.matchedPersona}
                  </span>
                </div>

                {selectedVisitor.recommendedTrips && selectedVisitor.recommendedTrips.length > 0 ? (
                  <div className="space-y-2">
                    {selectedVisitor.recommendedTrips.map((trip, idx) => (
                      <div key={idx} className="bg-slate-900 border border-indigo-500/30 p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-2">
                            <Bus size={14} className="text-indigo-400" />
                            {trip.route}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Khởi hành: {trip.departureTime} • Loại xe: {trip.vehicleType}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded">
                          {trip.price}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Chưa có chuyến xe nào được tạo đề xuất cho phiên này.</p>
                )}
              </div>

              {/* User Agent Raw */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">User Agent</span>
                <p className="font-mono text-[10px] text-slate-400 break-all mt-1">{selectedVisitor.userAgent}</p>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedVisitor(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    const id = selectedVisitor.isRegisteredCustomer 
                      ? (selectedVisitor.customerEmail || selectedVisitor.anonymousId) 
                      : selectedVisitor.anonymousId;
                    navigate(`/admin/behavior-analytics?id=${encodeURIComponent(id)}`);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <span>Khám phá toàn bộ hành trình</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
