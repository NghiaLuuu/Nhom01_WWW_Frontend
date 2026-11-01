import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Radio, 
  Activity, 
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
  Eye,
  Navigation,
  Compass,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  ChevronRight,
  MousePointerClick,
  Globe,
  SlidersHorizontal,
  Layers,
  X,
  ShieldCheck,
  User,
  Route
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  trackingService, 
  type LiveVisitorsSummaryResponse, 
  type LiveVisitorDto,
  type TrackingAnalyticsResponse,
  type CustomerJourneyTimelineDto,
  type LiveVisitorDetailDto,
  type JourneyClusterDto
} from '../../../services/tracking.service';
import toast from 'react-hot-toast';

const EMPTY_ANALYTICS: TrackingAnalyticsResponse = {
  totalSessions: 0,
  uniqueVisitors: 0,
  avgSessionDurationSeconds: 0,
  trafficSources: {},
  actionBreakdown: {},
  topPages: [],
  recentSessions: []
};

export const UserTrackingHub: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active Tab: 'live' | 'overview' | 'journey'
  const activeTab = (searchParams.get('tab') as 'live' | 'overview' | 'journey') || 'live';
  const setActiveTab = (tab: 'live' | 'overview' | 'journey') => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('tab', tab);
      return p;
    });
  };

  // ==================== TAB 1: LIVE PRESENCE STATE ====================
  const [liveData, setLiveData] = useState<LiveVisitorsSummaryResponse | null>(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveRefreshing, setLiveRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [timeWindow, setTimeWindow] = useState(30); // 30 mins window for robust view
  const [presenceFilter, setPresenceFilter] = useState<'ALL' | 'ONLINE' | 'IDLE' | 'OFFLINE'>('ALL');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<'ALL' | 'REGISTERED' | 'GUEST'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Slide Drawer for Session Inspection
  const [drawerSessionId, setDrawerSessionId] = useState<string | null>(null);
  const [drawerDetail, setDrawerDetail] = useState<LiveVisitorDetailDto | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'PAGEVIEWS' | 'ACTIONS'>('PAGEVIEWS');

  // ==================== TAB 2: BEHAVIOR ANALYTICS STATE ====================
  const [analytics, setAnalytics] = useState<TrackingAnalyticsResponse>(EMPTY_ANALYTICS);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // ==================== TAB 3: CUSTOMER JOURNEY STATE ====================
  const [searchIdentifier, setSearchIdentifier] = useState(searchParams.get('id') || '');
  const [selectedJourney, setSelectedJourney] = useState<CustomerJourneyTimelineDto | null>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<string>('ALL');
  const [journeyLoading, setJourneyLoading] = useState(false);

  // Persona Label Helper
  const formatPersonaLabel = (persona: string | undefined) => {
    switch (persona) {
      case 'COMMUTER_HABIT': return 'Thường Lệ (Sài Gòn ⇌ Phú Yên)';
      case 'DALAT_LIMOUSINE':
      case 'LUXURY_VIP': return 'VIP Limousine';
      case 'BUDGET_SAVER':
      case 'BUDGET_SAVING': return 'Tiết Kiệm';
      case 'NHATRANG_FAMILY':
      case 'WEEKEND_EXPLORER': return 'Du Lịch Biển / Gia Đình';
      case 'STUDENT_SAVER': return 'Sinh Viên';
      case 'BUSINESS_FREQUENT': return 'Công Tác';
      case 'POPULAR_TRENDING': return 'Phổ Biến';
      default: return persona || 'Khách tìm chuyến nhanh';
    }
  };

  // Helper formatting seconds
  const formatSeconds = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}m ${s}s`;
  };

  // ==================== DATA FETCHERS ====================
  const fetchLiveVisitors = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLiveRefreshing(true);
    try {
      const res = await trackingService.getLiveVisitors(timeWindow);
      if (res) {
        setLiveData(res);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu khách trực tuyến:', err);
    } finally {
      setLiveLoading(false);
      setLiveRefreshing(false);
    }
  }, [timeWindow]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await trackingService.getAnalyticsOverview();
      if (res) {
        setAnalytics(res);
      }
    } catch (err) {
      console.error('Lỗi tải thống kê hành vi:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const loadJourney = useCallback(async (identifier: string) => {
    if (!identifier.trim()) return;
    setJourneyLoading(true);
    setSearchIdentifier(identifier);
    try {
      const data = await trackingService.getCustomerJourney(identifier.trim());
      if (data) {
        setSelectedJourney(data);
        if (data.journeys && data.journeys.length > 0) {
          setSelectedClusterId(data.journeys[0].journeyId);
        } else {
          setSelectedClusterId('ALL');
        }
      } else {
        setSelectedJourney(null);
      }
    } catch (err) {
      console.error('Lỗi tải hành trình khách hàng:', err);
      setSelectedJourney(null);
    } finally {
      setJourneyLoading(false);
    }
  }, []);

  // Fetch Drawer Session Detail
  const openSessionDrawer = async (sessionId: string) => {
    setDrawerSessionId(sessionId);
    setDrawerLoading(true);
    try {
      const res = await trackingService.getLiveVisitorDetail(sessionId);
      if (res) {
        setDrawerDetail(res);
      }
    } catch (err) {
      console.error('Lỗi tải chi tiết phiên:', err);
      toast.error('Không tìm thấy chi tiết phiên.');
    } finally {
      setDrawerLoading(false);
    }
  };

  const closeSessionDrawer = () => {
    setDrawerSessionId(null);
    setDrawerDetail(null);
  };

  // Trigger loading based on active tab
  useEffect(() => {
    if (activeTab === 'live') {
      fetchLiveVisitors(true);
    } else if (activeTab === 'overview') {
      fetchAnalytics();
    } else if (activeTab === 'journey') {
      const queryId = searchParams.get('id');
      if (queryId) {
        loadJourney(queryId);
      }
    }
  }, [activeTab, fetchLiveVisitors, fetchAnalytics, loadJourney, searchParams]);

  // Realtime Polling for Tab Live (5s)
  useEffect(() => {
    if (activeTab !== 'live' || !autoRefresh) return;
    const interval = setInterval(() => {
      fetchLiveVisitors(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab, autoRefresh, fetchLiveVisitors]);

  // Realtime Polling for Drawer if open (3s)
  useEffect(() => {
    if (!drawerSessionId || !autoRefresh) return;
    const interval = setInterval(async () => {
      try {
        const res = await trackingService.getLiveVisitorDetail(drawerSessionId);
        if (res) setDrawerDetail(res);
      } catch {
        // silent
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [drawerSessionId, autoRefresh]);

  // Jump to Journey Tab from any visitor / session
  const inspectCustomerJourney = (idOrEmailOrIp: string) => {
    closeSessionDrawer();
    setSearchParams({ tab: 'journey', id: idOrEmailOrIp });
    loadJourney(idOrEmailOrIp);
  };

  // ==================== LIVE FILTER LOGIC ====================
  // Categorize visitors strictly by presence:
  // ONLINE: diff <= 120s
  // IDLE: 120s < diff <= 300s
  // OFFLINE: diff > 300s
  const processedVisitors = useMemo(() => {
    const list = liveData?.visitors || [];
    return list.map(v => {
      // Calculate diff in seconds if backend hasn't assigned status
      let status: 'ONLINE' | 'IDLE' | 'OFFLINE' = v.onlineStatus || 'OFFLINE';
      let label = v.statusLabel || '';
      
      if (!v.onlineStatus && v.lastActivityTime) {
        try {
          const actTime = new Date(v.lastActivityTime.replace(' ', 'T')).getTime();
          const diffSec = Math.max(0, Math.floor((Date.now() - actTime) / 1000));
          if (diffSec <= 120) {
            status = 'ONLINE';
            label = `Đang trực tuyến (${diffSec}s trước)`;
          } else if (diffSec <= 300) {
            status = 'IDLE';
            label = `Treo tab (${Math.max(1, Math.round(diffSec / 60))}p trước)`;
          } else {
            status = 'OFFLINE';
            const mins = Math.max(1, Math.round(diffSec / 60));
            label = mins > 60 ? `Đã rời (${Math.round(mins / 60)}h trước)` : `Đã rời (${mins}p trước)`;
          }
        } catch {
          status = 'OFFLINE';
          label = 'Không xác định';
        }
      }

      return {
        ...v,
        computedStatus: status,
        computedLabel: label
      };
    });
  }, [liveData]);

  // Aggregate Presence KPI
  const presenceCounts = useMemo(() => {
    let online = 0;
    let idle = 0;
    let offline = 0;
    let registered = 0;
    let guest = 0;

    processedVisitors.forEach(v => {
      if (v.computedStatus === 'ONLINE') online++;
      else if (v.computedStatus === 'IDLE') idle++;
      else offline++;

      if (v.isRegisteredCustomer) registered++;
      else guest++;
    });

    return {
      online: liveData?.totalOnline !== undefined ? liveData.totalOnline : online,
      idle: liveData?.totalIdle !== undefined ? liveData.totalIdle : idle,
      offline: liveData?.totalOffline !== undefined ? liveData.totalOffline : offline,
      registered,
      guest
    };
  }, [processedVisitors, liveData]);

  // Filtered live visitors for table
  const filteredLiveVisitors = useMemo(() => {
    return processedVisitors.filter(v => {
      // 1. Presence Combobox Filter
      if (presenceFilter !== 'ALL' && v.computedStatus !== presenceFilter) {
        return false;
      }

      // 2. Customer Type Filter
      if (customerTypeFilter === 'REGISTERED' && !v.isRegisteredCustomer) return false;
      if (customerTypeFilter === 'GUEST' && v.isRegisteredCustomer) return false;

      // 3. Search Query
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
  }, [processedVisitors, presenceFilter, customerTypeFilter, searchQuery]);

  return (
    <div className="space-y-6">

      {/* TOP UNIFIED COMMAND HEADER */}
      <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
            <Radio size={13} className="text-cyan-400 animate-pulse" />
            <span>Trung Tâm Giám Sát & Phân Tích Khách Hàng (Unified SOC Hub)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Giám Sát Trực Tuyến & Phân Tích Hành Vi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Theo dõi khách hiện diện thời gian thực, phân biệt chính xác trạng thái Online/Treo tab/Offline, phân tích lưu lượng chuyển đổi và truy vết trọn vẹn hành trình A - Z.
          </p>
        </div>

        {/* 3 Main Tabs Switcher */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/10 shrink-0 self-start md:self-center shadow-inner">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'live'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio size={14} className={activeTab === 'live' ? 'animate-pulse' : ''} />
            <span>Khách Trực Tuyến</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'live' ? 'bg-slate-950/40 text-slate-950' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {presenceCounts.online}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity size={14} />
            <span>Phân Tích Hành Vi</span>
          </button>

          <button
            onClick={() => setActiveTab('journey')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'journey'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass size={14} />
            <span>Hành Trình A - Z</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: KHÁCH ĐANG TRỰC TUYẾN & PHÂN BIỆT TRẠNG THÁI (LIVE SOC MONITOR)   */}
      {/* ========================================================================= */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          
          {/* Top Realtime Control Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className={`w-2.5 h-2.5 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                <strong className="text-white font-mono">Realtime SOC:</strong>
                <span className="text-slate-400">{autoRefresh ? 'Tự quét mỗi 5s' : 'Đã tạm dừng tự quét'}</span>
              </span>
              
              <button
                type="button"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  autoRefresh 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                    : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {autoRefresh ? 'Tắt tự quét' : 'Bật tự quét (5s)'}
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs text-slate-400">Cửa sổ quét:</span>
              <select
                value={timeWindow}
                onChange={(e) => setTimeWindow(Number(e.target.value))}
                className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value={5}>5 phút gần nhất</option>
                <option value={15}>15 phút gần nhất</option>
                <option value={30}>30 phút gần nhất</option>
                <option value={60}>1 giờ gần nhất</option>
              </select>

              <button
                type="button"
                onClick={() => fetchLiveVisitors(true)}
                disabled={liveRefreshing}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw size={13} className={liveRefreshing ? 'animate-spin text-cyan-400' : ''} />
                <span>Làm mới</span>
              </button>
            </div>
          </div>

          {/* 5 KPI CARDS: PHÂN BIỆT RÕ RÀNG TRẠNG THÁI HIỆN DIỆN */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            
            {/* Card 1: ONLINE */}
            <div 
              onClick={() => setPresenceFilter(presenceFilter === 'ONLINE' ? 'ALL' : 'ONLINE')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                presenceFilter === 'ONLINE' 
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/10' 
                  : 'bg-slate-900/60 border-white/10 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Đang Online
                </span>
                <span className="text-[10px] text-slate-400">&lt; 2 phút</span>
              </div>
              <div className="text-2xl font-black text-white mt-1.5 font-mono">
                {presenceCounts.online}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Đang thao tác hoặc gửi ping</p>
            </div>

            {/* Card 2: IDLE */}
            <div 
              onClick={() => setPresenceFilter(presenceFilter === 'IDLE' ? 'ALL' : 'IDLE')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                presenceFilter === 'IDLE' 
                  ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-500/10' 
                  : 'bg-slate-900/60 border-white/10 hover:border-amber-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Treo Tab / Chờ
                </span>
                <span className="text-[10px] text-slate-400">2 - 5 phút</span>
              </div>
              <div className="text-2xl font-black text-amber-300 mt-1.5 font-mono">
                {presenceCounts.idle}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Mở tab nhưng không di chuột</p>
            </div>

            {/* Card 3: OFFLINE */}
            <div 
              onClick={() => setPresenceFilter(presenceFilter === 'OFFLINE' ? 'ALL' : 'OFFLINE')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                presenceFilter === 'OFFLINE' 
                  ? 'bg-rose-950/40 border-slate-400 shadow-lg' 
                  : 'bg-slate-900/60 border-white/10 hover:border-slate-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  Đã Off Hoàn Toàn
                </span>
                <span className="text-[10px] text-slate-400">&gt; 5 phút</span>
              </div>
              <div className="text-2xl font-black text-slate-300 mt-1.5 font-mono">
                {presenceCounts.offline}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Đã đóng tab / ngắt kết nối</p>
            </div>

            {/* Card 4: Registered */}
            <div 
              onClick={() => setCustomerTypeFilter(customerTypeFilter === 'REGISTERED' ? 'ALL' : 'REGISTERED')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                customerTypeFilter === 'REGISTERED' 
                  ? 'bg-blue-950/40 border-cyan-500' 
                  : 'bg-slate-900/60 border-white/10 hover:border-cyan-500/40'
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block">
                Đã Đăng Nhập
              </span>
              <div className="text-2xl font-black text-cyan-300 mt-1.5 font-mono">
                {presenceCounts.registered}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Có tài khoản thành viên</p>
            </div>

            {/* Card 5: Guest */}
            <div 
              onClick={() => setCustomerTypeFilter(customerTypeFilter === 'GUEST' ? 'ALL' : 'GUEST')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                customerTypeFilter === 'GUEST' 
                  ? 'bg-purple-950/40 border-purple-500' 
                  : 'bg-slate-900/60 border-white/10 hover:border-purple-500/40'
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
                Khách Vãng Lai
              </span>
              <div className="text-2xl font-black text-purple-300 mt-1.5 font-mono">
                {presenceCounts.guest}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Theo dõi qua Fingerprint & IP</p>
            </div>

          </div>

          {/* FILTER CONTROLS BAR: COMBOBOX PHÂN LOẠI TRẠNG THÁI + SEARCH + PILLS */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 bg-slate-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
            
            {/* Search Box */}
            <div className="relative flex-1 min-w-[240px]">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhanh theo IP, Tên khách, Email, URL đang xem..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* COMBOBOX 1: PHÂN LOẠI TRẠNG THÁI HOẠT ĐỘNG (YÊU CẦU TRỌNG TÂM CỦA USER) */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 whitespace-nowrap">Trạng thái:</span>
                <select
                  value={presenceFilter}
                  onChange={(e) => setPresenceFilter(e.target.value as any)}
                  className="bg-slate-950 border border-cyan-500/40 text-cyan-300 font-semibold text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="ALL">🌐 Tất cả trạng thái ({processedVisitors.length})</option>
                  <option value="ONLINE">🟢 Đang trực tuyến (Active &lt; 2p) ({presenceCounts.online})</option>
                  <option value="IDLE">🟡 Treo tab / Chờ (2 - 5p) ({presenceCounts.idle})</option>
                  <option value="OFFLINE">⚪ Đã rời trang / Off hoàn toàn (&gt; 5p) ({presenceCounts.offline})</option>
                </select>
              </div>

              {/* PILLS 2: PHÂN LOẠI KHÁCH HÀNG */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setCustomerTypeFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    customerTypeFilter === 'ALL' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerTypeFilter('REGISTERED')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    customerTypeFilter === 'REGISTERED' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Đã đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerTypeFilter('GUEST')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    customerTypeFilter === 'GUEST' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Vãng lai
                </button>
              </div>

            </div>
          </div>

          {/* LIVE VISITORS TABLE */}
          <div className="rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio size={16} className="text-emerald-400" />
                <h3 className="font-bold text-white text-sm">
                  Danh Sách Khách Hàng Hiện Diện ({filteredLiveVisitors.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Hiển thị mới nhất trước • Bấm &quot;Soi Live&quot; hoặc &quot;Hành trình A-Z&quot; để kiểm tra chuyên sâu
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-white/10">
                  <tr>
                    <th className="py-3 px-3 sm:px-4 whitespace-nowrap">Khách Hàng & IP</th>
                    <th className="py-3 px-3 sm:px-4 whitespace-nowrap">Trạng Thái Hiện Diện</th>
                    <th className="py-3 px-3 sm:px-4 whitespace-nowrap">Trang Đang Xem & Thao Tác</th>
                    <th className="py-3 px-3 sm:px-4 whitespace-nowrap">Thời Gian Dừng</th>
                    <th className="py-3 px-3 sm:px-4 whitespace-nowrap">Gu AI Gán</th>
                    <th className="py-3 px-3 sm:px-4 whitespace-nowrap text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLiveVisitors.map((v, vIdx) => {
                    const isOnline = v.computedStatus === 'ONLINE';
                    const isIdle = v.computedStatus === 'IDLE';

                    return (
                      <tr key={`${v.sessionId}-${vIdx}`} className="hover:bg-white/[0.02] transition-colors">
                        
                        {/* 1. Customer & IP */}
                        <td className="py-3 px-3 sm:px-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white truncate max-w-[150px]">
                                {v.customerName || 'Khách vãng lai'}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                v.isRegisteredCustomer 
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                                  : 'bg-slate-800 text-slate-400'
                              }`}>
                                {v.isRegisteredCustomer ? 'Thành Viên' : 'Guest'}
                              </span>
                            </div>
                            <div className="font-mono text-[10px] text-slate-400 mt-0.5 truncate">
                              IP: {v.ipAddress} • {v.deviceType || 'Desktop'}
                            </div>
                          </div>
                        </td>

                        {/* 2. Trạng thái hiện diện (NGHIỆP VỤ PHÂN BIỆT RÕ RÀNG) */}
                        <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                          {isOnline ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-[11px]">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                              <span>{v.computedLabel || 'Đang trực tuyến'}</span>
                            </span>
                          ) : isIdle ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold text-[11px]">
                              <span className="w-2 h-2 rounded-full bg-amber-400" />
                              <span>{v.computedLabel || 'Treo tab'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-white/10 text-slate-400 font-medium text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                              <span>{v.computedLabel || 'Đã rời web'}</span>
                            </span>
                          )}
                        </td>

                        {/* 3. Trang & Thao tác */}
                        <td className="py-3 px-3 sm:px-4">
                          <div className="min-w-0 max-w-[260px]">
                            <div className="font-semibold text-white truncate text-xs" title={v.currentPageTitle}>
                              {v.currentPageTitle || 'Trang chủ'}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono text-[9px] uppercase font-bold shrink-0">
                                {v.lastActionType || 'XEM_TRANG'}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400 truncate">
                                {v.currentPageUrl}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 4. Thời gian dừng */}
                        <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                          <div className="font-mono text-[11px] text-slate-300">
                            <span className="text-emerald-400 font-semibold">Tương tác: {v.activeSecondsOnPage || 0}s</span>
                            {Boolean(v.idleSecondsOnPage) && (
                              <span className="text-slate-400 ml-1.5">(Treo: {v.idleSecondsOnPage}s)</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Ghé lúc: {v.lastActivityTime || 'N/A'}
                          </div>
                        </td>

                        {/* 5. Gu AI gán */}
                        <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold text-[11px]">
                            <Sparkles size={11} className="text-purple-400 shrink-0" />
                            <span>{formatPersonaLabel(v.matchedPersona)}</span>
                          </span>
                        </td>

                        {/* 6. Thao tác */}
                        <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openSessionDrawer(v.sessionId)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                              title="Mở bảng điều khiển Soi Live phiên này"
                            >
                              <Eye size={12} />
                              <span>Soi Live</span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => inspectCustomerJourney(v.customerId || v.anonymousId || v.ipAddress)}
                              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                              title="Truy vết toàn bộ hành trình A - Z"
                            >
                              <Compass size={12} />
                              <span>Hành trình A-Z</span>
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}

                  {filteredLiveVisitors.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Users size={32} className="mx-auto text-slate-600 mb-2" />
                        <p className="text-sm font-semibold text-white">Không tìm thấy khách hàng nào phù hợp bộ lọc</p>
                        <p className="text-xs text-slate-400 mt-1">Thử đổi điều kiện tìm kiếm hoặc chọn &quot;Tất cả trạng thái&quot;.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TỔNG QUAN HÀNH VI & PHỄU CHUYỂN ĐỔI (BEHAVIOR ANALYTICS)          */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* KPI CARDS (Overview) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between h-[88px]">
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap">Tổng Số Phiên</div>
                <div className="text-2xl font-black text-white mt-1 font-mono">
                  {analytics.totalSessions} Phiên
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Globe size={20} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between h-[88px]">
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap">Khách Định Danh</div>
                <div className="text-2xl font-black text-emerald-300 mt-1 font-mono">
                  {analytics.uniqueVisitors} Khách
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Users size={20} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between h-[88px]">
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap">Thời Gian Dừng TB</div>
                <div className="text-2xl font-black text-amber-300 mt-1 font-mono">
                  {formatSeconds(Math.round(analytics.avgSessionDurationSeconds || 0))}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Clock size={20} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between h-[88px]">
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap">Tương Tác Realtime</div>
                <div className="text-2xl font-black text-purple-300 mt-1 font-mono">
                  {Object.values(analytics.actionBreakdown || {}).reduce((a, b) => a + b, 0)} Event
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <MousePointerClick size={20} />
              </div>
            </div>

          </div>

          {/* Traffic Sources & Action Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Traffic Sources */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Globe size={16} className="text-cyan-400 shrink-0" />
                <span>Nguồn Lưu Lượng (Traffic Sources)</span>
              </h3>
              
              <div className="space-y-3 pt-1">
                {Object.entries(analytics.trafficSources || {}).map(([source, count]) => {
                  const total = analytics.totalSessions || 1;
                  const percent = Math.round((Number(count) / total) * 100);
                  return (
                    <div key={source} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-300">
                        <span className="capitalize">{source}</span>
                        <span className="font-mono text-cyan-300">{count} lượt ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions Breakdown */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <MousePointerClick size={16} className="text-purple-400 shrink-0" />
                <span>Phân Bổ Tương Tác (Action Breakdown)</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {Object.entries(analytics.actionBreakdown || {}).map(([action, count]) => (
                  <div key={action} className="p-3 rounded-xl bg-slate-950/80 border border-white/5">
                    <div className="text-[11px] font-mono text-slate-400 truncate" title={action}>
                      {action}
                    </div>
                    <div className="text-lg font-black text-white mt-1 font-mono">
                      {count} <span className="text-[10px] text-slate-400 font-normal">clicks</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Top Pages Table */}
          <div className="rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation size={16} className="text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Top Trang Được Xem & Thời Gian Dừng Thực Tế</h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-white/10">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">Đường Dẫn (URL)</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">Lượt Xem</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">Thời Gian Tương Tác TB</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">Treo Tab TB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(analytics.topPages || []).map((page, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3 font-mono text-cyan-300 font-semibold">{page.pageUrl}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-white">{page.viewCount}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-300">{page.avgActiveSeconds}s</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">{page.avgIdleSeconds}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Sessions Table with Instant A-Z Inspect Button */}
          <div className="rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-purple-400" />
                <h3 className="font-bold text-white text-sm">
                  Phiên Truy Cập Gần Đây (Bấm &quot;Xem A-Z&quot; để mở bản đồ hành trình)
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-white/10">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">Khách Hàng & IP</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Nguồn & Thời Gian</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Lượt Xem & Tương Tác</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(analytics.recentSessions || []).map((s, sIdx) => (
                    <tr key={`${s.sessionId}-${sIdx}`} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2 px-3">
                        <div className="font-mono font-semibold text-white truncate">
                          {s.customerId ? (
                            <span className="text-cyan-300 font-bold">Khách #{s.customerId.substring(0, 8)}</span>
                          ) : (
                            <span className="text-slate-300">{s.anonymousId}</span>
                          )}
                        </div>
                        <div className="font-mono text-[10px] text-cyan-400 mt-0.5 truncate">
                          IP: {s.ipAddress}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <span className="capitalize px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-medium text-slate-300">
                          {s.trafficSource}
                        </span>
                        <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                          {s.createdAt}
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-300 whitespace-nowrap">
                        {s.pageViewCount} trang • {s.actionCount} clicks
                      </td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => inspectCustomerJourney(s.customerId || s.anonymousId || s.ipAddress)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Xem A-Z
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TRUY VẾT HÀNH TRÌNH KHÁCH HÀNG A - Z (CUSTOMER JOURNEY TIMELINE)  */}
      {/* ========================================================================= */}
      {activeTab === 'journey' && (
        <div className="space-y-6">
          
          {/* Search Journey Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchIdentifier.trim()) {
                setSearchParams({ tab: 'journey', id: searchIdentifier.trim() });
                loadJourney(searchIdentifier.trim());
              }
            }} 
            className="flex flex-wrap sm:flex-nowrap gap-3"
          >
            <div className="relative flex-1 min-w-[240px]">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input 
                type="text"
                value={searchIdentifier}
                onChange={(e) => setSearchIdentifier(e.target.value)}
                placeholder="Nhập IP, Email khách hàng, hoặc Anonymous ID..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={journeyLoading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-purple-500/20 whitespace-nowrap cursor-pointer shrink-0"
            >
              <Search size={13} />
              <span>Truy Vết Hành Trình</span>
            </button>
          </form>

          {/* Loading Indicator */}
          {journeyLoading && (
            <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
              <Activity size={32} className="animate-spin text-purple-400 mx-auto mb-3" />
              <p className="text-xs text-slate-300">Đang truy vấn và xâu chuỗi dữ liệu hành trình khách hàng từ máy chủ...</p>
            </div>
          )}

          {/* Empty State */}
          {!selectedJourney && !journeyLoading && (
            <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
              <Users size={36} className="text-slate-500 mx-auto mb-3" />
              <h3 className="text-white font-bold text-sm">Chưa có khách hàng nào được chọn</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Nhập Email, Anonymous ID hoặc bấm nút &quot;Hành trình A-Z&quot; từ tab Khách Trực Tuyến để truy vết toàn bộ lịch sử đa phiên.
              </p>
            </div>
          )}

          {/* Journey Details */}
          {selectedJourney && (() => {
            const isRegistered = Boolean(selectedJourney.isRegisteredCustomer || (selectedJourney as any).registeredCustomer);
            const journeysList: JourneyClusterDto[] = selectedJourney.journeys || [];
            const activeCluster = journeysList.find(j => j.journeyId === selectedClusterId);
            const displayEvents = (selectedClusterId === 'ALL' || !activeCluster)
              ? selectedJourney.events
              : activeCluster.events;

            return (
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-2xl space-y-5">
                
                {/* 1. Identity Stitching Banner */}
                {isRegistered ? (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <ShieldCheck size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">Hồ Sơ Khách Hàng Đã Định Danh</span>
                          <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                            Identity Stitched
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5 truncate">
                          Họ tên: <strong className="text-white">{selectedJourney.customerName}</strong> • Email: <strong className="text-cyan-300">{selectedJourney.customerEmail}</strong>
                          {selectedJourney.linkedAnonymousIds && selectedJourney.linkedAnonymousIds.length > 0 && (
                            <span className="text-slate-400 ml-2">
                              (Đã tự động gộp {selectedJourney.linkedAnonymousIds.length} phiên thiết bị vãng lai trước khi đăng nhập)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 font-mono shrink-0">
                      Định danh: {selectedJourney.identifier}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <Compass size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">Khách Vãng Lai (Chưa Đăng Nhập)</span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                          Guest Tracking
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Theo dõi qua Fingerprint & IP ({selectedJourney.identifier}). Ngay khi khách đăng nhập hoặc đặt vé, toàn bộ lịch sử này sẽ tự động gộp vào tài khoản khách!
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Overview Stats & Persona */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                      <User size={18} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-white truncate">{selectedJourney.customerName}</h2>
                      <p className="text-xs text-slate-400 font-mono truncate">ID: {selectedJourney.identifier}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="px-3 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap">
                      <Sparkles size={12} className="text-purple-400" />
                      <span>Gu AI gán: <strong>{formatPersonaLabel(selectedJourney.matchedPersona)}</strong></span>
                    </div>
                    <div className="px-3 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold whitespace-nowrap">
                      {selectedJourney.totalSessions} phiên • {selectedJourney.totalPageViews} trang • {selectedJourney.totalActions} tương tác
                    </div>
                  </div>
                </div>

                {/* 3. Journey Selector */}
                {journeysList.length > 0 && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                        <Route size={15} className="text-cyan-400" />
                        <span>Phân Đoạn Hành Trình Động (Dynamic Journeys):</span>
                      </h3>
                      <span className="text-xs text-slate-400">
                        Tìm thấy <strong>{journeysList.length}</strong> hành trình
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedClusterId('ALL')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          selectedClusterId === 'ALL'
                            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                            : 'bg-slate-950 text-slate-300 hover:text-white border border-white/10'
                        }`}
                      >
                        Tất cả sự kiện ({selectedJourney.events.length})
                      </button>

                      {journeysList.map((j) => (
                        <button
                          key={j.journeyId}
                          type="button"
                          onClick={() => setSelectedClusterId(j.journeyId)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                            selectedClusterId === j.journeyId
                              ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                              : 'bg-slate-950 text-slate-300 hover:text-white border border-white/10'
                          }`}
                        >
                          <span>{j.title}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-900 border border-white/10">
                            {j.events.length}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Timeline Events */}
                <div className="pt-2">
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-purple-500 before:to-emerald-500">
                    {displayEvents.map((evt, idx) => {
                      const isSession = evt.type === 'SESSION_START';
                      const isPageView = evt.type === 'PAGE_VIEW';

                      return (
                        <div key={idx} className="relative group">
                          {/* Dot */}
                          <div className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-slate-950 transition-transform group-hover:scale-125 ${
                            isSession ? 'bg-cyan-400 ring-2 ring-cyan-500/30' : isPageView ? 'bg-emerald-400' : 'bg-purple-400'
                          }`} />

                          {/* Event Card */}
                          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5 hover:border-cyan-500/30 transition-colors space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className={`font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.2 rounded whitespace-nowrap ${
                                isSession ? 'bg-cyan-500/20 text-cyan-300' : isPageView ? 'bg-emerald-500/20 text-emerald-300' : 'bg-purple-500/20 text-purple-300'
                              }`}>
                                {evt.type}
                              </span>
                              <span className="font-mono text-slate-400 text-[10px] whitespace-nowrap">{evt.timestamp}</span>
                            </div>

                            <div className="font-bold text-white text-xs mt-0.5">
                              {evt.title}
                            </div>

                            <div className="text-[11px] text-slate-300 font-mono break-all">
                              {evt.description}
                            </div>

                            {(((evt.activeSeconds || 0) > 0) || ((evt.idleSeconds || 0) > 0)) && (
                              <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1 border-t border-white/5 mt-1">
                                <span className="text-emerald-400 font-semibold whitespace-nowrap">Tương tác: {evt.activeSeconds || 0}s</span>
                                {(evt.idleSeconds || 0) > 0 && <span className="text-slate-400 whitespace-nowrap">Treo tab: {evt.idleSeconds}s</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })()}

        </div>
      )}

      {/* ========================================================================= */}
      {/* SLIDE-OVER DRAWER: SOI CHI TIẾT PHIÊN REALTIME (SESSION INSPECTOR)       */}
      {/* ========================================================================= */}
      {drawerSessionId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          
          {/* Backdrop click to close */}
          <div className="flex-1" onClick={closeSessionDrawer} />

          {/* Drawer Content */}
          <div className="w-full max-w-xl bg-slate-900 border-l border-white/10 shadow-2xl h-full flex flex-col overflow-hidden">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Radio size={18} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-white text-sm">
                    Phòng Giám Sát Phiên Realtime
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    ID: {drawerSessionId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeSessionDrawer}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
              
              {drawerLoading && (
                <div className="py-20 text-center">
                  <Activity size={32} className="animate-spin text-emerald-400 mx-auto mb-3" />
                  <p className="text-xs text-slate-300">Đang đồng bộ dữ liệu phiên trực tuyến...</p>
                </div>
              )}

              {drawerDetail && (() => {
                const vis = drawerDetail.visitor;

                return (
                  <>
                    {/* Visitor Info Card */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{vis.customerName || 'Khách vãng lai'}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            vis.isRegisteredCustomer ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {vis.isRegisteredCustomer ? 'Thành Viên' : 'Vãng Lai'}
                          </span>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          drawerDetail.isOnline 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {drawerDetail.isOnline ? '🟢 Đang Online' : '⚪ Đã ngắt kết nối'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                        <div>
                          <span className="text-slate-400">IP:</span> <strong className="font-mono text-cyan-300">{vis.ipAddress}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Thiết bị:</span> <strong>{vis.deviceType || 'Desktop'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Nguồn:</span> <strong className="capitalize">{vis.trafficSource || 'Direct'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Gu AI:</span> <strong className="text-purple-300">{formatPersonaLabel(vis.matchedPersona)}</strong>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex justify-end">
                        <button
                          type="button"
                          onClick={() => inspectCustomerJourney(vis.customerId || vis.anonymousId || vis.ipAddress)}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Compass size={13} />
                          <span>Truy vết toàn bộ hành trình khách này</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>

                    {/* AI Personalized Recommendations if any */}
                    {vis.recommendedTrips && vis.recommendedTrips.length > 0 && (
                      <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                          <Sparkles size={14} className="text-purple-400" />
                          <span>Chuyến Xe AI Gợi Ý Theo Sở Thích Khách:</span>
                        </div>
                        <div className="space-y-1.5">
                          {vis.recommendedTrips.map((rt, rtIdx) => (
                            <div key={`${rt.tripId}-${rtIdx}`} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-white/5 text-xs">
                              <div>
                                <span className="font-bold text-white">{rt.route}</span>
                                <span className="text-slate-400 ml-2">({rt.departureTime})</span>
                              </div>
                              <span className="font-mono font-bold text-emerald-400">{rt.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tab Switcher: PageViews vs Actions */}
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => setDrawerTab('PAGEVIEWS')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          drawerTab === 'PAGEVIEWS' ? 'bg-emerald-500/20 text-emerald-300 font-black' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Trang Đã Xem ({drawerDetail.pageViews.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerTab('ACTIONS')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          drawerTab === 'ACTIONS' ? 'bg-purple-500/20 text-purple-300 font-black' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Thao Tác Realtime ({drawerDetail.actions.length})
                      </button>
                    </div>

                    {/* PageViews List */}
                    {drawerTab === 'PAGEVIEWS' && (
                      <div className="space-y-2">
                        {drawerDetail.pageViews.map((pv, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white truncate max-w-[260px]">{pv.pageTitle || pv.pageUrl}</span>
                              <span className="font-mono text-[10px] text-slate-400">{pv.enteredAt}</span>
                            </div>
                            <div className="font-mono text-[11px] text-cyan-400 truncate">{pv.pageUrl}</div>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1 border-t border-white/5">
                              <span className="text-emerald-400">Tương tác: {pv.activeSeconds}s</span>
                              <span>Treo tab: {pv.idleSeconds}s</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions List */}
                    {drawerTab === 'ACTIONS' && (
                      <div className="space-y-2">
                        {drawerDetail.actions.map((act, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-purple-300 uppercase tracking-wider text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20">
                                {act.actionType}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">{act.createdAt}</span>
                            </div>
                            <div className="font-mono text-[11px] text-slate-300 break-all">{act.payload}</div>
                          </div>
                        ))}
                      </div>
                    )}

                  </>
                );
              })()}

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

