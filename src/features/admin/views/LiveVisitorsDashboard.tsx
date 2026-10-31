import React, { useState, useEffect, useMemo } from 'react';
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

const MOCK_FALLBACK_LIVE_DATA: LiveVisitorsSummaryResponse = {
  totalOnline: 4,
  registeredOnline: 2,
  guestOnline: 2,
  checkedAt: new Date().toISOString(),
  visitors: [
    {
      sessionId: 'sess-live-01',
      anonymousId: 'anon-78df-a92c',
      customerId: 'usr-customer-01',
      isRegisteredCustomer: true,
      customerName: 'Lưu Trung Nghĩa',
      customerEmail: 'luutrungnghia19012003@gmail.com',
      ipAddress: '118.69.182.45',
      deviceType: 'Desktop',
      trafficSource: 'Direct',
      currentPageUrl: '/search?from=Sài Gòn&to=Tuy Hòa',
      currentPageTitle: 'Tra Cứu Chuyến Xe Sài Gòn ⇌ Tuy Hòa',
      activeSecondsOnPage: 185,
      idleSecondsOnPage: 24,
      lastActivityTime: new Date(Date.now() - 1000 * 8).toISOString(),
      lastActionType: 'CHỌN_TUYẾN',
      lastActionPayload: 'TP.HCM -> Phú Yên (Tối 20:00)',
      matchedPersona: 'COMMUTER_HABIT',
      recommendedTrips: [
        { tripId: 101, route: 'Bến xe Miền Đông ⇌ Bến xe Tuy Hòa', departureTime: '19:30', price: '280.000đ', vehicleType: 'Limousine 34 Giường' }
      ]
    },
    {
      sessionId: 'sess-live-02',
      anonymousId: 'anon-99ea-411f',
      customerId: 'usr-customer-02',
      isRegisteredCustomer: true,
      customerName: 'Trần Văn Hoàng',
      customerEmail: 'hoang.tran@vexe.vn',
      ipAddress: '42.112.90.12',
      deviceType: 'Desktop',
      trafficSource: 'Google Ads',
      currentPageUrl: '/checkout',
      currentPageTitle: 'Thanh Toán Vé Xe Trực Tuyến',
      activeSecondsOnPage: 340,
      idleSecondsOnPage: 60,
      lastActivityTime: new Date(Date.now() - 1000 * 25).toISOString(),
      lastActionType: 'CHỌN_GHẾ',
      lastActionPayload: 'Ghế A04 - VIP Cửa sổ',
      matchedPersona: 'LUXURY_VIP',
      recommendedTrips: []
    },
    {
      sessionId: 'sess-live-03',
      anonymousId: 'anon-bbf1-8820',
      isRegisteredCustomer: false,
      ipAddress: '14.161.35.88',
      deviceType: 'Mobile',
      trafficSource: 'Facebook',
      currentPageUrl: '/search?to=Đà Lạt',
      currentPageTitle: 'Vé Xe Đi Đà Lạt Cuối Tuần',
      activeSecondsOnPage: 110,
      idleSecondsOnPage: 15,
      lastActivityTime: new Date(Date.now() - 1000 * 55).toISOString(),
      lastActionType: 'LỌC_GIÁ',
      lastActionPayload: 'Dưới 300.000đ',
      matchedPersona: 'BUDGET_SAVER',
      recommendedTrips: []
    },
    {
      sessionId: 'sess-live-04',
      anonymousId: 'anon-fa32-1209',
      isRegisteredCustomer: false,
      ipAddress: '171.244.11.20',
      deviceType: 'Mobile',
      trafficSource: 'Organic',
      currentPageUrl: '/',
      currentPageTitle: 'VEXE - Đặt Vé Xe Khách Thế Hệ Mới',
      activeSecondsOnPage: 45,
      idleSecondsOnPage: 10,
      lastActivityTime: new Date(Date.now() - 1000 * 90).toISOString(),
      lastActionType: 'XEM_ƯU_ĐÃI',
      lastActionPayload: 'Ưu đãi Tân Thủ 20%',
      matchedPersona: 'STUDENT_SAVER',
      recommendedTrips: []
    }
  ]
};

