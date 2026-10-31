import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Activity, 
  Users, 
  Clock, 
  Search, 
  MapPin, 
  Sparkles, 
  Compass, 
  Globe, 
  Eye, 
  MousePointerClick, 
  ArrowRight, 
  Calendar,
  Layers,
  ShieldCheck,
  RefreshCw,
  User,
  CheckCircle2,
  AlertTriangle,
  Route,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { 
  trackingService, 
  type TrackingAnalyticsResponse, 
  type CustomerJourneyTimelineDto, 
  type RecentSessionDto,
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

export const UserBehaviorAnalytics: React.FC = () => {
  const formatPersonaLabel = (persona: string | undefined) => {
    switch (persona) {
      case 'COMMUTER_HABIT': return 'Thường Lệ (Sài Gòn ⇌ Phú Yên)';
      case 'DALAT_LIMOUSINE':
      case 'LUXURY_VIP': return 'VIP Limousine';
      case 'BUDGET_SAVER':
      case 'BUDGET_SAVING': return 'Tiết Kiệm';
      case 'NHATRANG_FAMILY':
      case 'WEEKEND_EXPLORER': return 'Du Lịch Biển';
      case 'STUDENT_SAVER': return 'Sinh Viên';
      case 'BUSINESS_FREQUENT': return 'Công Tác';
      case 'POPULAR_TRENDING': return 'Phổ Biến';
      default: return persona || 'Khách tìm chuyến nhanh';
    }
  };

  const [searchParams] = useSearchParams();
  const [analytics, setAnalytics] = useState<TrackingAnalyticsResponse>(EMPTY_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Journey Explorer State
  const [searchIdentifier, setSearchIdentifier] = useState('');
  const [selectedJourney, setSelectedJourney] = useState<CustomerJourneyTimelineDto | null>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<string>('ALL');
  const [loadingJourney, setLoadingJourney] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'JOURNEY'>('OVERVIEW');

  const fetchAnalytics = async () => {
    try {
      const data = await trackingService.getAnalyticsOverview();
      if (data) {
        setAnalytics(data);
      }
      const queryId = searchParams.get('id');
      if (queryId) {
        setActiveTab('JOURNEY');
        loadJourney(queryId);
      }
    } catch (err) {
      console.error('Failed to load tracking analytics', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadJourney = async (identifier: string) => {
    if (!identifier.trim()) return;
    setLoadingJourney(true);
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
      console.error('Failed to load customer journey', err);
      setSelectedJourney(null);
    } finally {
      setLoadingJourney(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchIdentifier.trim()) {
      setActiveTab('JOURNEY');
      loadJourney(searchIdentifier.trim());
    }
  };

  const formatSeconds = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}m ${s}s`;
  };

  // Safe analytics data
  const safeData = analytics || EMPTY_ANALYTICS;

  return (
    <div className="space-y-6">
      
      {/* Top Cyber Command Header */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold mb-2">
            <Activity size={12} className="text-cyan-400 animate-pulse" />
            <span>AI Realtime Behavior & Journey Analytics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Phân Tích Hành Vi & Chân Dung Khách Hàng
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Truy vết nguồn vào, IP, thời gian dừng trên từng nội dung, chuyển trang qua nút nào và gợi ý AI.
          </p>
        </div>

        {/* Tab switcher & refresh */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'OVERVIEW' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tổng Quan Lưu Lượng
            </button>
            <button
              onClick={() => setActiveTab('JOURNEY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'JOURNEY' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hành Trình A - Z
            </button>
          </div>

          <button
            onClick={() => { setRefreshing(true); fetchAnalytics(); }}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-950 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 4 Cyber-Slate KPI Cards: 2 cols on laptop 1024, 4 cols on desktop xl */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between h-[88px]">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap">Tổng Số Phiên</div>
            <div className="text-2xl font-black text-white mt-1 font-mono">
              {safeData.totalSessions} Phiên
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Globe size={20} />
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between h-[88px]">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap">Khách Định Danh</div>
            <div className="text-2xl font-black text-emerald-300 mt-1 font-mono">
              {safeData.uniqueVisitors} Khách
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Users size={20} />
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between h-[88px]">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap">Thời Gian Dừng TB</div>
            <div className="text-2xl font-black text-amber-300 mt-1 font-mono">
              {formatSeconds(Math.round(safeData.avgSessionDurationSeconds || 0))}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Clock size={20} />
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between h-[88px]">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap">Tương Tác Realtime</div>
            <div className="text-2xl font-black text-purple-300 mt-1 font-mono">
              {Object.values(safeData.actionBreakdown || {}).reduce((a, b) => a + b, 0)} Event
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <MousePointerClick size={20} />
          </div>
        </div>

      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          
          {/* Traffic Sources & Action Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Traffic Sources */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 h-6 whitespace-nowrap">
                <Globe size={16} className="text-cyan-400 shrink-0" />
                <span>Nguồn Lưu Lượng (Traffic)</span>
              </h3>
              
              <div className="space-y-3 pt-1">
                {Object.entries(safeData.trafficSources || {}).map(([source, count]) => {
                  const total = safeData.totalSessions || 1;
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
              <h3 className="font-bold text-white text-sm flex items-center gap-2 h-6 whitespace-nowrap">
                <MousePointerClick size={16} className="text-purple-400 shrink-0" />
                <span>Phân Bổ Tương Tác (Actions)</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {Object.entries(safeData.actionBreakdown || {}).map(([action, count]) => (
                  <div key={action} className="p-3 rounded-xl bg-slate-950/80 border border-white/5">
                    <div className="text-[11px] font-mono text-slate-400 h-4 leading-4 truncate" title={action}>
                      {action}
                    </div>
                    <div className="text-xl font-bold text-purple-300 font-mono mt-1">
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Top Pages with Active vs Idle Dwell Time */}
          <div className="rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-2">
              <Eye size={16} className="text-cyan-400" />
              <h3 className="font-bold text-white text-sm">
                Thời Gian Xem & Treo Tab Theo Trang (Active vs Idle Dwell Time)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-white/10">
                  <tr>
                    <th className="py-2 px-2.5 sm:px-3 whitespace-nowrap">Đường dẫn trang</th>
                    <th className="py-2 px-2.5 sm:px-3 whitespace-nowrap">Lượt xem (Views)</th>
                    <th className="py-2 px-2.5 sm:px-3 whitespace-nowrap">Tương tác (Active)</th>
                    <th className="py-2 px-2.5 sm:px-3 whitespace-nowrap">Treo tab (Idle)</th>
                    <th className="py-2 px-2.5 sm:px-3 whitespace-nowrap">Tỷ lệ tương tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {safeData.topPages.map((page, idx) => {
                    const totalDwell = page.avgActiveSeconds + page.avgIdleSeconds;
                    const activeRatio = totalDwell > 0 ? Math.round((page.avgActiveSeconds / totalDwell) * 100) : 100;

                    return (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2 px-2.5 sm:px-3">
                          <span className="font-mono font-bold text-cyan-300 truncate max-w-[170px] block" title={page.pageUrl}>
                            {page.pageUrl}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 sm:px-3 font-mono text-white whitespace-nowrap">{page.viewCount}</td>
                        <td className="py-2 px-2.5 sm:px-3 font-mono text-emerald-300 font-bold whitespace-nowrap">{page.avgActiveSeconds}s</td>
                        <td className="py-2 px-2.5 sm:px-3 font-mono text-slate-400 whitespace-nowrap">{page.avgIdleSeconds}s</td>
                        <td className="py-2 px-2.5 sm:px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                            activeRatio >= 70 ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}>
                            {activeRatio}% tích cực
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Visitors Table (4 High-Density Columns) */}
          <div className="rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-purple-400" />
                <h3 className="font-bold text-white text-sm">
                  Phiên Truy Cập Gần Đây (Nhấp để xem hành trình A - Z)
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-white/10">
                  <tr>
                    <th className="py-2 px-2.5 sm:px-3 whitespace-nowrap w-[32%]">Khách Hàng & IP</th>
                    <th className="py-2 px-2.5 sm:px-3 whitespace-nowrap w-[28%]">Nguồn & Thời Gian</th>
                    <th className="py-2 px-2.5 sm:px-3 whitespace-nowrap w-[24%]">Lượt Xem & Tương Tác</th>
                    <th className="py-2 px-2.5 sm:px-3 whitespace-nowrap text-right w-[16%]">Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {safeData.recentSessions.map((s) => (
                    <tr key={s.sessionId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2 px-2.5 sm:px-3">
                        <div className="min-w-0">
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
                        </div>
                      </td>
                      <td className="py-2 px-2.5 sm:px-3">
                        <div className="min-w-0">
                          <span className="capitalize px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-medium text-slate-300 whitespace-nowrap">
                            {s.trafficSource}
                          </span>
                          <div className="font-mono text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">
                            {s.createdAt}
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-2.5 sm:px-3 font-mono text-slate-300 whitespace-nowrap">
                        {s.pageViewCount} trang • {s.actionCount} clicks
                      </td>
                      <td className="py-2 px-2.5 sm:px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setActiveTab('JOURNEY');
                            loadJourney(s.anonymousId || s.ipAddress);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-[11px] transition-colors whitespace-nowrap cursor-pointer"
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

      {/* TAB 2: DETAILED CUSTOMER JOURNEY TIMELINE (A - Z) */}
      {activeTab === 'JOURNEY' && (
        <div className="space-y-6">
          
          {/* Search Journey Form */}
          <form onSubmit={handleManualSearch} className="flex flex-wrap sm:flex-nowrap gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input 
                type="text"
                value={searchIdentifier}
                onChange={(e) => setSearchIdentifier(e.target.value)}
                placeholder="Nhập IP, Anonymous ID, hoặc Email..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loadingJourney}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-500/20 whitespace-nowrap cursor-pointer shrink-0"
            >
              <Search size={13} />
              <span>Tra cứu hành trình</span>
            </button>
          </form>

          {loadingJourney && (
            <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
              <Activity size={32} className="animate-spin text-cyan-400 mx-auto mb-3" />
              <p className="text-xs text-slate-300">Đang truy vấn và xâu chuỗi hành trình khách hàng từ máy chủ...</p>
            </div>
          )}

          {!selectedJourney && !loadingJourney && (
            <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
              <Users size={36} className="text-slate-500 mx-auto mb-3" />
              <h3 className="text-white font-bold text-sm">Chưa có hành trình nào được chọn</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Nhập Email, Anonymous ID, hoặc bấm nút &quot;Xem A-Z&quot; từ danh sách khách ở tab Tổng Quan để truy vết toàn bộ hành trình.
              </p>
            </div>
          )}

          {/* Journey Header Profile Card */}
          {selectedJourney && (() => {
            const isRegistered = Boolean(selectedJourney.isRegisteredCustomer || (selectedJourney as any).registeredCustomer);
            const journeysList: JourneyClusterDto[] = selectedJourney.journeys || [];
            const activeCluster = journeysList.find(j => j.journeyId === selectedClusterId);
            const displayEvents = (selectedClusterId === 'ALL' || !activeCluster)
              ? selectedJourney.events
              : activeCluster.events;

            return (
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-2xl space-y-5">
                
                {/* 1. Customer Identity Stitching Banner */}
                {isRegistered ? (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <ShieldCheck size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">Hồ Sơ Khách Hàng Có Tài Khoản</span>
                          <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                            Identity Stitched
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5 truncate">
                          Họ tên: <strong className="text-white">{selectedJourney.customerName}</strong> • Email: <strong className="text-cyan-300">{selectedJourney.customerEmail}</strong>
                          {selectedJourney.linkedAnonymousIds && selectedJourney.linkedAnonymousIds.length > 0 && (
                            <span className="text-slate-400 ml-2">
                              (Đã xâu chuỗi {selectedJourney.linkedAnonymousIds.length} phiên thiết bị vãng lai trước khi đăng nhập)
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
                        Đang theo dõi theo Anonymous Fingerprint & IP ({selectedJourney.identifier}). Ngay khi khách đăng nhập hoặc đặt vé, toàn bộ lịch sử này sẽ tự động gộp vào tài khoản khách!
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Overview Stats & Persona */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center font-bold text-base shrink-0">
                      <User size={18} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-white truncate">{selectedJourney.customerName}</h2>
                      <p className="text-xs text-slate-400 font-mono truncate">Định danh: {selectedJourney.identifier}</p>
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
                        <span>Các Hành Trình Đã Phân Đoạn (Dynamic Journeys):</span>
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
                            : 'bg-slate-950 border border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        Tất cả sự kiện ({selectedJourney.events.length})
                      </button>

                      {journeysList.map((j) => {
                        const isSelected = selectedClusterId === j.journeyId;
                        const isConv = j.status === 'CONVERTED';
                        const isAban = j.status === 'ABANDONED';
                        return (
                          <button
                            key={j.journeyId}
                            type="button"
                            onClick={() => setSelectedClusterId(j.journeyId)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                              isSelected
                                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                                : 'bg-slate-950 border border-white/10 text-slate-300 hover:text-white'
                            }`}
                          >
                            {isConv ? (
                              <CheckCircle2 size={13} className={isSelected ? 'text-slate-950' : 'text-emerald-400'} />
                            ) : isAban ? (
                              <AlertTriangle size={13} className={isSelected ? 'text-slate-950' : 'text-amber-400'} />
                            ) : (
                              <Clock size={13} className={isSelected ? 'text-slate-950' : 'text-cyan-400'} />
                            )}
                            <span className="truncate max-w-[200px]">{j.title}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                              isSelected 
                                ? 'bg-slate-950/30 text-slate-950' 
                                : isConv 
                                  ? 'bg-emerald-500/20 text-emerald-300' 
                                  : isAban 
                                    ? 'bg-amber-500/20 text-amber-300' 
                                    : 'bg-cyan-500/20 text-cyan-300'
                            }`}>
                              {isConv ? 'Chốt vé' : isAban ? 'Bỏ rơi' : 'Đang tìm'}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Selected Journey Cluster Info Box */}
                    {activeCluster && (
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Chặng xe mục tiêu:</span>
                          <span className="font-bold text-white text-xs flex items-center gap-1 mt-0.5">
                            <MapPin size={12} className="text-rose-400 shrink-0" />
                            <span className="truncate">{activeCluster.targetRoute}</span>
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Trạng thái:</span>
                          <span className={`font-bold inline-block px-2 py-0.2 rounded text-[10px] mt-0.5 whitespace-nowrap ${
                            activeCluster.status === 'CONVERTED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : activeCluster.status === 'ABANDONED'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            {activeCluster.status === 'CONVERTED' ? '✅ Chốt vé thành công' : activeCluster.status === 'ABANDONED' ? '⚠️ Bỏ rơi giỏ hàng' : '⏳ Đang tương tác'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Nguồn vào ban đầu:</span>
                          <span className="font-bold text-white capitalize block mt-0.5 truncate">
                            {activeCluster.trafficSource}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Thời lượng & Dwell:</span>
                          <span className="font-mono text-cyan-300 block mt-0.5 whitespace-nowrap">
                            <strong>{activeCluster.durationMinutes}m</strong> ({activeCluster.activeSeconds}s Active)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Chronological Timeline */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white text-xs sm:text-sm">
                      {selectedClusterId === 'ALL'
                        ? 'Dòng thời gian sự kiện trọn đời (A - Z):'
                        : `Dòng thời gian chi tiết cho ${activeCluster?.title || 'Hành trình'}:`}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      {displayEvents.length} sự kiện
                    </span>
                  </div>

                  <div className="relative pl-5 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                    {displayEvents.map((evt, eIdx) => {
                      const isSession = evt.type === 'SESSION_START';
                      const isPageView = evt.type === 'PAGE_VIEW';

                      return (
                        <div key={eIdx} className="relative group">
                          {/* Dot on line */}
                          <div className={`absolute -left-5 top-2 w-2.5 h-2.5 rounded-full border border-slate-950 ${
                            isSession ? 'bg-cyan-400 ring-2 ring-cyan-500/30' : isPageView ? 'bg-emerald-400 ring-2 ring-emerald-500/30' : 'bg-purple-400 ring-2 ring-purple-500/30'
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

    </div>
  );
};
