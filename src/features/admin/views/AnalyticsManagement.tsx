import React, { useEffect, useState } from 'react';
import { BarChart3, RefreshCw, Users, Activity, Clock, TrendingUp } from 'lucide-react';
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

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

export const AnalyticsManagement: React.FC = () => {
  const today = new Date();
  const [from, setFrom] = useState(formatDate(new Date(today.getTime() - 6 * 86400000)));
  const [to, setTo] = useState(formatDate(today));
  const [overview, setOverview] = useState<Overview | null>(null);
  const [funnel, setFunnel] = useState<AnalyticsList[]>([]);
  const [dwell, setDwell] = useState<AnalyticsList[]>([]);
  const [searchTrends, setSearchTrends] = useState<AnalyticsList[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const params = { from, to };
      const [overviewResponse, funnelResponse, dwellResponse, trendsResponse] = await Promise.all([
        api.get<AnalyticsResponse<Overview>>('/admin/analytics/overview', { params }),
        api.get<AnalyticsResponse<AnalyticsList[]>>('/admin/analytics/funnel-conversion', { params }),
        api.get<AnalyticsResponse<AnalyticsList[]>>('/admin/analytics/dwell-time-by-page', { params }),
        api.get<AnalyticsResponse<AnalyticsList[]>>('/admin/analytics/search-trends', { params: { ...params, limit: 10 } }),
      ]);
      setOverview(overviewResponse.data.data);
      setFunnel(funnelResponse.data.data);
      setDwell(dwellResponse.data.data);
      setSearchTrends(trendsResponse.data.data);
    } catch {
      toast.error('Không thể tải dữ liệu phân tích.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Phân tích hành vi</h1>
          <p className="text-sm text-gray-500">Theo dõi hành trình và hiệu quả chuyển đổi.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-gray-500">Từ<input type="date" value={from} onChange={e => setFrom(e.target.value)} className="mt-1 block rounded-lg border p-2 text-sm" /></label>
          <label className="text-xs text-gray-500">Đến<input type="date" value={to} onChange={e => setTo(e.target.value)} className="mt-1 block rounded-lg border p-2 text-sm" /></label>
          <button onClick={() => void loadAnalytics()} disabled={loading} className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Metric icon={Activity} label="Tổng sự kiện" value={overview?.totalEvents ?? 0} />
        <Metric icon={Users} label="Visitor hoạt động" value={overview?.activeVisitors ?? 0} />
        <Metric icon={Clock} label="Số ngày báo cáo" value={overview?.daily?.length ?? 0} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartPanel title="Lượt truy cập theo ngày">
          <BarChart items={(overview?.daily ?? []).map(item => ({ label: item.day, value: item.events }))} />
        </ChartPanel>
        <ChartPanel title="Tỷ lệ phễu đặt vé">
          <BarChart items={funnel.map(item => ({ label: item.step ?? '-', value: item.sessions ?? 0 }))} />
        </ChartPanel>
        <ChartPanel title="Tuyến được tìm kiếm nhiều nhất">
          <BarChart items={searchTrends.map(item => ({ label: item.keyword ?? '-', value: item.search_count ?? 0 }))} />
        </ChartPanel>
        <Panel title="Phễu đặt vé">
          {funnel.map(item => <Row key={item.step} label={item.step ?? '-'} value={`${item.sessions ?? 0} phiên`} />)}
        </Panel>
        <Panel title="Từ khóa tìm kiếm">
          {searchTrends.map(item => <Row key={item.keyword} label={item.keyword ?? '-'} value={`${item.search_count ?? 0} lượt`} />)}
        </Panel>
        <Panel title="Thời gian dừng theo trang">
          {dwell.map(item => <Row key={item.pageUrl} label={item.pageUrl ?? '-'} value={`${Math.round(item.averageDwellTimeSeconds ?? 0)} giây`} />)}
        </Panel>
        <Panel title="Sự kiện theo loại">
          {overview?.actions.map(item => <Row key={item.actionType} label={item.actionType} value={`${item.eventCount} lượt`} />)}
        </Panel>
      </div>
    </div>
  );
};

const Metric = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="rounded-xl bg-blue-50 p-3 text-blue-600"><Icon size={22} /></div>
    <div><p className="text-sm text-gray-500">{label}</p><p className="text-2xl font-bold text-gray-800">{value.toLocaleString('vi-VN')}</p></div>
  </div>
);

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800"><BarChart3 size={18} className="text-blue-600" />{title}</h2>
    <div className="space-y-2">{children || <p className="text-sm text-gray-400">Chưa có dữ liệu.</p>}</div>
  </section>
);

const ChartPanel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
      <TrendingUp size={18} className="text-blue-600" />{title}
    </h2>
    {children}
  </section>
);

const BarChart = ({ items }: { items: Array<{ label: string; value: number }> }) => {
  const max = Math.max(...items.map(item => item.value), 1);
  if (items.length === 0) return <p className="text-sm text-gray-400">Chưa có dữ liệu.</p>;
  return (
    <div className="space-y-3">
      {items.slice(0, 10).map(item => (
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
    <span className="truncate pr-4 text-gray-600">{label}</span><strong className="text-gray-800">{value}</strong>
  </div>
);
