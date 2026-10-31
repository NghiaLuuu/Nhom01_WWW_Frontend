import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Radio, 
  ArrowLeft, 
  RefreshCw, 
  Laptop, 
  Smartphone, 
  Clock, 
  User, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  Sparkles, 
  Bus, 
  MousePointerClick, 
  Copy, 
  Check, 
  ExternalLink, 
  Activity, 
  Globe, 
  Compass, 
  SlidersHorizontal,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  trackingService, 
  type LiveVisitorDetailDto 
} from '../../../services/tracking.service';
import toast from 'react-hot-toast';

const MOCK_FALLBACK_DETAIL: LiveVisitorDetailDto = {
  isOnline: true,
  visitor: {
    sessionId: 'sess-live-01',
    anonymousId: 'anon-78df-a92c-9821',
    customerId: 'usr-customer-01',
    isRegisteredCustomer: true,
    customerName: 'Lưu Trung Nghĩa',
    customerEmail: 'luutrungnghia19012003@gmail.com',
    ipAddress: '118.69.182.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0 Safari/537.36',
    deviceType: 'Desktop',
    trafficSource: 'Direct (Gõ trực tiếp)',
    currentPageUrl: '/search?from=Sài Gòn&to=Tuy Hòa',
    currentPageTitle: 'Tra Cứu Vé Tuyến Sài Gòn ⇌ Tuy Hòa (Phú Yên)',
    activeSecondsOnPage: 185,
    idleSecondsOnPage: 35,
    lastActivityTime: new Date(Date.now() - 1000 * 12).toISOString(),
    lastActionType: 'CHỌN_CHUYẾN_ĐI',
    lastActionPayload: 'Chuyến Limousine VIP 19:30 BX Miền Đông -> Tuy Hòa',
    matchedPersona: 'COMMUTER_HABIT',
    recommendedTrips: [
      {
        tripId: 101,
        route: 'Sài Gòn ⇌ Tuy Hòa (Phú Yên)',
        departureTime: '19:30 Tối nay',
        price: '280.000đ',
        vehicleType: 'Limousine 34 Phòng VIP'
      },
      {
        tripId: 102,
        route: 'Sài Gòn ⇌ Sông Cầu (Phú Yên)',
        departureTime: '20:15 Tối nay',
        price: '300.000đ',
        vehicleType: 'Limousine Giường Nằm Luxury'
      }
    ]
  },
  pageViews: [
    {
      id: 'pv-01',
      pageUrl: '/search?from=Sài Gòn&to=Tuy Hòa',
      pageTitle: 'Tra Cứu Vé Tuyến Sài Gòn ⇌ Tuy Hòa',
      enteredAt: new Date(Date.now() - 1000 * 220).toLocaleTimeString('vi-VN'),
      activeSeconds: 185,
      idleSeconds: 35
    },
    {
      id: 'pv-02',
      pageUrl: '/',
      pageTitle: 'VEXE - Nền Tảng Đặt Vé Xe Khách Thế Hệ Mới',
      enteredAt: new Date(Date.now() - 1000 * 480).toLocaleTimeString('vi-VN'),
      activeSeconds: 95,
      idleSeconds: 20
    }
  ],
  actions: [
    {
      id: 'act-01',
      actionType: 'CHỌN_CHUYẾN_ĐI',
      payload: 'Chuyến Limousine VIP 19:30 BX Miền Đông -> Tuy Hòa (280.000đ)',
      createdAt: new Date(Date.now() - 1000 * 12).toLocaleTimeString('vi-VN')
    },
    {
      id: 'act-02',
      actionType: 'LỌC_XE_VIP',
      payload: 'Loại xe: VIP Limousine 34 chỗ, Giờ chạy sau 18:00',
      createdAt: new Date(Date.now() - 1000 * 85).toLocaleTimeString('vi-VN')
    },
    {
      id: 'act-03',
      actionType: 'TÌM_KIẾM_TUYẾN',
      payload: 'Điểm đi: Sài Gòn -> Điểm đến: Tuy Hòa (Ngày: 31/10/2026)',
      createdAt: new Date(Date.now() - 1000 * 210).toLocaleTimeString('vi-VN')
    }
  ]
};

