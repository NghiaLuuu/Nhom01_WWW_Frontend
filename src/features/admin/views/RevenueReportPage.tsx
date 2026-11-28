import { useEffect, useState, type FormEvent } from 'react';
import axios from 'axios';
import { BarChart3, RefreshCw, Wallet, CreditCard, AlertTriangle } from 'lucide-react';
import { ReportService, type RevenueFilters, type RevenueReport } from '../api/report.service';
import { DataTable, type Column } from '../../../components/DataTable';

const formatMoney = (value: number) => new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND', maximumFractionDigits: 0,
}).format(value);
const formatCount = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

function initialFilters(): RevenueFilters {
  const now = new Date();
  return {
    from: localDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: localDate(now),
    groupBy: 'DAY',
  };
}

export const RevenueReportPage = () => {
  const [draft, setDraft] = useState<RevenueFilters>(initialFilters);
  const [filters, setFilters] = useState<RevenueFilters>(initialFilters);
  const [report, setReport] = useState<RevenueReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError('');
    setReport(null);
    ReportService.getRevenue(filters, controller.signal)
      .then(data => { if (!controller.signal.aborted) setReport(data); })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (axios.isAxiosError(err)) {
          setError(err.response?.status === 403
            ? 'Bạn không có quyền xem báo cáo doanh thu.'
            : err.response?.data?.message || 'Không thể kết nối để tải báo cáo. Vui lòng thử lại.');
        } else {
          setError(err instanceof Error ? err.message : 'Không thể tải báo cáo doanh thu.');
        }
      })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, [filters]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const days = (Date.parse(draft.to) - Date.parse(draft.from)) / 86400000;
    if (!draft.from || !draft.to || !Number.isFinite(days) || days < 0 || days > 3660) {
      setValidationError('Ngày kết thúc phải từ ngày bắt đầu trở đi; khoảng báo cáo tối đa 3660 ngày.');
      return;
    }
    setValidationError('');
    setFilters({ ...draft });
  };

  const seriesColumns: Column<RevenueReport['series'][number]>[] = [
    { header: filters.groupBy === 'DAY' ? 'Ngày' : 'Tháng', accessor: 'period' },
    { header: 'Giao dịch thành công', accessor: row => formatCount(row.paymentCount), align: 'right' },
    { header: 'Doanh thu đã thu', accessor: row => formatMoney(row.revenue), align: 'right' },
  ];
  const methodColumns: Column<RevenueReport['byPaymentMethod'][number]>[] = [
    { header: 'Phương thức', accessor: 'paymentMethod' },
    { header: 'Giao dịch', accessor: row => formatCount(row.paymentCount), align: 'right' },
    { header: 'Doanh thu đã thu', accessor: row => formatMoney(row.revenue), align: 'right' },
  ];
  const maxRevenue = report ? Math.max(0, ...report.series.map(point => point.revenue)) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="text-blue-600 shrink-0" size={28} />
        <div>
          <h2 className="text-xl font-bold text-gray-900">Báo Cáo & Thống Kê Doanh Thu</h2>
          <p className="text-sm text-gray-500">Tổng hợp thanh toán thành công và đơn đặt vé từ hệ thống.</p>
        </div>
      </div>

      <form onSubmit={submit} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex flex-wrap gap-4 items-end">
          <label className="text-sm font-medium text-gray-700">Từ ngày
            <input type="date" required value={draft.from} onChange={e => setDraft({ ...draft, from: e.target.value })} className="block mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-gray-700">Đến ngày
            <input type="date" required min={draft.from} value={draft.to} onChange={e => setDraft({ ...draft, to: e.target.value })} className="block mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-gray-700">Nhóm theo
            <select value={draft.groupBy} onChange={e => setDraft({ ...draft, groupBy: e.target.value as RevenueFilters['groupBy'] })} className="block mt-1 border border-gray-300 rounded-md px-3 py-2 bg-white">
              <option value="DAY">Ngày</option>
              <option value="MONTH">Tháng</option>
            </select>
          </label>
          <button type="submit" disabled={isLoading} className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50">
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Đang tải...' : 'Xem báo cáo'}
          </button>
        </div>
        {validationError && <p role="alert" className="text-sm text-red-600">{validationError}</p>}
        <p className="text-xs text-gray-500">Tính cả ngày bắt đầu và kết thúc, theo thời điểm tạo giao dịch thanh toán; không phải ngày khởi hành.</p>
      </form>

      {error && (
        <div role="alert" className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
          <span>{error}</span>
          <button onClick={() => setFilters({ ...filters })} className="font-semibold underline">Thử lại</button>
        </div>
      )}
      {isLoading && <p role="status" className="text-center text-gray-500 py-10 animate-pulse">Đang tổng hợp dữ liệu báo cáo...</p>}

      {!isLoading && report && (
        <>
          <p className="text-sm text-gray-600">Kỳ báo cáo: <strong>{report.from}</strong> đến <strong>{report.to}</strong> · Đơn vị: {report.currency}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <section className="bg-white border border-gray-200 rounded-lg p-5">
              <p className="flex items-center gap-2 text-sm text-gray-500"><Wallet size={18} />Tổng doanh thu đã thu</p>
              <p className="text-2xl font-bold text-blue-700 mt-3 break-words">{formatMoney(report.grossRevenue)}</p>
            </section>
            <section className="bg-white border border-gray-200 rounded-lg p-5">
              <p className="flex items-center gap-2 text-sm text-gray-500"><CreditCard size={18} />Giao dịch thành công</p>
              <p className="text-2xl font-bold text-gray-900 mt-3">{formatCount(report.successfulPayments)}</p>
            </section>
            <section className="bg-white border border-gray-200 rounded-lg p-5">
              <p className="flex items-center gap-2 text-sm text-gray-500"><AlertTriangle size={18} />Tiền đã thu của đơn đã hủy</p>
              <p className="text-2xl font-bold text-amber-700 mt-3 break-words">{formatMoney(report.cancelledBookingReceipts)}</p>
            </section>
          </div>
          <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-4">
            Tổng doanh thu chỉ cộng giao dịch SUCCESS, bao gồm tiền đã thu của đơn hiện đã hủy. Khoản tiền của đơn đã hủy không phải số tiền đã hoàn; báo cáo này chưa thể hiện doanh thu ròng sau hoàn tiền.
          </p>

          {report.series.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-500">Không có giao dịch thành công trong khoảng thời gian đã chọn.</div>
          ) : (
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <h3 className="text-base font-semibold text-gray-900 p-4 border-b">Doanh thu theo {report.groupBy === 'DAY' ? 'ngày' : 'tháng'}</h3>
              <div className="p-4 space-y-3 max-h-80 overflow-y-auto" aria-label="Biểu đồ doanh thu">
                {report.series.map(point => (
                  <div key={point.period} className="grid grid-cols-[6rem_1fr] sm:grid-cols-[6rem_1fr_9rem] items-center gap-3 text-xs">
                    <span className="text-gray-600">{point.period}</span>
                    <div className="bg-blue-50 rounded h-5 overflow-hidden" title={formatMoney(point.revenue)}>
                      <div className="h-full bg-blue-600 rounded" style={{ width: `${maxRevenue > 0 ? Math.max(0, point.revenue / maxRevenue * 100) : 0}%` }} />
                    </div>
                    <span className="text-right text-gray-700 col-start-2 sm:col-start-auto">{formatMoney(point.revenue)}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 px-4 pb-4">Chỉ hiển thị các kỳ có giao dịch thành công. Số liệu chi tiết ở bảng bên dưới.</p>
            </section>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <h3 className="font-semibold text-gray-900 p-4 border-b">Chi tiết theo kỳ</h3>
              <div className="max-h-96 overflow-y-auto"><DataTable data={report.series} columns={seriesColumns} keyExtractor={row => row.period} /></div>
            </section>
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <h3 className="font-semibold text-gray-900 p-4 border-b">Theo phương thức thanh toán</h3>
              <DataTable data={report.byPaymentMethod} columns={methodColumns} keyExtractor={row => row.paymentMethod} />
            </section>
          </div>
        </>
      )}
    </div>
  );
};