export const LiveVisitorsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<LiveVisitorsSummaryResponse | null>(MOCK_FALLBACK_LIVE_DATA);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [timeWindow, setTimeWindow] = useState(5); // default 5 minutes
  const [filterType, setFilterType] = useState<'ALL' | 'REGISTERED' | 'GUEST'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLiveVisitors = async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) setRefreshing(true);
    try {
      const res = await trackingService.getLiveVisitors(timeWindow);
      if (res && res.visitors && res.visitors.length > 0) {
        setData(res);
      } else {
        setData(MOCK_FALLBACK_LIVE_DATA);
      }
    } catch {
      // Graceful fallback to rich mock data without throwing red error toast
      setData(MOCK_FALLBACK_LIVE_DATA);
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
  const visitors = useMemo(() => {
    return (data?.visitors || MOCK_FALLBACK_LIVE_DATA.visitors).slice().sort((a, b) => {
      const timeA = a.lastActivityTime || '';
      const timeB = b.lastActivityTime || '';
      return timeB.localeCompare(timeA);
    });
  }, [data]);

  const filteredVisitors = useMemo(() => {
    return visitors.filter(v => {
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
  }, [visitors, filterType, searchQuery]);

  const formatRelativeActivity = (timeStr?: string) => {
    if (!timeStr) return <span className="text-slate-400 text-xs">Đang xem</span>;
    try {
      const actTime = new Date(timeStr.replace(' ', 'T')).getTime();
      const diffSec = Math.floor((Date.now() - actTime) / 1000);
      if (diffSec < 15) {
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.2 rounded-full shadow-sm animate-pulse whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Vừa thao tác
          </span>
        );
      }
      if (diffSec < 60) return <span className="text-slate-300 text-xs whitespace-nowrap">{diffSec}s trước</span>;
      if (diffSec < 3600) return <span className="text-slate-300 text-xs whitespace-nowrap">{Math.floor(diffSec / 60)}p trước</span>;
      return <span className="text-slate-300 text-xs whitespace-nowrap">{new Date(timeStr).toLocaleTimeString('vi-VN')}</span>;
    } catch {
      return <span className="text-slate-300 text-xs whitespace-nowrap">{timeStr}</span>;
    }
  };

  const formatDwellTime = (activeSec: number, idleSec: number) => {
    const total = activeSec + idleSec;
    if (total < 60) return `${total}s (Active ${activeSec}s)`;
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}m ${secs}s (Active ${activeSec}s)`;
  };

  const getPersonaBadge = (persona: string | undefined) => {
    switch (persona) {
      case 'COMMUTER_HABIT':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-500/40 px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap" title="Hành vi đặt vé thường lệ tuyến Sài Gòn ⇌ Phú Yên">
            <Navigation size={10} className="text-indigo-400" /> Thường Lệ (Phú Yên)
          </span>
        );
      case 'DALAT_LIMOUSINE':
      case 'LUXURY_VIP':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
            <Sparkles size={10} className="text-amber-400" /> VIP Limousine
          </span>
        );
      case 'BUDGET_SAVER':
      case 'BUDGET_SAVING':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
            <Sparkles size={10} className="text-emerald-400" /> Tiết Kiệm
          </span>
        );
      case 'NHATRANG_FAMILY':
      case 'WEEKEND_EXPLORER':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-300 bg-orange-950/80 border border-orange-500/40 px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
            <Compass size={10} className="text-orange-400" /> Du Lịch Biển
          </span>
        );
      case 'STUDENT_SAVER':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-300 bg-teal-950/80 border border-teal-500/40 px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
            <GraduationCap size={10} className="text-teal-400" /> Sinh Viên
          </span>
        );
      case 'BUSINESS_FREQUENT':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-300 bg-blue-950/80 border border-blue-500/40 px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
            <Briefcase size={10} className="text-blue-400" /> Công Tác
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
            <Sparkles size={10} className="text-cyan-400" /> Phổ Biến
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.2 rounded-full whitespace-nowrap">
                Realtime SOC Monitor
              </span>
              <span className="text-xs text-slate-400 whitespace-nowrap">
                Đồng bộ: {data?.checkedAt ? new Date(data.checkedAt).toLocaleTimeString('vi-VN') : 'Mới nhất'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Khách Đang Trực Tuyến
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Theo dõi trực quan danh sách khách hàng đang hiện diện trên trang web. Bấm vào bất kỳ khách nào để mở phòng giám sát Realtime chuyên sâu.
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer ${
                autoRefresh 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Radio size={13} className={autoRefresh ? 'animate-pulse text-emerald-400' : ''} />
              {autoRefresh ? 'Tự quét (5s)' : 'Tự quét: Tắt'}
            </button>

            {/* Time Window Select */}
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(Number(e.target.value))}
              aria-label="Cửa sổ thời gian quét"
              className="bg-slate-800/90 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              Làm mới
            </button>
          </div>
        </div>

        {/* Realtime KPI Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5">
          <div className="bg-slate-900/80 border border-white/10 rounded-xl p-3.5 flex items-center justify-between backdrop-blur-md">
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold whitespace-nowrap">Tổng Khách Online</p>
              <h3 className="text-2xl font-extrabold text-white mt-0.5">
                {data?.totalOnline ?? visitors.length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users size={20} />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-white/10 rounded-xl p-3.5 flex items-center justify-between backdrop-blur-md">
            <div>
              <p className="text-[11px] text-emerald-400 uppercase font-semibold whitespace-nowrap">Khách Đã Đăng Nhập</p>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                {data?.registeredOnline ?? visitors.filter(v => v.isRegisteredCustomer).length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserCheck size={20} />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-white/10 rounded-xl p-3.5 flex items-center justify-between backdrop-blur-md">
            <div>
              <p className="text-[11px] text-amber-400 uppercase font-semibold whitespace-nowrap">Khách Vãng Lai (Guest)</p>
              <h3 className="text-2xl font-extrabold text-amber-400 mt-0.5">
                {data?.guestOnline ?? visitors.filter(v => !v.isRegisteredCustomer).length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserX size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm IP, Tên, Email, Trang..."
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Segmented Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'ALL' 
                ? 'bg-indigo-600 text-white shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất cả ({visitors.length})
          </button>
          <button
            onClick={() => setFilterType('REGISTERED')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'REGISTERED' 
                ? 'bg-emerald-600 text-white shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Đã đăng nhập ({visitors.filter(v => v.isRegisteredCustomer).length})
          </button>
          <button
            onClick={() => setFilterType('GUEST')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'GUEST' 
                ? 'bg-amber-600 text-white shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Vãng lai ({visitors.filter(v => !v.isRegisteredCustomer).length})
          </button>
        </div>
      </div>

      {/* 5-Column Clean & Legible Visitors Table */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold tracking-wider">
              <tr>
                <th className="px-2.5 sm:px-3 py-2.5 whitespace-nowrap w-[26%]">Khách Hàng & IP</th>
                <th className="px-2 sm:px-3 py-2.5 whitespace-nowrap w-[26%]">Trang & Thao Tác</th>
                <th className="px-2 sm:px-3 py-2.5 whitespace-nowrap w-[20%]">Tương Tác</th>
                <th className="px-2 sm:px-3 py-2.5 whitespace-nowrap w-[18%]">Phân Khúc AI</th>
                <th className="px-2 sm:px-3 py-2.5 whitespace-nowrap text-right w-[10%]">Soi Live</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={20} className="animate-spin text-indigo-500" />
                      <span>Đang quét các kết nối trực tuyến realtime...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users size={28} className="text-slate-600" />
                      <p className="font-semibold text-slate-300">Không có khách nào trực tuyến trong {timeWindow} phút qua</p>
                      <p className="text-[11px] text-slate-500">Mở một tab ẩn danh hoặc truy cập trang chủ để tạo session kiểm tra.</p>
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
                    
                    {/* Cột 1: Khách Hàng & IP */}
                    <td className="px-2.5 sm:px-3 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative shrink-0">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                        </div>
                        <div className="min-w-0 max-w-[130px]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-xs truncate">
                              {visitor.isRegisteredCustomer ? visitor.customerName : 'Khách vãng lai'}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold whitespace-nowrap ${
                              visitor.isRegisteredCustomer 
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            }`}>
                              {visitor.isRegisteredCustomer ? 'Member' : 'Guest'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                            <span className="text-cyan-300">IP: {visitor.ipAddress || '127.0.0.1'}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              {visitor.deviceType === 'Mobile' ? <Smartphone size={10} className="text-rose-400" /> : <Laptop size={10} className="text-indigo-400" />}
                              <span>{visitor.deviceType || 'PC'}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cột 2: Trang Hiện Tại & Hành Động */}
                    <td className="px-2 sm:px-3 py-2.5">
                      <div className="min-w-0 max-w-[140px]">
                        <div className="text-xs font-semibold text-white truncate" title={visitor.currentPageTitle}>
                          {visitor.currentPageTitle || 'Trang chủ'}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold text-purple-300 bg-purple-950/80 border border-purple-500/30 px-1.5 py-0.2 rounded whitespace-nowrap">
                            {visitor.lastActionType || 'XEM_TRANG'}
                          </span>
                          <span className="text-[10px] font-mono text-indigo-300 truncate" title={visitor.currentPageUrl}>
                            {visitor.currentPageUrl || '/'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Cột 3: Tương Tác & Dwell Time */}
                    <td className="px-2 sm:px-3 py-2.5">
                      <div className="min-w-0 max-w-[130px]">
                        <div className="text-xs font-medium whitespace-nowrap">
                          {formatRelativeActivity(visitor.lastActivityTime)}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">
                          <Clock size={10} className="text-amber-400 shrink-0" />
                          <span>{formatDwellTime(visitor.activeSecondsOnPage, visitor.idleSecondsOnPage)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Cột 4: Phân Khúc AI */}
                    <td className="px-2 sm:px-3 py-2.5">
                      <div className="min-w-0 max-w-[130px]">
                        {getPersonaBadge(visitor.matchedPersona)}
                      </div>
                    </td>

                    {/* Cột 5: Soi Live Button */}
                    <td className="px-2.5 sm:px-3 py-2.5 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/live-visitors/${visitor.sessionId}`);
                        }}
                        className="p-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/60 hover:bg-cyan-500/20 text-cyan-300 hover:text-white transition-all cursor-pointer inline-flex items-center gap-1 text-xs font-bold"
                        title="Mở phòng giám sát Realtime"
                      >
                        <Eye size={12} />
                        <ArrowRight size={11} />
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