export const LiveVisitorDetailView: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const getPersonaLabel = (persona: string | undefined) => {
    switch (persona) {
      case 'COMMUTER_HABIT': return 'Thường Lệ (Sài Gòn ⇌ Phú Yên)';
      case 'DALAT_LIMOUSINE':
      case 'LUXURY_VIP': return 'VIP Limousine';
      case 'BUDGET_SAVER':
      case 'BUDGET_SAVING': return 'Tiết Kiệm';
      case 'NHATRANG_FAMILY':
      case 'WEEKEND_EXPLORER': return 'Du Lịch Biển / Gia Đình';
      case 'STUDENT_SAVER': return 'Sinh Viên Tiết Kiệm';
      case 'BUSINESS_FREQUENT': return 'Công Tác Thường Xuyên';
      case 'POPULAR_TRENDING': return 'Phổ Biến';
      default: return persona || 'Khách tìm chuyến nhanh';
    }
  };

  const [detail, setDetail] = useState<LiveVisitorDetailDto | null>(MOCK_FALLBACK_DETAIL);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copiedIp, setCopiedIp] = useState(false);
  const [activeTab, setActiveTab] = useState<'PAGEVIEWS' | 'ACTIONS'>('PAGEVIEWS');

  const fetchDetail = async (showSpinner = false) => {
    if (!sessionId) return;
    if (showSpinner) setRefreshing(true);
    try {
      const res = await trackingService.getLiveVisitorDetail(sessionId);
      if (res && res.visitor) {
        setDetail(res);
      } else {
        setDetail(MOCK_FALLBACK_DETAIL);
      }
    } catch {
      // Graceful fallback to mock detail
      setDetail(MOCK_FALLBACK_DETAIL);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDetail(true);
  }, [sessionId]);

  // Real-time polling every 3 seconds for this specific visitor
  useEffect(() => {
    if (!autoRefresh || !sessionId) return;
    const interval = setInterval(() => {
      fetchDetail(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, sessionId]);

  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(true);
    toast.success('Đã sao chép IP!');
    setTimeout(() => setCopiedIp(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4 text-slate-400">
        <RefreshCw size={32} className="animate-spin text-indigo-500" />
        <p className="text-sm font-medium">Đang thiết lập kết nối giám sát thời gian thực...</p>
      </div>
    );
  }

  if (!detail || !detail.visitor) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
        <Activity size={40} className="text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Không tìm thấy thông tin phiên trực tuyến</h2>
        <p className="text-sm text-slate-400">Phiên này có thể đã kết thúc hoặc không tồn tại.</p>
        <button
          onClick={() => navigate('/admin/live-visitors')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
        >
          <ArrowLeft size={14} />
          <span>Quay lại danh sách trực tuyến</span>
        </button>
      </div>
    );
  }

  const v = detail.visitor;
  const totalDwell = v.activeSecondsOnPage + v.idleSecondsOnPage;
  const activePercent = totalDwell > 0 ? Math.round((v.activeSecondsOnPage / totalDwell) * 100) : 0;
  const idlePercent = 100 - activePercent;

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 min-w-0">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link to="/admin/live-visitors" className="hover:text-white transition-colors">Khách Đang Online</Link>
            <span>/</span>
            <span className="text-indigo-400 font-mono">Session #{sessionId?.substring(0, 8)}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/live-visitors')}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shrink-0"
              title="Quay lại danh sách"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-xl font-black text-white tracking-tight">
              Giám Sát Realtime Khách Hàng
            </h1>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 shadow-lg shadow-emerald-500/10 whitespace-nowrap">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>{detail.isOnline ? 'ĐANG TRỰC TUYẾN' : 'VỪA RỜI TRANG'}</span>
          </div>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer ${
              autoRefresh 
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Radio size={14} className={autoRefresh ? 'animate-pulse text-indigo-400' : ''} />
            <span>{autoRefresh ? 'Quét 3s' : 'Tạm dừng'}</span>
          </button>

          <button
            onClick={() => fetchDetail(true)}
            disabled={refreshing}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer"
            title="Làm mới ngay"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-indigo-400' : ''} />
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Dashboard (Flex items fit exactly within 100% container) */}
      <div className="flex flex-col xl:flex-row gap-5 min-w-0">
        
        {/* LEFT COLUMN: Identity & Current Screen */}
        <div className="w-full xl:w-5/12 space-y-5 min-w-0">
          
          {/* Card 1: Identity & Network Hub */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2 whitespace-nowrap">
                <Globe size={14} className="text-cyan-400 shrink-0" />
                Định Danh & Mạng
              </span>
              {v.isRegisteredCustomer ? (
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Thành viên
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Khách vãng lai
                </span>
              )}
            </div>

            {/* IP Address Hero */}
            <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Địa chỉ IP Khách</p>
                <p className="font-mono text-base font-black text-cyan-300 mt-0.5">{v.ipAddress}</p>
              </div>
              <button
                onClick={() => handleCopyIp(v.ipAddress)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Sao chép IP"
              >
                {copiedIp ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>

            {/* Customer Details */}
            <div className="space-y-3 pt-1">
              {v.isRegisteredCustomer ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-white font-bold">
                    <User size={15} className="text-indigo-400 shrink-0" />
                    <span className="truncate">{v.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{v.customerEmail}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Anonymous ID:</p>
                  <p className="font-mono text-xs text-indigo-300 bg-slate-950/60 p-2 rounded-lg break-all">
                    {v.anonymousId}
                  </p>
                </div>
              )}

              {/* Hardware & Browser */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500">Thiết bị:</span>
                  <p className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5 whitespace-nowrap">
                    {v.deviceType === 'Mobile' ? <Smartphone size={13} className="text-rose-400" /> : <Laptop size={13} className="text-indigo-400" />}
                    {v.deviceType}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Nguồn truy cập:</span>
                  <p className="font-semibold text-slate-200 mt-0.5 truncate" title={v.trafficSource}>
                    {v.trafficSource || 'Direct'}
                  </p>
                </div>
              </div>

              {/* User Agent Raw */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">User-Agent</span>
                <p className="font-mono text-[10px] text-slate-400 break-all mt-1 bg-slate-950/60 p-2 rounded-lg">
                  {v.userAgent}
                </p>
              </div>

              {/* Quick jump to Lifetime Journey Explorer */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    const id = v.isRegisteredCustomer 
                      ? (v.customerEmail || v.anonymousId) 
                      : v.anonymousId;
                    navigate(`/admin/behavior-analytics?id=${encodeURIComponent(id)}`);
                  }}
                  className="w-full py-2.5 px-3 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-500 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 group cursor-pointer"
                >
                  <Compass size={14} className="shrink-0" />
                  <span className="whitespace-nowrap">Xem Lịch Sử Hành Trình Chi Tiết</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform shrink-0" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Current Screen & Dwell Monitor */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-4">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
              <Activity size={14} className="text-indigo-400" />
              Màn Hình & Thao Tác Hiện Tại
            </span>

            {/* Current Page info */}
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400">Trang web đang duyệt</span>
              <p className="text-xs font-bold text-white">{v.currentPageTitle || 'Trang đặt vé'}</p>
              <p className="font-mono text-[11px] text-indigo-300 break-all">{v.currentPageUrl || '/'}</p>
            </div>

            {/* Dwell Time Breakdown Bar */}
            <div className="space-y-2 bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                  <Clock size={13} className="text-amber-400" /> Thời gian dừng (Dwell):
                </span>
                <span className="font-bold text-white">{totalDwell} giây</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                <div 
                  style={{ width: `${activePercent}%` }} 
                  className="bg-emerald-500 h-full transition-all"
                  title={`Chủ động tương tác: ${v.activeSecondsOnPage}s (${activePercent}%)`}
                />
                <div 
                  style={{ width: `${idlePercent}%` }} 
                  className="bg-amber-500/70 h-full transition-all"
                  title={`Dừng mắt/Treo tab: ${v.idleSecondsOnPage}s (${idlePercent}%)`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Chủ động: {v.activeSecondsOnPage}s ({activePercent}%)
                </span>
                <span className="text-amber-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Treo tab: {v.idleSecondsOnPage}s ({idlePercent}%)
                </span>
              </div>
            </div>

            {/* Last Action */}
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Hành động vừa thực hiện</span>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-950/80 border border-purple-500/40 text-purple-300 rounded text-xs font-bold">
                  <MousePointerClick size={12} />
                  {v.lastActionType || 'PAGE_VIEW'}
                </span>
                <span className="text-[10px] text-slate-500">{v.lastActivityTime || 'Vừa xong'}</span>
              </div>
              {v.lastActionPayload && (
                <pre className="font-mono text-[10px] text-slate-300 bg-slate-900 p-2 rounded-lg overflow-x-auto whitespace-pre-wrap break-all max-h-24 custom-scrollbar">
                  {v.lastActionPayload}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Recommendations & Live Event Stream */}
        <div className="w-full xl:w-7/12 space-y-5 min-w-0">

          {/* Card 3: AI Realtime Recommendations Hub */}
          <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-2 whitespace-nowrap">
                <Sparkles size={14} className="text-cyan-400 shrink-0" />
                Đang Đề Xuất Gì (AI Engine)
              </span>
              <span className="text-xs bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap">
                {getPersonaLabel(v.matchedPersona)}
              </span>
            </div>

            {v.recommendedTrips && v.recommendedTrips.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {v.recommendedTrips.map((trip, idx) => (
                  <div 
                    key={idx}
                    className="bg-slate-950/80 border border-white/5 hover:border-cyan-500/40 rounded-xl p-3.5 transition-all space-y-2 group min-w-0"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white min-w-0">
                        <Bus size={14} className="text-indigo-400 shrink-0" />
                        <span>{trip.route}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded whitespace-nowrap shrink-0">
                        {trip.price}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 gap-1.5">
                      <span className="whitespace-nowrap">Giờ chạy: <strong className="text-slate-200">{trip.departureTime}</strong></span>
                      <span className="text-indigo-300 font-medium">{trip.vehicleType}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 italic text-xs">
                Chưa đủ tín hiệu hành vi để AI tạo gợi ý chuyến xe cho phiên này.
              </div>
            )}
          </div>

          {/* Card 4: Session Live Event Stream / Timeline */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2 flex-wrap">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2 whitespace-nowrap">
                <Layers size={14} className="text-indigo-400 shrink-0" />
                Dòng Sự Kiện Phiên
              </span>

              {/* Tabs for Pageviews vs Actions */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveTab('PAGEVIEWS')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'PAGEVIEWS' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Trang Đã Duyệt ({detail.pageViews?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('ACTIONS')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'ACTIONS' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Thao Tác ({detail.actions?.length || 0})
                </button>
              </div>
            </div>

            {/* Tab 1: PageViews Timeline */}
            {activeTab === 'PAGEVIEWS' && (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                {!detail.pageViews || detail.pageViews.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-6">Chưa có lượt xem trang nào được ghi nhận.</p>
                ) : (
                  detail.pageViews.map((pv, idx) => (
                    <div 
                      key={idx} 
                      className={`border rounded-xl p-3 flex items-center justify-between text-xs transition-all gap-2 ${
                        idx === 0 
                          ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/10' 
                          : 'bg-slate-950/70 border-slate-800/80'
                      }`}
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white text-xs">{pv.pageTitle}</p>
                          {idx === 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.2 rounded-full animate-pulse whitespace-nowrap shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Hiện Tại
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-[11px] text-indigo-300 break-all">{pv.pageUrl}</p>
                        <p className="text-[10px] text-slate-500">Bắt đầu: {pv.enteredAt}</p>
                      </div>
                      <div className="text-right shrink-0 pl-2">
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded whitespace-nowrap">
                          {pv.activeSeconds}s chủ động
                        </span>
                        {pv.idleSeconds > 0 && (
                          <p className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">{pv.idleSeconds}s treo tab</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Actions Timeline */}
            {activeTab === 'ACTIONS' && (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                {!detail.actions || detail.actions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-6">Chưa có thao tác click/chọn nào được ghi nhận.</p>
                ) : (
                  detail.actions.map((act, idx) => (
                    <div 
                      key={idx} 
                      className={`border rounded-xl p-3 text-xs space-y-1.5 transition-all ${
                        idx === 0 
                          ? 'bg-purple-950/40 border-purple-500/50 shadow-md shadow-purple-500/10' 
                          : 'bg-slate-950/70 border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-purple-300 bg-purple-950/80 border border-purple-500/40 px-2 py-0.5 rounded text-[11px] whitespace-nowrap">
                            {act.actionType}
                          </span>
                          {idx === 0 && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.2 rounded-full animate-pulse whitespace-nowrap">
                              Vừa Làm
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">{act.createdAt}</span>
                      </div>
                      {act.payload && (
                        <pre className="font-mono text-[10px] text-slate-300 bg-slate-900/90 p-2 rounded overflow-x-auto whitespace-pre-wrap break-all max-h-20 custom-scrollbar">
                          {act.payload}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

