import React, { useState, useEffect } from 'react';
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
  Filter,
  CheckCircle2,
  AlertTriangle,
  Route
} from 'lucide-react';
import { 
  trackingService, 
  type TrackingAnalyticsResponse, 
  type CustomerJourneyTimelineDto, 
  type RecentSessionDto,
  type JourneyClusterDto 
} from '../../../services/tracking.service';
import toast from 'react-hot-toast';

export const UserBehaviorAnalytics: React.FC = () => {
  const formatPersonaLabel = (persona: string | undefined) => {
    switch (persona) {
      case 'COMMUTER_HABIT': return 'Thường Lệ (TP.HCM ⇌ Phú Yên)';
      case 'LUXURY_VIP': return 'VIP Limousine';
      case 'BUDGET_SAVING': return 'Tiết Kiệm';
      case 'WEEKEND_EXPLORER': return 'Phượt / Du Lịch';
      case 'STUDENT_SAVER': return 'Sinh Viên';
      case 'BUSINESS_FREQUENT': return 'Công Tác';
      case 'POPULAR_TRENDING': return 'Phổ Biến';
      default: return persona || 'Khách tìm chuyến nhanh';
    }
  };

  const [searchParams] = useSearchParams();
  const [analytics, setAnalytics] = useState<TrackingAnalyticsResponse | null>(null);
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
      setAnalytics(data);

      const queryId = searchParams.get('id');
      if (queryId) {
        setActiveTab('JOURNEY');
        loadJourney(queryId);
      } else if (!selectedJourney && data?.recentSessions && data.recentSessions.length > 0) {
        loadJourney(data.recentSessions[0].anonymousId || data.recentSessions[0].ipAddress);
      }
    } catch (err: any) {
      toast.error('Không thể tải dữ liệu thống kê hành vi: ' + (err.message || 'Lỗi server'));
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
      setSelectedJourney(data);
      if (data?.journeys && data.journeys.length > 0) {
        setSelectedClusterId(data.journeys[0].journeyId);
      } else {
        setSelectedClusterId('ALL');
      }
    } catch (err: any) {
      toast.error('Lỗi khi tải dòng thời gian hành vi: ' + (err.message || 'Lỗi server'));
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

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-10 bg-gray-200 rounded-xl w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-100 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-1.5">
            <Activity size={13} className="text-blue-600 animate-pulse" />
            <span>Real-time Behavior & Customer Journey Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Theo Dõi Hành Vi Khách Hàng (A - Z)
          </h1>
          <p className="text-sm text-gray-500 font-light mt-0.5">
            Truy vết nguồn vào, IP, thời gian dừng trên từng nội dung, chuyển trang qua nút nào và gợi ý AI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'OVERVIEW' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Tổng quan lưu lượng
            </button>
            <button
              onClick={() => setActiveTab('JOURNEY')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'JOURNEY' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Chi tiết hành trình A - Z
            </button>
          </div>

          <button
            onClick={() => { setRefreshing(true); fetchAnalytics(); }}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tổng Số Phiên</span>
            <Globe size={18} className="text-blue-500" />
          </div>
          <div className="text-3xl font-black text-gray-900 font-mono">
            {analytics?.totalSessions || 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Được ghi nhận từ máy khách</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Khách Duy Nhất (IP/Anon)</span>
            <Users size={18} className="text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600 font-mono">
            {analytics?.uniqueVisitors || 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Dựa trên AnonymousId & IP Address</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Thời Gian TB / Phiên</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 font-mono">
            {formatSeconds(Math.round(analytics?.avgSessionDurationSeconds || 0))}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Trừ thời gian treo tab &gt; 5 phút</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tương Tác Real-time</span>
            <MousePointerClick size={18} className="text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-indigo-600 font-mono">
            {Object.values(analytics?.actionBreakdown || {}).reduce((a, b) => a + b, 0)}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Sự kiện click, search, chọn ghế</p>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          
          {/* Traffic Sources & Action Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Traffic Sources */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Globe size={18} className="text-blue-500" />
                <span>Nguồn Lưu Lượng Truy Cập (Traffic Sources)</span>
              </h3>
              
              <div className="space-y-3 pt-2">
                {Object.entries(analytics?.trafficSources || {}).map(([source, count]) => {
                  const total = analytics?.totalSessions || 1;
                  const percent = Math.round((Number(count) / total) * 100);
                  return (
                    <div key={source} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-gray-700">
                        <span className="capitalize">{source}</span>
                        <span className="font-mono text-gray-500">{count} lượt ({percent}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions Breakdown */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <MousePointerClick size={18} className="text-indigo-500" />
                <span>Phân Bổ Tương Tác Hành Vi</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {Object.entries(analytics?.actionBreakdown || {}).map(([action, count]) => (
                  <div key={action} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="text-[11px] font-mono text-gray-500 truncate" title={action}>
                      {action}
                    </div>
                    <div className="text-xl font-bold text-gray-900 font-mono mt-1">
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Top Pages with Active vs Idle Dwell Time */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Eye size={18} className="text-cyan-600" />
              <span>Thời Gian Xem & Treo Tab Theo Trang (Active vs Idle Dwell Time)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Đường dẫn trang</th>
                    <th className="py-3 px-4">Lượt xem (PageViews)</th>
                    <th className="py-3 px-4">Thời gian tương tác (Active)</th>
                    <th className="py-3 px-4">Thời gian treo tab (Idle)</th>
                    <th className="py-3 px-4">Tỷ lệ tương tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {analytics?.topPages.map((page, idx) => {
                    const totalDwell = page.avgActiveSeconds + page.avgIdleSeconds;
                    const activeRatio = totalDwell > 0 ? Math.round((page.avgActiveSeconds / totalDwell) * 100) : 100;

                    return (
                      <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">{page.pageUrl}</td>
                        <td className="py-3 px-4 font-mono">{page.viewCount}</td>
                        <td className="py-3 px-4 font-mono text-emerald-600 font-bold">{page.avgActiveSeconds}s</td>
                        <td className="py-3 px-4 font-mono text-gray-400">{page.avgIdleSeconds}s</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            activeRatio >= 70 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
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

          {/* Recent Visitors Table with Quick Journey Inspection */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-purple-600" />
                <span>Phiên Truy Cập Gần Đây (Nhấp để xem dòng thời gian A - Z)</span>
              </div>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Khách hàng / Anonymous ID</th>
                    <th className="py-3 px-4">Địa chỉ IP</th>
                    <th className="py-3 px-4">Nguồn vào</th>
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-4">Lượt xem & tương tác</th>
                    <th className="py-3 px-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {analytics?.recentSessions.map((s) => (
                    <tr key={s.sessionId} className="hover:bg-blue-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-gray-900">
                        {s.customerId ? (
                          <span className="text-blue-600 font-bold">Khách #{s.customerId.substring(0, 8)}</span>
                        ) : (
                          <span className="text-gray-600">{s.anonymousId}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-500">{s.ipAddress}</td>
                      <td className="py-3 px-4">
                        <span className="capitalize px-2 py-0.5 rounded bg-gray-100 text-[11px] font-medium text-gray-700">
                          {s.trafficSource}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-500">{s.createdAt}</td>
                      <td className="py-3 px-4 font-mono text-gray-600">
                        {s.pageViewCount} trang • {s.actionCount} clicks
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setActiveTab('JOURNEY');
                            loadJourney(s.anonymousId || s.ipAddress);
                          }}
                          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Xem hành trình A-Z
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
          <form onSubmit={handleManualSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                value={searchIdentifier}
                onChange={(e) => setSearchIdentifier(e.target.value)}
                placeholder="Nhập IP (14.161.22.88), Anonymous ID (anon-xxx), hoặc Email/Customer ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loadingJourney}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Search size={15} />
              <span>Tra cứu hành trình</span>
            </button>
          </form>

          {/* Journey Header Profile Card */}
          {selectedJourney && (() => {
            const isRegistered = Boolean(selectedJourney.isRegisteredCustomer || (selectedJourney as any).registeredCustomer);
            const journeysList: JourneyClusterDto[] = selectedJourney.journeys || [];
            const activeCluster = journeysList.find(j => j.journeyId === selectedClusterId);
            const displayEvents = (selectedClusterId === 'ALL' || !activeCluster)
              ? selectedJourney.events
              : activeCluster.events;

            return (
              <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6">
                
                {/* 1. Customer Identity Stitching Banner */}
                {isRegistered ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-indigo-500/10 border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                        <ShieldCheck size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">Hồ Sơ Khách Hàng Có Tài Khoản</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Identity Stitched
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Họ tên: <strong className="text-gray-900">{selectedJourney.customerName}</strong> • Email: <strong className="text-gray-900">{selectedJourney.customerEmail}</strong>
                          {selectedJourney.linkedAnonymousIds && selectedJourney.linkedAnonymousIds.length > 0 && (
                            <span className="text-gray-500 ml-2">
                              (Đã xâu chuỗi {selectedJourney.linkedAnonymousIds.length} phiên thiết bị vãng lai trước khi đăng nhập)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      Định danh UUID: {selectedJourney.identifier}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
                      <Compass size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">Khách Vãng Lai (Chưa Đăng Nhập)</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Guest Tracking
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Đang theo dõi theo Anonymous Fingerprint & IP ({selectedJourney.identifier}). Ngay khi khách đăng nhập hoặc đặt vé, toàn bộ lịch sử này sẽ tự động gộp vào tài khoản khách!
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Overview Stats & Persona */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                      <User size={22} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedJourney.customerName}</h2>
                      <p className="text-xs text-gray-500 font-mono">Định danh: {selectedJourney.identifier}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold flex items-center gap-1.5">
                      <Sparkles size={13} className="text-purple-600" />
                      <span>Gu AI gán: <strong>{formatPersonaLabel(selectedJourney.matchedPersona)}</strong></span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                      {selectedJourney.totalSessions} phiên • {selectedJourney.totalPageViews} trang • {selectedJourney.totalActions} tương tác
                    </div>
                  </div>
                </div>

                {/* 3. Journey Selector (Intent-Aware Dynamic Segmentation) */}
                {journeysList.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        <Route size={16} className="text-blue-600" />
                        <span>Các Hành Trình Đã Phân Đoạn (Intent-Aware Dynamic Journeys):</span>
                      </h3>
                      <span className="text-xs text-gray-500">
                        Tìm thấy <strong>{journeysList.length}</strong> hành trình riêng biệt
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedClusterId('ALL')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedClusterId === 'ALL'
                            ? 'bg-gray-900 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                                : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-400'
                            }`}
                          >
                            {isConv ? (
                              <CheckCircle2 size={14} className={isSelected ? 'text-white' : 'text-emerald-500'} />
                            ) : isAban ? (
                              <AlertTriangle size={14} className={isSelected ? 'text-white' : 'text-amber-500'} />
                            ) : (
                              <Clock size={14} className={isSelected ? 'text-white' : 'text-cyan-500'} />
                            )}
                            <span>{j.title}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              isSelected 
                                ? 'bg-white/20 text-white' 
                                : isConv 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : isAban 
                                    ? 'bg-amber-100 text-amber-800' 
                                    : 'bg-cyan-100 text-cyan-800'
                            }`}>
                              {isConv ? 'Đã chốt vé' : isAban ? 'Bỏ rơi' : 'Đang tìm'}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Selected Journey Cluster Deep-dive Info Box */}
                    {activeCluster && (
                      <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-gray-500 block text-[11px]">Chặng xe mục tiêu:</span>
                          <span className="font-bold text-gray-900 text-sm flex items-center gap-1 mt-0.5">
                            <MapPin size={13} className="text-red-500" />
                            {activeCluster.targetRoute}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[11px]">Trạng thái hành trình:</span>
                          <span className={`font-bold inline-block px-2 py-0.5 rounded text-[11px] mt-1 ${
                            activeCluster.status === 'CONVERTED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : activeCluster.status === 'ABANDONED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-cyan-100 text-cyan-800'
                          }`}>
                            {activeCluster.status === 'CONVERTED' ? '✅ Chuyển đổi thành công' : activeCluster.status === 'ABANDONED' ? '⚠️ Bỏ rơi giỏ hàng' : '⏳ Đang tương tác'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[11px]">Nguồn vào ban đầu:</span>
                          <span className="font-bold text-gray-900 capitalize block mt-1">
                            {activeCluster.trafficSource}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[11px]">Thời lượng & Dwell:</span>
                          <span className="font-mono text-gray-900 block mt-1">
                            <strong>{activeCluster.durationMinutes}m</strong> ({activeCluster.activeSeconds}s tích cực / {activeCluster.idleSeconds}s treo tab)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Chronological Timeline */}
                <div className="pt-2">
                  <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center justify-between">
                    <span>
                      {selectedClusterId === 'ALL'
                        ? 'Dòng thời gian sự kiện trọn đời (A - Z):'
                        : `Dòng thời gian chi tiết cho ${activeCluster?.title || 'Hành trình'}:`}
                    </span>
                    <span className="text-xs text-gray-500 font-normal">
                      Hiển thị <strong>{displayEvents.length}</strong> sự kiện
                    </span>
                  </h3>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                    {displayEvents.map((evt, eIdx) => {
                      const isSession = evt.type === 'SESSION_START';
                      const isPageView = evt.type === 'PAGE_VIEW';

                      return (
                        <div key={eIdx} className="relative group">
                          {/* Dot on line */}
                          <div className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-white ring-2 ring-gray-100 ${
                            isSession ? 'bg-blue-600 ring-blue-100' : isPageView ? 'bg-emerald-500 ring-emerald-100' : 'bg-purple-600 ring-purple-100'
                          }`} />

                          {/* Event Card */}
                          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className={`font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded ${
                                isSession ? 'bg-blue-100 text-blue-700' : isPageView ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
                              }`}>
                                {evt.type}
                              </span>
                              <span className="font-mono text-gray-400 text-[11px]">{evt.timestamp}</span>
                            </div>

                            <div className="font-bold text-gray-900 text-sm">
                              {evt.title}
                            </div>

                            <div className="text-xs text-gray-600 font-mono">
                              {evt.description}
                            </div>

                            {(((evt.activeSeconds || 0) > 0) || ((evt.idleSeconds || 0) > 0)) && (
                              <div className="flex items-center gap-3 text-[11px] text-gray-500 pt-1">
                                <span className="text-emerald-600 font-semibold">Tương tác: {evt.activeSeconds || 0}s</span>
                                {(evt.idleSeconds || 0) > 0 && <span className="text-gray-400">Treo tab: {evt.idleSeconds}s</span>}
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
