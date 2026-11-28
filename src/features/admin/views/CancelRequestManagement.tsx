import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, Eye, Info, RefreshCw, Search, ShieldAlert, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminPageLayout } from '../../../components/AdminPageLayout';
import { DataTable, type Column } from '../../../components/DataTable';
import { FormModal } from '../../../components/FormModal';
import { BookingService } from '../../booking/api/booking.service';
import type { CancelRequestItem } from '../../booking/types/booking.types';

// The existing API uses rejectReason for the original reason until a request is rejected.
type CancellationRequest = Omit<CancelRequestItem, 'reason'> & {
  reason?: string;
  staff?: { fullName?: string; staffCode?: string };
};
type DialogMode = 'DETAIL' | 'APPROVE' | 'REJECT';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Đã từ chối',
};
const STATUS_STYLES: Record<string, string> = {
  PENDING: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  APPROVED: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  REJECTED: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
};
const PAGE_SIZE = 10;
const buttonClass = 'rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400';

function requestReason(request: CancellationRequest) {
  return request.reason?.trim() || (request.status !== 'REJECTED' ? request.rejectReason?.trim() : '') || '';
}

function formatDate(value?: string) {
  if (!value) return 'Chưa có thông tin';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Ngày không hợp lệ' : date.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function errorMessage(error: unknown, fallback: string) {
  if (isAxiosError<{ message?: string }>(error)) return error.response?.data?.message || fallback;
  return error instanceof Error ? error.message : fallback;
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status] || 'border-slate-600 text-slate-300'}`}>{STATUS_LABELS[status] || status}</span>;
}

export const CancelRequestManagement = () => {
  const [requests, setRequests] = useState<CancellationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CancellationRequest | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>('DETAIL');
  const [rejectReason, setRejectReason] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const loadVersion = useRef(0);
  const submittingRef = useRef(false);
  const dialogRef = useRef<HTMLFormElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const loadRequests = useCallback(async () => {
    const version = ++loadVersion.current;
    setLoading(true);
    setLoadError(null);
    try {
      const response = await BookingService.getPendingCancelRequests('ALL');
      if (version !== loadVersion.current) return;
      if (!response?.success || !Array.isArray(response.data)) {
        throw new Error(response?.message || 'Máy chủ chưa trả về danh sách yêu cầu hợp lệ.');
      }
      setRequests(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      if (version !== loadVersion.current) return;
      setRequests([]);
      setLoadError(errorMessage(error, 'Không thể tải yêu cầu hủy vé. Vui lòng thử lại.'));
    } finally {
      if (version === loadVersion.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
    return () => { loadVersion.current += 1; };
  }, [loadRequests]);

  useEffect(() => { setPage(1); }, [search, status]);

  useEffect(() => {
    if (selected) {
      const target = dialogRef.current?.querySelector<HTMLElement>('textarea, button');
      (target || dialogRef.current)?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [selected, dialogMode]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi-VN');
    return requests.filter(request => {
      if (status !== 'ALL' && request.status !== status) return false;
      const booking = request.booking;
      return !query || [request.id, booking?.id, booking?.bookingCode, booking?.customer?.fullName,
        booking?.customer?.phoneNumber, booking?.customer?.email,
        booking?.trip?.route?.departureLocation, booking?.trip?.route?.arrivalLocation, requestReason(request),
      ].some(value => String(value ?? '').toLocaleLowerCase('vi-VN').includes(query));
    }).sort((a, b) => b.id - a.id);
  }, [requests, search, status]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleRequests = filteredRequests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openDialog = (request: CancellationRequest, mode: DialogMode) => {
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelected(request);
    setDialogMode(mode);
    setRejectReason('');
    setSubmitError(null);
  };

  const closeDialog = useCallback(() => {
    if (submittingRef.current) return;
    setSelected(null);
    setSubmitError(null);
  }, []);

  const resolveRequest = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected || selected.status !== 'PENDING' || dialogMode === 'DETAIL' || submittingRef.current) return;
    const isApproved = dialogMode === 'APPROVE';
    if (!isApproved && !rejectReason.trim()) {
      setSubmitError('Vui lòng nhập lý do từ chối.');
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await BookingService.resolveCancelRequest(selected.id, isApproved, isApproved ? '' : rejectReason.trim());
      const expectedStatus = isApproved ? 'APPROVED' : 'REJECTED';
      if (!response?.success || !response.data || response.data.id !== selected.id || response.data.status !== expectedStatus) {
        throw new Error(response?.message && !response.success ? response.message : 'Máy chủ chưa xác nhận kết quả xử lý. Vui lòng tải lại danh sách để kiểm tra.');
      }
      setRequests(previous => previous.map(request => request.id === selected.id ? response.data : request));
      setSelected(null);
      toast.success(isApproved ? 'Máy chủ đã xác nhận duyệt yêu cầu hủy vé.' : 'Máy chủ đã xác nhận từ chối yêu cầu hủy vé.');
      void loadRequests();
    } catch (error) {
      const message = errorMessage(error, 'Không thể xử lý yêu cầu. Vui lòng kiểm tra kết nối và thử lại.');
      setSubmitError(message);
      toast.error(message);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const columns: Column<CancellationRequest>[] = [
    { header: 'Yêu cầu / Đơn vé', accessor: request => (
      <div className="space-y-1">
        <span className="font-semibold text-white">Yêu cầu #{request.id}</span>
        <div className="text-xs text-slate-400">{request.booking?.bookingCode || (request.booking?.id ? `Đơn #${request.booking.id}` : 'Chưa có mã đơn')}</div>
      </div>
    ) },
    { header: 'Khách hàng', accessor: request => (
      <div className="space-y-1">
        <div className="font-medium text-slate-100">{request.booking?.customer?.fullName || 'Chưa có tên khách'}</div>
        <div className="text-xs text-slate-400">{request.booking?.customer?.phoneNumber || request.booking?.customer?.email || 'Chưa có liên hệ'}</div>
      </div>
    ) },
    { header: 'Chuyến xe / Lý do', accessor: request => (
      <div className="min-w-40 max-w-xs space-y-1">
        <div className="text-xs text-slate-200">{request.booking?.trip?.route?.departureLocation || 'Chưa có điểm đi'} → {request.booking?.trip?.route?.arrivalLocation || 'Chưa có điểm đến'}</div>
        <p className="line-clamp-2 break-words text-xs text-slate-400">{requestReason(request) || 'Chưa có lý do yêu cầu'}</p>
      </div>
    ) },
    { header: 'Ngày gửi', accessor: request => <span className="whitespace-nowrap text-xs text-slate-300">{formatDate(request.createdAt)}</span> },
    { header: 'Trạng thái', accessor: request => <StatusBadge status={request.status} /> },
  ];

  const selectedBooking = selected?.booking;
  const seatNames = selectedBooking?.seats?.length ? selectedBooking.seats : selectedBooking?.tickets?.map(ticket => ticket.seat?.seatName || ticket.seatNumber).filter(Boolean);

  return (
    <div className="space-y-5">
      <AdminPageLayout
        title="Yêu cầu hủy vé"
        description="Kiểm tra yêu cầu của khách và gửi quyết định duyệt hoặc từ chối đến máy chủ."
        action={<button type="button" onClick={() => void loadRequests()} disabled={loading || submitting || !!selected} className={`${buttonClass} flex items-center gap-2 border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700`}><RefreshCw size={15} className={loading ? 'animate-spin motion-reduce:animate-none' : ''} />{loading ? 'Đang tải...' : 'Làm mới'}</button>}
      >
        <div className="space-y-4 p-4 sm:p-5">
          <details className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-sm text-amber-200">
            <summary className="cursor-pointer font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">Lưu ý khi xử lý hủy vé</summary>
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-amber-100/80">Yêu cầu chờ duyệt chưa làm mất hiệu lực vé. Duyệt hủy sẽ hủy toàn bộ đơn và các vé hợp lệ trong đơn; từ chối sẽ giữ nguyên đơn vé. Hệ thống ghi nhận nhân viên đang đăng nhập và không thực hiện hoàn tiền tự động.</p>
          </details>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label htmlFor="cancel-request-search" className="mb-1.5 block text-xs font-medium text-slate-300">Tìm yêu cầu</label>
              <div className="relative">
                <Search aria-hidden="true" size={16} className="absolute left-3 top-3 text-slate-400" />
                <input id="cancel-request-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Mã đơn, tên khách, điện thoại hoặc tuyến xe" className="w-full rounded-lg border border-slate-600 bg-slate-900 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400" />
              </div>
            </div>
            <div className="lg:w-44">
              <label htmlFor="cancel-request-status" className="mb-1.5 block text-xs font-medium text-slate-300">Trạng thái yêu cầu</label>
              <select id="cancel-request-status" value={status} onChange={event => setStatus(event.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400">
                <option value="ALL">Tất cả được trả về</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400" aria-live="polite">
            <span>{loading ? 'Đang lấy dữ liệu từ máy chủ...' : `${filteredRequests.length} yêu cầu khớp bộ lọc / ${requests.length} yêu cầu API trả về`}</span>
            {lastUpdated && !loadError && <span>Cập nhật lúc {lastUpdated.toLocaleTimeString('vi-VN')}</span>}
          </div>
        </div>

        {loadError ? (
          <div role="alert" className="m-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-5">
            <div className="flex items-center gap-2 font-semibold text-rose-300"><ShieldAlert size={18} />Không tải được yêu cầu hủy vé</div>
            <p className="mt-2 break-words text-sm text-slate-300">{loadError}</p>
            <button type="button" onClick={() => void loadRequests()} className={`${buttonClass} mt-4 border-rose-400/40 text-rose-200 hover:bg-rose-500/10`}>Thử tải lại</button>
          </div>
        ) : !loading && visibleRequests.length === 0 ? (
          <div role="status" className="border-t border-slate-700 px-6 py-14 text-center">
            <ClipboardList aria-hidden="true" size={32} className="mx-auto mb-4 text-slate-500" />
            <h2 className="font-semibold text-slate-100">{requests.length === 0 ? 'Chưa có yêu cầu hủy vé' : 'Không có yêu cầu khớp bộ lọc'}</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-400">{requests.length === 0 ? 'Chưa có yêu cầu hủy vé trong danh sách máy chủ trả về. Nhấn Làm mới để tiếp nhận yêu cầu mới từ khách hàng.' : 'Thử tìm theo mã đơn, tên khách hoặc đổi trạng thái để xem các yêu cầu đã tải.'}</p>
            {(search || status !== 'ALL') && requests.length > 0 && <button type="button" onClick={() => { setSearch(''); setStatus('ALL'); }} className={`${buttonClass} mt-4 border-slate-600 text-cyan-300 hover:bg-slate-700`}>Xóa bộ lọc</button>}
          </div>
        ) : (
          <DataTable data={visibleRequests} columns={columns} isLoading={loading} actions={request => (
            <div className="flex min-w-[190px] flex-nowrap justify-end gap-1.5">
              <button type="button" aria-label={`Xem yêu cầu #${request.id}`} onClick={() => openDialog(request, 'DETAIL')} className={`${buttonClass} border-slate-600 text-slate-200 hover:bg-slate-700`}><Eye size={14} /></button>
              {request.status === 'PENDING' && <>
                <button type="button" aria-label={`Duyệt yêu cầu #${request.id}`} onClick={() => openDialog(request, 'APPROVE')} className={`${buttonClass} border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10`}>Duyệt</button>
                <button type="button" aria-label={`Từ chối yêu cầu #${request.id}`} onClick={() => openDialog(request, 'REJECT')} className={`${buttonClass} whitespace-nowrap border-rose-500/30 text-rose-300 hover:bg-rose-500/10`}>Từ chối</button>
              </>}
            </div>
          )} />
        )}

        {!loading && !loadError && filteredRequests.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-700 px-5 py-3 text-xs text-slate-400">
          <span>Trang {currentPage} / {totalPages} · {PAGE_SIZE} yêu cầu mỗi trang</span>
          <div className="flex gap-2">
            <button type="button" aria-label="Trang trước" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className={`${buttonClass} border-slate-600 text-slate-200 hover:bg-slate-700`}><ChevronLeft size={15} /></button>
            <button type="button" aria-label="Trang sau" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} className={`${buttonClass} border-slate-600 text-slate-200 hover:bg-slate-700`}><ChevronRight size={15} /></button>
          </div>
        </div>}
      </AdminPageLayout>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-400"><Info size={15} className="mt-0.5 shrink-0" />Bộ lọc chỉ áp dụng trên dữ liệu API đã trả về, không tải thêm lịch sử xử lý. Chỉ yêu cầu đang chờ duyệt mới có thể gửi quyết định.</p>

      <FormModal isOpen={!!selected} onClose={closeDialog} title={`${dialogMode === 'APPROVE' ? 'Duyệt' : dialogMode === 'REJECT' ? 'Từ chối' : 'Chi tiết'} yêu cầu hủy vé #${selected?.id ?? ''}`} maxWidth="max-w-2xl">
        {selected && <form ref={dialogRef} role="dialog" aria-modal="true" aria-label={`Xử lý yêu cầu hủy vé #${selected.id}`} tabIndex={-1} onSubmit={resolveRequest} className="space-y-5" onKeyDown={event => {
          if (event.key !== 'Tab') return;
          const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), textarea:not(:disabled)'));
          if (controls.length === 0) { event.preventDefault(); return; }
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }}>
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold text-white">{selectedBooking?.bookingCode || `Đơn #${selectedBooking?.id ?? '—'}`}</span><StatusBadge status={selected.status} /></div>
          <dl className="grid gap-4 rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-slate-400">Khách hàng</dt><dd className="mt-1 break-words text-white">{selectedBooking?.customer?.fullName || 'Chưa có thông tin'}</dd></div>
            <div><dt className="text-xs text-slate-400">Liên hệ</dt><dd className="mt-1 break-words">{selectedBooking?.customer?.phoneNumber || selectedBooking?.customer?.email || 'Chưa có thông tin'}</dd></div>
            <div className="sm:col-span-2"><dt className="text-xs text-slate-400">Tuyến xe</dt><dd className="mt-1 text-white">{selectedBooking?.trip?.route?.departureLocation || 'Chưa có điểm đi'} → {selectedBooking?.trip?.route?.arrivalLocation || 'Chưa có điểm đến'}</dd></div>
            <div><dt className="text-xs text-slate-400">Khởi hành</dt><dd className="mt-1">{formatDate(selectedBooking?.trip?.departureTime)}</dd></div>
            <div><dt className="text-xs text-slate-400">Ghế trong đơn</dt><dd className="mt-1">{seatNames?.join(', ') || 'Chưa có thông tin'}</dd></div>
            <div><dt className="text-xs text-slate-400">Tổng giá trị đơn, không phải tiền hoàn</dt><dd className="mt-1 font-semibold text-white">{selectedBooking?.totalPrice != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(selectedBooking.totalPrice)) : 'Chưa có thông tin'}</dd></div>
            <div><dt className="text-xs text-slate-400">Ngày gửi</dt><dd className="mt-1">{formatDate(selected.createdAt)}</dd></div>
          </dl>
          <div><p className="mb-1 text-xs font-medium text-slate-400">Lý do khách yêu cầu hủy</p><p className="whitespace-pre-wrap break-words text-sm">{requestReason(selected) || 'API chưa cung cấp lý do yêu cầu.'}</p></div>
          {selected.status === 'REJECTED' && <div><p className="mb-1 text-xs font-medium text-rose-300">Lý do từ chối</p><p className="whitespace-pre-wrap break-words text-sm">{selected.rejectReason || 'Chưa có thông tin'}</p></div>}
          {selected.resolvedAt && <p className="text-xs text-slate-400">Đã xử lý lúc {formatDate(selected.resolvedAt)}{selected.staff?.fullName ? ` bởi ${selected.staff.fullName}` : ''}.</p>}

          {dialogMode === 'APPROVE' && <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm leading-relaxed text-amber-200">Xác nhận gửi quyết định duyệt hủy toàn bộ đơn và các vé trong đơn đến máy chủ. Duyệt hủy không đồng nghĩa tiền đã được hoàn; trang này không thực hiện giao dịch hoàn tiền.</p>}
          {dialogMode === 'REJECT' && <div>
            <label htmlFor="cancel-request-reject-reason" className="mb-2 block text-sm font-medium text-white">Lý do từ chối <span className="text-rose-300">(bắt buộc)</span></label>
            <textarea id="cancel-request-reject-reason" required maxLength={1000} rows={4} value={rejectReason} disabled={submitting} onChange={event => setRejectReason(event.target.value)} placeholder="Nhập lý do để khách hàng biết vì sao yêu cầu không được duyệt" className="w-full rounded-lg border border-slate-600 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 disabled:opacity-60" />
          </div>}
          {submitError && <p role="alert" className="break-words rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{submitError}</p>}
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-700 pt-4">
            <button type="button" onClick={closeDialog} disabled={submitting} className={`${buttonClass} border-slate-600 text-slate-200 hover:bg-slate-700`}>Đóng</button>
            {dialogMode === 'DETAIL' && selected.status === 'PENDING' && <>
              <button type="button" onClick={() => { setDialogMode('REJECT'); setSubmitError(null); }} className={`${buttonClass} border-rose-500/30 text-rose-300 hover:bg-rose-500/10`}>Từ chối yêu cầu</button>
              <button type="button" onClick={() => { setDialogMode('APPROVE'); setSubmitError(null); }} className={`${buttonClass} border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10`}>Duyệt yêu cầu</button>
            </>}
            {dialogMode !== 'DETAIL' && <button type="submit" disabled={submitting || (dialogMode === 'REJECT' && !rejectReason.trim())} className={`${buttonClass} flex items-center gap-2 border-transparent text-white ${dialogMode === 'APPROVE' ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-rose-700 hover:bg-rose-600'}`}>
              {dialogMode === 'APPROVE' ? <CheckCircle2 size={15} /> : <XCircle size={15} />}{submitting ? 'Đang gửi quyết định...' : dialogMode === 'APPROVE' ? 'Xác nhận duyệt hủy' : 'Xác nhận từ chối'}
            </button>}
          </div>
        </form>}
      </FormModal>
    </div>
  );
};
