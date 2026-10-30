import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Users, 
  UserCheck, 
  UserX, 
  Laptop, 
  Smartphone, 
  Clock, 
  RefreshCw, 
  Search, 
  Sparkles, 
  ArrowRight,
  X,
  ExternalLink,
  Shield,
  Eye,
  Navigation,
  Compass,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  trackingService, 
  type LiveVisitorsSummaryResponse, 
  type LiveVisitorDto 
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

  const fetchLiveVisitors = async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) setRefreshing(true);
    try {
      const res = await trackingService.getLiveVisitors(timeWindow);
      setData(res);
    } catch (err: any) {
      console.error('Error fetching live visitors:', err);
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

  // Filter visitors & sort newest activity on top
  const visitors = (data?.visitors || []).slice().sort((a, b) => {
    const timeA = a.lastActivityTime || '';
    const timeB = b.lastActivityTime || '';
    return timeB.localeCompare(timeA);
  });

  const filteredVisitors = visitors.filter(v => {
    if (filterType === 'REGISTERED' && !v.isRegisteredCustomer) return false;
    if (filterType === 'GUEST' && v.isRegisteredCustomer) return false;
    
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

  const formatRelativeActivity = (timeStr?: string) => {
    if (!timeStr) return 'Đang xem';
    try {
      const actTime = new Date(timeStr.replace(' ', 'T')).getTime();
      const diffSec = Math.floor((Date.now() - actTime) / 1000);
      if (diffSec < 15) {
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full shadow-sm animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Vừa thao tác
          </span>
        );
      }
      if (diffSec < 60) return `${diffSec}s trước`;
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
      return new Date(timeStr).toLocaleTimeString('vi-VN');
    } catch {
      return timeStr;
    }
  };

  const formatDwellTime = (activeSec: number, idleSec: number) => {
    const total = activeSec + idleSec;
    if (total < 60) return `${total}s (Chủ động ${activeSec}s)`;
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}m ${secs}s (Chủ động ${activeSec}s)`;
  };

  const getPersonaBadge = (persona: string | undefined) => {
    switch (persona) {
      case 'COMMUTER_HABIT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-500/50 px-2.5 py-0.5 rounded-full shadow-sm">
            <Navigation size={11} className="text-indigo-400" /> Thường Lệ (TP.HCM ⇌ Phú Yên)
          </span>
        );
      case 'DALAT_LIMOUSINE':
      case 'LUXURY_VIP':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2.5 py-0.5 rounded-full shadow-sm">
            <Sparkles size={11} className="text-amber-400" /> VIP Limousine
          </span>
        );
      case 'BUDGET_SAVER':
      case 'BUDGET_SAVING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-0.5 rounded-full shadow-sm">
            <Sparkles size={11} className="text-emerald-400" /> Tiết Kiệm
          </span>
        );
      case 'NHATRANG_FAMILY':
      case 'WEEKEND_EXPLORER':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-300 bg-orange-950/80 border border-orange-500/40 px-2.5 py-0.5 rounded-full shadow-sm">
            <Compass size={11} className="text-orange-400" /> Du Lịch Biển / Gia Đình
          </span>
        );
      case 'STUDENT_SAVER':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-300 bg-teal-950/80 border border-teal-500/40 px-2.5 py-0.5 rounded-full shadow-sm">
            <GraduationCap size={11} className="text-teal-400" /> Sinh Viên
          </span>
        );
      case 'BUSINESS_FREQUENT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-300 bg-blue-950/80 border border-blue-500/40 px-2.5 py-0.5 rounded-full shadow-sm">
            <Briefcase size={11} className="text-blue-400" /> Công Tác
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 px-2.5 py-0.5 rounded-full shadow-sm">
            <Sparkles size={11} className="text-cyan-400" /> Phổ Biến
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                Realtime Monitor
              </span>
              <span className="text-xs text-slate-400">
                Đồng bộ lúc: {data?.checkedAt ? new Date(data.checkedAt).toLocaleTimeString('vi-VN') : 'Đang tải...'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Danh Sách Khách Đang Trực Tuyến
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Theo dõi trực quan danh sách khách hàng đang hiện diện trên trang web. Bấm vào bất kỳ khách nào để mở phòng giám sát Realtime chuyên sâu.
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
              {autoRefresh ? 'Tự quét (5s)' : 'Tự quét: Tắt'}
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
              <p className="text-xs text-slate-400 uppercase font-semibold">Tổng Khách Đang Online</p>
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
              <p className="text-xs text-emerald-400 uppercase font-semibold">Khách Đã Đăng Nhập</p>
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
              <p className="text-xs text-amber-400 uppercase font-semibold">Khách Vãng Lai (Guest)</p>
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

      {/* Clean & Legible Visitors Table */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-4 w-12 text-center">Status</th>
                <th className="px-4 py-4">Địa Chỉ IP & Thiết Bị (Bắt Buộc)</th>
                <th className="px-4 py-4">Định Danh Khách Hàng</th>
                <th className="px-4 py-4">Trang Đang Xem</th>
                <th className="px-4 py-4">Vừa Làm Gì</th>
                <th className="px-4 py-4">Hoạt Động</th>
                <th className="px-4 py-4">Thời Gian Dừng</th>
                <th className="px-4 py-4">Phân Khúc AI</th>
                <th className="px-4 py-4 text-right">Chi Tiết Realtime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw size={24} className="animate-spin text-indigo-500" />
                      <span>Đang quét các kết nối trực tuyến realtime...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-slate-400">
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
                    onClick={() => navigate(`/admin/live-visitors/${visitor.sessionId}`)}
                    className="hover:bg-indigo-950/30 transition-all group cursor-pointer"
                  >
                    {/* Status Pulse */}
                    <td className="px-5 py-4 text-center align-middle">
                      <span className="relative flex h-3 w-3 mx-auto" title="Đang trực tuyến">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                    </td>

                    {/* 1. IP & Device */}
                    <td className="px-5 py-4 align-middle">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded shadow-sm">
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
                          <span className="text-[11px] text-slate-400 truncate max-w-[120px]" title={visitor.trafficSource}>
                            {visitor.trafficSource || 'Direct'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Customer Identity */}
                    <td className="px-5 py-4 align-middle">
                      {visitor.isRegisteredCustomer ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {visitor.customerName?.charAt(0) || 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-xs truncate max-w-[160px]">
                                {visitor.customerName}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                                Thành viên
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                              {visitor.customerEmail}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center font-bold text-xs shrink-0">
                            G
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.2 rounded">
                              Khách vãng lai
                            </span>
                            <p className="font-mono text-[11px] text-slate-400 truncate max-w-[150px] mt-0.5" title={visitor.anonymousId}>
                              {visitor.anonymousId}
                            </p>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* 3. Current Page */}
                    <td className="px-4 py-4 align-middle">
                      <div className="min-w-0 max-w-[200px]">
                        <p className="text-xs font-semibold text-white truncate" title={visitor.currentPageTitle}>
                          {visitor.currentPageTitle || 'Trang đặt vé'}
                        </p>
                        <p className="text-[11px] font-mono text-indigo-300 truncate mt-0.5" title={visitor.currentPageUrl}>
                          {visitor.currentPageUrl || '/'}
                        </p>
                      </div>
                    </td>

                    {/* 4. Last Action */}
                    <td className="px-4 py-4 align-middle">
                      <div className="min-w-0 max-w-[170px] space-y-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-300 bg-purple-950/80 border border-purple-500/30 px-2 py-0.5 rounded truncate max-w-full">
                          {visitor.lastActionType || 'XEM_TRANG'}
                        </span>
                        {visitor.lastActionPayload && (
                          <p className="text-[10px] text-slate-400 font-mono truncate" title={visitor.lastActionPayload}>
                            {visitor.lastActionPayload}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* 5. Relative Time (Newest First Indicator) */}
                    <td className="px-4 py-4 align-middle">
                      <div className="text-xs font-medium">
                        {formatRelativeActivity(visitor.lastActivityTime)}
                      </div>
                    </td>

                    {/* 6. Dwell Time */}
                    <td className="px-4 py-4 align-middle">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                        <Clock size={13} className="text-amber-400 shrink-0" />
                        <span>{formatDwellTime(visitor.activeSecondsOnPage, visitor.idleSecondsOnPage)}</span>
                      </div>
                    </td>

                    {/* 7. Persona */}
                    <td className="px-4 py-4 align-middle">
                      {getPersonaBadge(visitor.matchedPersona)}
                    </td>

                    {/* 8. Action Button */}
                    <td className="px-4 py-4 align-middle text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/live-visitors/${visitor.sessionId}`);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 hover:border-indigo-500 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition-all shadow-md group-hover:scale-105"
                      >
                        <Eye size={13} />
                        <span>Giám sát realtime</span>
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
    </div>
  );
};
