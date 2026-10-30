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

export const LiveVisitorDetailView: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const getPersonaLabel = (persona: string | undefined) => {
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

  const [detail, setDetail] = useState<LiveVisitorDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copiedIp, setCopiedIp] = useState(false);
  const [activeTab, setActiveTab] = useState<'PAGEVIEWS' | 'ACTIONS'>('PAGEVIEWS');

  const fetchDetail = async (showSpinner = false) => {
    if (!sessionId) return;
    if (showSpinner) setRefreshing(true);
    try {
      const res = await trackingService.getLiveVisitorDetail(sessionId);
      setDetail(res);
    } catch (err: any) {
      console.error('Error fetching live visitor detail:', err);
      if (showSpinner) {
        toast.error('Lỗi khi tải chi tiết khách trực tuyến: ' + (err.message || 'Lỗi server'));
      }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
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
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Quay lại danh sách"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              Phòng Giám Sát Realtime Khách Hàng
            </h1>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 shadow-lg shadow-emerald-500/10">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>{detail.isOnline ? 'ĐANG TRỰC TUYẾN' : 'VỪA RỜI TRANG'}</span>
          </div>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
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
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs transition-all disabled:opacity-50"
            title="Làm mới ngay"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-indigo-400' : ''} />
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Identity & Current Screen (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1: Identity & Network Hub */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
                <Globe size={14} className="text-cyan-400" />
                Định Danh & Hạ Tầng Mạng
              </span>
              {v.isRegisteredCustomer ? (
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  Thành viên đã xác thực
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-full">
                  Khách vãng lai
                </span>
              )}
            </div>

            {/* IP Address Hero */}
            <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Địa chỉ IP Khách (Bắt buộc)</p>
                <p className="font-mono text-base font-black text-cyan-300 mt-0.5">{v.ipAddress}</p>
              </div>
              <button
                onClick={() => handleCopyIp(v.ipAddress)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
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
                    <User size={15} className="text-indigo-400" />
                    <span>{v.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Mail size={14} className="text-slate-400" />
                    <span>{v.customerEmail}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Anonymous ID (Lưu vĩnh viễn):</p>
                  <p className="font-mono text-xs text-indigo-300 bg-slate-950/60 p-2 rounded-lg break-all">
                    {v.anonymousId}
                  </p>
                </div>
              )}

              {/* Hardware & Browser */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500">Thiết bị:</span>
                  <p className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
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
                  className="w-full py-2.5 px-4 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-500 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group"
                >
                  <Compass size={14} />
                  <span>Xem Toàn Bộ Lịch Sử Hành Trình Trọn Đời</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Trang web đang duyệt</span>
              <p className="text-sm font-bold text-white line-clamp-1">{v.currentPageTitle || 'Trang đặt vé'}</p>
              <p className="font-mono text-xs text-indigo-300 break-all">{v.currentPageUrl || '/'}</p>
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
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Dừng mắt: {v.idleSecondsOnPage}s ({idlePercent}%)
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
                <pre className="font-mono text-[10px] text-slate-300 bg-slate-900 p-2 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-24 custom-scrollbar">
                  {v.lastActionPayload}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Recommendations & Live Event Stream (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Card 3: AI Realtime Recommendations Hub */}
          <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-2">
                <Sparkles size={14} className="text-cyan-400" />
                Đang Đề Xuất Gì Cho Khách (AI Engine)
              </span>
              <span className="text-xs bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full font-bold">
                {getPersonaLabel(v.matchedPersona)}
              </span>
            </div>

            {v.recommendedTrips && v.recommendedTrips.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {v.recommendedTrips.map((trip, idx) => (
                  <div 
                    key={idx}
                    className="bg-slate-950/80 border border-white/5 hover:border-cyan-500/40 rounded-xl p-3.5 transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Bus size={14} className="text-indigo-400" />
                        <span className="truncate max-w-[150px]">{trip.route}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded">
                        {trip.price}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                      <span>Giờ chạy: <strong className="text-slate-200">{trip.departureTime}</strong></span>
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
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
                <Layers size={14} className="text-indigo-400" />
                Dòng Thời Gian Các Sự Kiện Trong Phiên
              </span>

              {/* Tabs for Pageviews vs Actions */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveTab('PAGEVIEWS')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'PAGEVIEWS' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Trang Đã Duyệt ({detail.pageViews?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('ACTIONS')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
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
                      className={`border rounded-xl p-3 flex items-center justify-between text-xs transition-all ${
                        idx === 0 
                          ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/10' 
                          : 'bg-slate-950/70 border-slate-800/80'
                      }`}
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white truncate max-w-sm">{pv.pageTitle}</p>
                          {idx === 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.2 rounded-full animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Hiện Tại
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-[11px] text-indigo-300 truncate">{pv.pageUrl}</p>
                        <p className="text-[10px] text-slate-500">Bắt đầu: {pv.enteredAt}</p>
                      </div>
                      <div className="text-right shrink-0 pl-3">
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded">
                          {pv.activeSeconds}s chủ động
                        </span>
                        {pv.idleSeconds > 0 && (
                          <p className="text-[10px] text-slate-400 mt-0.5">{pv.idleSeconds}s treo tab</p>
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
                          <span className="font-bold text-purple-300 bg-purple-950/80 border border-purple-500/40 px-2 py-0.5 rounded text-[11px]">
                            {act.actionType}
                          </span>
                          {idx === 0 && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.2 rounded-full animate-pulse">
                              Vừa Làm
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">{act.createdAt}</span>
                      </div>
                      {act.payload && (
                        <pre className="font-mono text-[10px] text-slate-300 bg-slate-900/90 p-2 rounded overflow-x-auto whitespace-pre-wrap max-h-20 custom-scrollbar">
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

