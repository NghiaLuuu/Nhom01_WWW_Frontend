import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  RefreshCw,
  Users,
  Activity,
  Clock,
  TrendingUp,
  ArrowRight,
  Search,
  UserCheck,
  Navigation,
  Sparkles,
  CheckCircle2,
  Eye,
  FileText,
  XCircle,
  Compass,
  Filter,
  Laptop,
  Globe,
  X,
  User as UserIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../../services/api';

interface AnalyticsResponse<T> {
  success: boolean;
  data: T;
}

interface Overview {
  totalEvents: number;
  activeVisitors: number;
  daily: Array<{ day: string; events: number; visitors: number }>;
  actions: Array<{ actionType: string; eventCount: number }>;
}

interface AnalyticsList {
  step?: string;
  sessions?: number;
  pageUrl?: string;
  averageDwellTimeSeconds?: number;
  eventCount?: number;
  keyword?: string;
  search_count?: number;
}

interface TabFlowItem {
  from_tab?: string;
  to_tab?: string;
  transition_count?: number;
}

interface ActiveUserItem {
  user_name?: string;
  user_email?: string;
  visitor_id?: string;
  user_id_str?: string;
  ip_address?: string;
  device_info?: string;
  total_actions?: number;
  total_sessions?: number;
  last_active?: string;
}

interface UserJourneyItem {
  id: string;
  action_type: string;
  page_url?: string;
  page_title?: string;
  referrer?: string;
  dwell_time_seconds?: number;
  user_email?: string;
  user_id_str?: string;
  visitor_id?: string;
  session_id?: string;
  ip_address?: string;
  device_info?: string;
  event_data?: any;
  created_at: string;
}

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const parseEventData = (data: any): Record<string, any> => {
  if (!data) return {};
  if (typeof data === 'object') return data;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return {};
};

const parseDeviceSummary = (deviceInfo?: string): string => {
  if (!deviceInfo) return '';
  const ua = deviceInfo.toLowerCase();

  let os = '';
  if (ua.includes('macintosh') || ua.includes('mac os')) os = 'Mac';
  else if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('iphone')) os = 'iPhone';
  else if (ua.includes('ipad')) os = 'iPad';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('linux')) os = 'Linux';

  let browser = '';
  if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('safari')) browser = 'Safari';
  else if (ua.includes('firefox')) browser = 'Firefox';

  if (os && browser) return `${browser} (${os})`;
  return os || browser || 'Web';
};

const formatIpDisplay = (ip?: string): string => {
  if (!ip) return '';
  if (ip === '0:0:0:0:0:0:0:1' || ip === '::1' || ip === '127.0.0.1') return '127.0.0.1 (Local)';
  return ip;
};

const getCleanPageName = (pageUrl?: string, pageTitle?: string): string => {
  if (!pageUrl) return pageTitle || 'Trang web';
  const path = pageUrl.split('?')[0];
  if (path === '/') return 'Trang chủ';
  if (path.startsWith('/search')) return 'Tra cứu / Tìm vé';
  if (path.startsWith('/schedule')) return 'Lịch trình chuyến xe';
  if (path.startsWith('/checkout')) return 'Thanh toán & Đặt vé';
  if (path.startsWith('/booking-success')) return 'Đặt vé thành công';
  if (path.startsWith('/login')) return 'Đăng nhập';
  if (path.startsWith('/register')) return 'Đăng ký';
  if (path.startsWith('/profile')) return 'Hồ sơ cá nhân';
  return pageTitle && pageTitle !== 'VeXe' ? pageTitle : path;
};

const getEventHumanSummary = (item: UserJourneyItem) => {
  const eventData = parseEventData(item.event_data);
  const pageName = getCleanPageName(item.page_url, item.page_title);

  switch (item.action_type) {
    case 'TAB_SWITCH': {
      const from = eventData.fromTab || eventData.fromPath || 'Khởi đầu';
      const to = eventData.toTab || eventData.toPath || pageName;
      return {
        badge: 'Chuyển tab',
        badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        title: `Chuyển tab: ${from} ➔ ${to}`,
        description: `Người dùng chuyển hướng từ "${from}" sang "${to}"`,
        icon: Navigation,
      };
    }
    case 'SEARCH_TRIPS':
    case 'SEARCH_TRIP': {
      const keyword = eventData.searchKeyword || eventData.keyword || 'Tất cả chuyến xe';
      return {
        badge: 'Tìm chuyến',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        title: `Tìm kiếm tuyến xe: ${keyword}`,
        description: `Khách hàng đang tìm vé cho chặng "${keyword}"`,
        icon: Search,
      };
    }
    case 'SELECT_SEAT': {
      const seat = eventData.seatNumber || eventData.seat || 'Đang chọn';
      const price = eventData.price ? `${Number(eventData.price).toLocaleString('vi-VN')} đ` : '';
      return {
        badge: 'Chọn ghế',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        title: `Chọn vị trí ghế: ${seat} ${price ? `(${price})` : ''}`,
        description: `Khách hàng đã chọn ghế ${seat} trên sơ đồ`,
        icon: CheckCircle2,
      };
    }
    case 'VIEW_SEATS': {
      return {
        badge: 'Xem chỗ',
        badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
        title: `Xem sơ đồ ghế chuyến xe`,
        description: `Mở xem chi tiết các tầng ghế trống và giá vé`,
        icon: Eye,
      };
    }
    case 'FILL_INFO': {
      return {
        badge: 'Điền thông tin',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
        title: `Điền thông tin đặt vé`,
        description: `Nhập họ tên hành khách, số điện thoại, điểm đón`,
        icon: FileText,
      };
    }
    case 'BOOK_SUCCESS': {
      const code = eventData.bookingCode || eventData.ticketId || '';
      return {
        badge: 'Đặt vé thành công',
        badgeColor: 'bg-green-100 text-green-800 border-green-200',
        title: `Đặt vé thành công! ${code ? `(Mã vé: #${code})` : ''}`,
        description: `Khách hàng đã hoàn tất thanh toán và đặt vé xe`,
        icon: Sparkles,
      };
    }
    case 'ABANDON_BOOKING': {
      return {
        badge: 'Bỏ dở thanh toán',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
        title: `Bỏ dở quá trình thanh toán vé`,
        description: `Khách hàng rời đi trước khi xác nhận thanh toán`,
        icon: XCircle,
      };
    }
    case 'DWELL_TIME': {
      const dwellSec = item.dwell_time_seconds || eventData.dwellTimeSeconds || 0;
      return {
        badge: 'Thời gian dừng',
        badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
        title: `Dừng xem tại ${pageName}: ${dwellSec} giây`,
        description: `Khách hàng đã dừng lại xem nội dung trang này trong ${dwellSec}s`,
        icon: Clock,
      };
    }
    case 'PAGE_VIEW':
    default: {
      return {
        badge: 'Xem trang',
        badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
        title: `Truy cập: ${pageName}`,
        description: `Đang xem giao diện "${pageName}"`,
        icon: Compass,
      };
    }
  }
};

export const AnalyticsManagement: React.FC = () => {
  const today = new Date();
  const [from, setFrom] = useState(formatDate(new Date(today.getTime() - 6 * 86400000)));
  const [to, setTo] = useState(formatDate(today));

  // Analytics states
  const [overview, setOverview] = useState<Overview | null>(null);
  const [funnel, setFunnel] = useState<AnalyticsList[]>([]);
  const [dwell, setDwell] = useState<AnalyticsList[]>([]);
  const [searchTrends, setSearchTrends] = useState<AnalyticsList[]>([]);
  const [tabFlows, setTabFlows] = useState<TabFlowItem[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUserItem[]>([]);
  const [userJourney, setUserJourney] = useState<UserJourneyItem[]>([]);

  // Filter & Search states
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('');
  const [selectedUserDisplayName, setSelectedUserDisplayName] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [timelineFilter, setTimelineFilter] = useState<'ALL' | 'IMPORTANT' | 'BOOKING' | 'TAB_SWITCH'>('IMPORTANT');
  const [loading, setLoading] = useState(false);
  const [loadingJourney, setLoadingJourney] = useState(false);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const params = { from, to };
      const [
        overviewResponse,
        funnelResponse,
        dwellResponse,
        trendsResponse,
        tabFlowsResponse,
        activeUsersResponse,
      ] = await Promise.all([
        api.get<AnalyticsResponse<Overview>>('/admin/analytics/overview', { params }),
        api.get<AnalyticsResponse<AnalyticsList[]>>('/admin/analytics/funnel-conversion', { params }),
        api.get<AnalyticsResponse<AnalyticsList[]>>('/admin/analytics/dwell-time-by-page', { params }),
        api.get<AnalyticsResponse<AnalyticsList[]>>('/admin/analytics/search-trends', {
          params: { ...params, limit: 10 },
        }),
        api.get<AnalyticsResponse<TabFlowItem[]>>('/admin/analytics/tab-flows', {
          params: { ...params, limit: 10 },
        }),
        api.get<AnalyticsResponse<ActiveUserItem[]>>('/admin/analytics/active-users', {
          params: { ...params, limit: 15 },
        }),
      ]);

      setOverview(overviewResponse.data.data);
      setFunnel(funnelResponse.data.data || []);
      setDwell(dwellResponse.data.data || []);
      setSearchTrends(trendsResponse.data.data || []);
      setTabFlows(tabFlowsResponse.data.data || []);
      setActiveUsers(activeUsersResponse.data.data || []);

      void loadJourney(selectedUserFilter);
    } catch {
      toast.error('Không thể tải dữ liệu phân tích.');
    } finally {
      setLoading(false);
    }
  };

  const loadJourney = async (identifier?: string) => {
    setLoadingJourney(true);
    try {
      const params: any = { from, to, limit: 50 };
      if (identifier && identifier.trim()) {
        params.identifier = identifier.trim();
      }
      const response = await api.get<AnalyticsResponse<UserJourneyItem[]>>('/admin/analytics/user-journey', {
        params,
      });
      setUserJourney(response.data.data || []);
    } catch {
      toast.error('Không thể tải lịch trình tương tác người dùng.');
    } finally {
      setLoadingJourney(false);
    }
  };

  useEffect(() => {
    void loadAnalytics();
  }, []);

  const handleSelectUser = (u: ActiveUserItem) => {
    const identifier = u.user_email || u.visitor_id || '';
    const device = parseDeviceSummary(u.device_info);
    const ip = formatIpDisplay(u.ip_address);
    const displayName = u.user_email
      ? u.user_email
      : `Khách #${(u.visitor_id || '').slice(0, 8)} ${device ? `(${device})` : ''}${ip ? ` • IP: ${ip}` : ''}`;

    setSelectedUserFilter(identifier);
    setSelectedUserDisplayName(displayName);
    setSearchInput('');
    void loadJourney(identifier);
  };

  const handleSearchSubmit = () => {
    const query = searchInput.trim();
    if (!query) {
      handleClearUserFilter();
      return;
    }
    setSelectedUserFilter(query);
    setSelectedUserDisplayName(`Tìm kiếm: "${query}"`);
    void loadJourney(query);
  };

  const handleClearUserFilter = () => {
    setSelectedUserFilter('');
    setSelectedUserDisplayName('');
    setSearchInput('');
    void loadJourney('');
  };

  // Filter user journey items based on Admin's selection
  const filteredJourney = userJourney.filter((item) => {
    if (timelineFilter === 'ALL') return true;
    if (timelineFilter === 'IMPORTANT') {
      if (item.action_type === 'DWELL_TIME') {
        const dwellSec = item.dwell_time_seconds || parseEventData(item.event_data).dwellTimeSeconds || 0;
        return dwellSec >= 5;
      }
      return true;
    }
    if (timelineFilter === 'BOOKING') {
      return ['SEARCH_TRIPS', 'SEARCH_TRIP', 'VIEW_SEATS', 'SELECT_SEAT', 'FILL_INFO', 'BOOK_SUCCESS', 'ABANDON_BOOKING'].includes(item.action_type);
    }
    if (timelineFilter === 'TAB_SWITCH') {
      return item.action_type === 'TAB_SWITCH';
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="text-blue-600" /> Báo cáo & Phân tích hành vi người dùng
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi hành trình thực tế của khách hàng (chuyển tab, tìm vé, chọn ghế) và phễu chuyển đổi.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs font-medium text-gray-600">
            Từ ngày
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 block rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label className="text-xs font-medium text-gray-600">
            Đến ngày
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 block rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <button
            onClick={() => void loadAnalytics()}
            disabled={loading}
            className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Cập nhật
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={Activity} label="Tổng số hành động" value={overview?.totalEvents ?? 0} />
        <Metric icon={Users} label="Lượt khách truy cập" value={overview?.activeVisitors ?? 0} />
        <Metric icon={Navigation} label="Lượt chuyển tab/trang" value={tabFlows.reduce((acc, cur) => acc + (cur.transition_count || 0), 0)} />
        <Metric icon={Clock} label="Số ngày ghi nhận" value={overview?.daily?.length ?? 0} />
      </div>

      {/* Section 1: Navigation Flows & Active Users */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Flow giữa các tab/trang */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <Navigation size={20} className="text-blue-600" />
              Luồng điều hướng (Khách chuyển từ trang nào sang đâu)
            </h2>
            <span className="text-xs text-gray-400">Top chuyển trang</span>
          </div>

          {tabFlows.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">
              Chưa ghi nhận luồng chuyển trang trong khoảng thời gian này.
            </div>
          ) : (
            <div className="max-h-[360px] overflow-y-auto space-y-3 pr-1">
              {tabFlows.map((flow, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl bg-gray-50 p-3.5 hover:bg-blue-50/50 transition-colors border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {idx + 1}
                    </span>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                      <span className="rounded-md bg-white px-2.5 py-1 shadow-xs border border-gray-200">
                        {flow.from_tab || 'Khởi đầu'}
                      </span>
                      <ArrowRight size={16} className="text-blue-500" />
                      <span className="rounded-md bg-white px-2.5 py-1 shadow-xs border border-blue-200 font-semibold text-blue-700">
                        {flow.to_tab || 'Trang đích'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{flow.transition_count ?? 0}</span>
                    <span className="text-xs text-gray-500 ml-1">lượt</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Danh sách người dùng hoạt động */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
                <UserCheck size={20} className="text-blue-600" />
                Khách hàng hoạt động gần đây
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Nhấp vào người dùng để lọc Timeline chi tiết</p>
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              {activeUsers.length} khách
            </span>
          </div>

          {activeUsers.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">
              Chưa có người dùng hoạt động trong khoảng thời gian này.
            </div>
          ) : (
            <div className="max-h-[360px] overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                    <th className="pb-3">Khách hàng / Thiết bị & IP</th>
                    <th className="pb-3 text-center">Hành động</th>
                    <th className="pb-3 text-right">Lần cuối</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activeUsers.map((u, idx) => {
                    const identifier = u.user_email || u.visitor_id || '';
                    const isSelected = selectedUserFilter === identifier;
                    const device = parseDeviceSummary(u.device_info);
                    const ip = formatIpDisplay(u.ip_address);
                    const isMember = Boolean(u.user_email);

                    return (
                      <tr
                        key={idx}
                        onClick={() => handleSelectUser(u)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/90 font-medium text-blue-900' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="py-2.5 pr-2">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              {isMember ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                                  <UserIcon size={11} /> Thành viên
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                                  Khách vãng lai
                                </span>
                              )}
                              <span className="font-semibold text-gray-800">
                                {isMember ? u.user_email : `Khách #${(u.visitor_id || '').slice(0, 8)}`}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                              {device && (
                                <span className="flex items-center gap-1 text-gray-600">
                                  <Laptop size={12} className="text-gray-400" /> {device}
                                </span>
                              )}
                              {ip && (
                                <span className="flex items-center gap-1 text-gray-500">
                                  <Globe size={12} className="text-gray-400" /> {ip}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 text-center">
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                            {u.total_actions ?? 0}
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-xs text-gray-400">
                          {u.last_active ? new Date(u.last_active).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Section 2: User Journey Timeline (Trực quan hóa hành trình chi tiết) */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <Clock size={20} className="text-blue-600" />
              Tra cứu dòng sự kiện của người dùng (User Journey Timeline)
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Xem chi tiết từng bước người dùng tương tác, chuyển trang, tìm vé và thao tác.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedUserFilter ? (
              <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs text-blue-900 shadow-xs">
                <UserCheck size={14} className="text-blue-600 shrink-0" />
                <span className="font-semibold">{selectedUserDisplayName || selectedUserFilter}</span>
                <button
                  onClick={handleClearUserFilter}
                  title="Xóa bộ lọc"
                  className="text-blue-400 hover:text-blue-700 ml-1 rounded-full p-0.5 hover:bg-blue-100 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : null}

            <div className="relative">
              <input
                type="text"
                placeholder="Tìm theo email, mã khách (vd: 155d5ea8) hoặc IP..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                className="w-72 rounded-lg border border-gray-300 py-1.5 pl-8 pr-3 text-xs shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            </div>
            <button
              onClick={handleSearchSubmit}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Filter Tabs for Admin */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6 border-b border-gray-100 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 mr-1">
              <Filter size={14} /> Bộ lọc:
            </span>
            <button
              onClick={() => setTimelineFilter('IMPORTANT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                timelineFilter === 'IMPORTANT'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Hành vi chính (Khuyên dùng)
            </button>
            <button
              onClick={() => setTimelineFilter('BOOKING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                timelineFilter === 'BOOKING'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Chỉ xem Đặt vé & Chọn ghế
            </button>
            <button
              onClick={() => setTimelineFilter('TAB_SWITCH')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                timelineFilter === 'TAB_SWITCH'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Chỉ xem Chuyển tab
            </button>
            <button
              onClick={() => setTimelineFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                timelineFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tất cả (Bao gồm thời gian dừng)
            </button>
          </div>

          <span className="text-xs font-medium text-gray-500">
            Hiển thị <strong className="text-blue-600 font-bold">{filteredJourney.length}</strong> sự kiện
          </span>
        </div>

        {loadingJourney ? (
          <div className="py-12 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-blue-600" /> Đang tải lịch trình tương tác...
          </div>
        ) : filteredJourney.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            Chưa có hành vi nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto pr-3 pt-2 pb-2 border border-gray-100 rounded-2xl bg-gray-50/30 p-4 shadow-inner">
            <div className="relative border-l-2 border-blue-200 ml-4 pl-6 space-y-6">
              {filteredJourney.map((item, index) => {
                const time = item.created_at ? new Date(item.created_at).toLocaleString('vi-VN') : '-';
                const summary = getEventHumanSummary(item);
                const EventIcon = summary.icon;
                const isMember = Boolean(item.user_email);
                const device = parseDeviceSummary(item.device_info);
                const ip = formatIpDisplay(item.ip_address);

                const userBadge = isMember ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                    <UserIcon size={11} /> {item.user_email}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                    Khách #{ (item.visitor_id || '').slice(0, 8) }
                    {device && <span className="font-normal text-gray-500">({device})</span>}
                    {ip && <span className="font-normal text-gray-400">• IP: {ip}</span>}
                  </span>
                );

                return (
                  <div key={item.id || index} className="relative group">
                    {/* Dot with action icon */}
                    <div className="absolute -left-[35px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-md ring-2 ring-blue-100" />

                    <div className="rounded-xl border border-gray-100 bg-white p-4 hover:bg-blue-50/20 transition-colors shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-semibold ${summary.badgeColor}`}>
                            <EventIcon size={12} />
                            {summary.badge}
                          </span>
                          <h3 className="text-sm font-bold text-gray-900">{summary.title}</h3>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{time}</span>
                      </div>

                      <p className="text-xs text-gray-600 mt-1 mb-2 font-medium">
                        {summary.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                        {userBadge}
                        <span>
                          Vị trí trang: <code className="text-gray-700 bg-gray-100 px-1 py-0.5 rounded">{item.page_url}</code>
                        </span>
                        {item.referrer && (
                          <span>
                            Nguồn chuyển tới: <code className="text-gray-700 bg-gray-100 px-1 py-0.5 rounded">{item.referrer}</code>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Section 3: Charts & Overviews (Funnel, Search Trends, Dwell Time) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartPanel title="Lượt khách truy cập theo ngày">
          <BarChart items={(overview?.daily ?? []).map((item) => ({ label: item.day, value: item.events }))} />
        </ChartPanel>

        <ChartPanel title="Tỷ lệ phễu mua vé (Conversion Funnel)">
          <BarChart items={funnel.map((item) => ({ label: item.step ?? '-', value: item.sessions ?? 0 }))} />
        </ChartPanel>

        <ChartPanel title="Tuyến xe được khách tìm kiếm nhiều nhất">
          <BarChart items={searchTrends.map((item) => ({ label: item.keyword ?? '-', value: item.search_count ?? 0 }))} />
        </ChartPanel>

        <Panel title="Thời gian khách dừng xem theo trang">
          {dwell.map((item) => (
            <Row
              key={item.pageUrl}
              label={getCleanPageName(item.pageUrl)}
              value={`${Math.round(item.averageDwellTimeSeconds ?? 0)} giây`}
            />
          ))}
        </Panel>

        <Panel title="Số phiên khách tại từng bước phễu">
          {funnel.map((item) => (
            <Row key={item.step} label={item.step ?? '-'} value={`${item.sessions ?? 0} phiên`} />
          ))}
        </Panel>

        <Panel title="Phân bố hành động của khách theo loại">
          {overview?.actions.map((item) => (
            <Row key={item.actionType} label={item.actionType} value={`${item.eventCount} lượt`} />
          ))}
        </Panel>
      </div>
    </div>
  );
};

const Metric = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
      <Icon size={22} />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value.toLocaleString('vi-VN')}</p>
    </div>
  </div>
);

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
      <BarChart3 size={18} className="text-blue-600" />
      {title}
    </h2>
    <div className="space-y-2">{children || <p className="text-sm text-gray-400">Chưa có dữ liệu.</p>}</div>
  </section>
);

const ChartPanel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
      <TrendingUp size={18} className="text-blue-600" />
      {title}
    </h2>
    {children}
  </section>
);

const BarChart = ({ items }: { items: Array<{ label: string; value: number }> }) => {
  const max = Math.max(...items.map((item) => item.value), 1);
  if (items.length === 0) return <p className="text-sm text-gray-400">Chưa có dữ liệu.</p>;
  return (
    <div className="space-y-3">
      {items.slice(0, 10).map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex justify-between gap-3 text-xs text-gray-600">
            <span className="truncate">{item.label}</span>
            <strong>{item.value.toLocaleString('vi-VN')}</strong>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-0">
    <span className="truncate pr-4 text-gray-600">{label}</span>
    <strong className="text-gray-800">{value}</strong>
  </div>
);
