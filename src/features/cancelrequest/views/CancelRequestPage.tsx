import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { RefreshCw, ClipboardList, Eye, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { CancelRequestService, type CancelRequest, type CancelRequestPage as Page, type CancelStatus } from '../../../services/cancelrequest.service';
import { DataTable, type Column } from '../../../components/DataTable';
import { FormModal } from '../../../components/FormModal';
import { CancelRequestDetails, CancelStatusBadge } from '../components/CancelRequestDetails';
import { cancelStatusLabels, formatCancelDate, formatCancelMoney } from '../utils';

const errorMessage = (error: unknown) => axios.isAxiosError(error)
  ? error.response?.data?.message || 'Không thể kết nối máy chủ. Vui lòng thử lại.'
  : error instanceof Error ? error.message : 'Không thể tải yêu cầu hủy vé.';

export const CancelRequestPage = ({ mode = 'staff' }: { mode?: 'staff' | 'customer' }) => {
  const customerView = mode === 'customer';
  const [params] = useSearchParams();
  const linkedId = !customerView ? Number(params.get('requestId')) : 0;
  const [status, setStatus] = useState<CancelStatus | ''>(customerView || linkedId > 0 ? '' : 'PENDING');
  const [bookingInput, setBookingInput] = useState('');
  const [bookingId, setBookingId] = useState<number | undefined>();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [result, setResult] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [reload, setReload] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(Number.isSafeInteger(linkedId) && linkedId > 0 ? linkedId : null);
  const [detail, setDetail] = useState<CancelRequest | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detailReload, setDetailReload] = useState(0);
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [resolveError, setResolveError] = useState('');
  const savingRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setListError('');
    const filters = { status: status || undefined, bookingId, page, size };
    const request = customerView ? CancelRequestService.mine(filters, controller.signal) : CancelRequestService.search(filters, controller.signal);
    request.then(data => {
      if (controller.signal.aborted) return;
      if (page > 0 && data.content.length === 0 && data.totalPages <= page) {
        setPage(Math.max(0, data.totalPages - 1));
        return;
      }
      setResult(data);
    }).catch(error => {
      if (!controller.signal.aborted) { setResult(null); setListError(errorMessage(error)); }
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [customerView, status, bookingId, page, size, reload]);

  useEffect(() => {
    if (selectedId === null) return;
    const controller = new AbortController();
    setDetail(null);
    setDetailLoading(true);
    setDetailError('');
    CancelRequestService.detail(selectedId, customerView, controller.signal)
      .then(data => { if (!controller.signal.aborted) setDetail(data); })
      .catch(error => { if (!controller.signal.aborted) setDetailError(errorMessage(error)); })
      .finally(() => { if (!controller.signal.aborted) setDetailLoading(false); });
    return () => controller.abort();
  }, [selectedId, customerView, detailReload]);

  const open = (id: number) => {
    setDecision(null); setRejectReason(''); setResolveError(''); setSelectedId(id);
  };
  const close = () => { if (!savingRef.current) { setSelectedId(null); setDecision(null); } };
  const applyBooking = (event: FormEvent) => {
    event.preventDefault();
    const value = Number(bookingInput);
    if (bookingInput && (!Number.isSafeInteger(value) || value < 1)) {
      toast.error('Mã đơn phải là số nguyên dương, ví dụ 123 cho BKG-123'); return;
    }
    setPage(0); setBookingId(bookingInput ? value : undefined); setReload(n => n + 1);
  };
  const resolve = async (event: FormEvent) => {
    event.preventDefault();
    if (!detail || !decision || savingRef.current) return;
    const reason = rejectReason.trim();
    if (decision === 'reject' && (!reason || reason.length > 2000)) {
      setResolveError('Vui lòng nhập lý do từ chối từ 1 đến 2000 ký tự.'); return;
    }
    savingRef.current = true; setSaving(true); setResolveError('');
    try {
      const updated = await CancelRequestService.resolve(detail.id, decision === 'approve', decision === 'reject' ? reason : undefined);
      setDetail(updated); setDecision(null); setRejectReason(''); setReload(n => n + 1);
      toast.success(updated.status === 'APPROVED' ? 'Đã duyệt hủy toàn bộ đơn vé. Chưa xác nhận hoàn tiền.' : 'Đã từ chối yêu cầu hủy vé.');
    } catch (error) {
      setResolveError(errorMessage(error));
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setDecision(null); setDetailReload(n => n + 1); setReload(n => n + 1);
      }
    } finally { savingRef.current = false; setSaving(false); }
  };

  const columns: Column<CancelRequest>[] = [
    { header: 'Yêu cầu / Đơn', accessor: row => <div><strong>#{row.id}</strong><p className="text-xs text-gray-500">BKG-{row.bookingId}</p></div> },
    ...(!customerView ? [{ header: 'Khách hàng', accessor: (row: CancelRequest) => <div>{row.customerName}<p className="text-xs text-gray-500">{row.customerPhone}</p></div> }] : []),
    { header: 'Chuyến xe', accessor: row => <div>{row.departureLocation || '—'} → {row.arrivalLocation || '—'}<p className="text-xs text-gray-500">{formatCancelDate(row.departureTime)}</p></div> },
    { header: 'Tổng tiền đơn', accessor: row => formatCancelMoney(row.bookingAmount), align: 'right' },
    { header: 'Trạng thái', accessor: row => <CancelStatusBadge status={row.status} /> },
    { header: 'Thời điểm gửi', accessor: row => formatCancelDate(row.createdAt) },
    { header: 'Người xử lý', accessor: row => <div>{row.resolvedByName || '—'}<p className="text-xs text-gray-500">{formatCancelDate(row.resolvedAt)}</p></div> },
    { header: 'Chi tiết', accessor: row => <button onClick={() => open(row.id)} className="inline-flex items-center gap-1 text-blue-700 hover:underline p-2"><Eye size={16} />Xem</button> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2"><ClipboardList className="text-blue-600" /><div><h2 className="text-xl font-bold text-gray-900">{customerView ? 'Yêu cầu hủy vé của tôi' : 'Tiếp nhận & xử lý yêu cầu hủy vé'}</h2><p className="text-sm text-gray-500">{customerView ? 'Theo dõi lý do, kết quả và thời điểm nhân viên xử lý.' : 'Xem chi tiết trước khi duyệt hoặc từ chối. Mọi quyết định được lưu người và thời điểm xử lý.'}</p></div></div>
        <button disabled={loading} onClick={() => setReload(n => n + 1)} className="flex items-center gap-2 border rounded-md bg-white px-3 py-2 text-sm disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />Làm mới</button>
      </div>
      <div className="bg-white border rounded-lg p-4 flex flex-wrap gap-4 items-end">
        <label className="text-sm text-gray-700">Trạng thái
          <select value={status} onChange={e => { setStatus(e.target.value as CancelStatus | ''); setPage(0); }} className="block mt-1 border rounded-md px-3 py-2 bg-white"><option value="">Tất cả</option>{Object.entries(cancelStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        </label>
        {!customerView && <form onSubmit={applyBooking} className="flex gap-2 items-end"><label className="text-sm text-gray-700">Mã đơn (số)
          <input type="number" min={1} step={1} value={bookingInput} onChange={e => setBookingInput(e.target.value)} placeholder="Ví dụ: 123" className="block mt-1 border rounded-md px-3 py-2 w-40" />
        </label><button className="border rounded-md px-3 py-2 text-sm" type="submit">Lọc</button></form>}
        <label className="text-sm text-gray-700">Số dòng
          <select value={size} onChange={e => { setSize(Number(e.target.value)); setPage(0); }} className="block mt-1 border rounded-md px-3 py-2 bg-white">{[10, 20, 50].map(value => <option key={value} value={value}>{value}</option>)}</select>
        </label>
      </div>
      {listError && <p role="alert" className="bg-red-50 border border-red-200 p-3 rounded-lg text-red-700">{listError}</p>}
      <div className="bg-white border rounded-lg overflow-hidden">
        <DataTable data={result?.content || []} columns={columns} isLoading={loading} keyExtractor={row => row.id} />
        <div className="flex flex-wrap gap-3 items-center justify-between p-4 border-t text-sm text-gray-600">
          <span>Tổng: {result?.totalElements || 0} · Trang {result?.totalPages ? page + 1 : 0}/{result?.totalPages || 0}</span>
          <div className="flex gap-4"><button disabled={loading || page === 0} onClick={() => setPage(p => p - 1)} className="disabled:opacity-40">Trước</button><button disabled={loading || !result || page + 1 >= result.totalPages} onClick={() => setPage(p => p + 1)} className="disabled:opacity-40">Sau</button></div>
        </div>
      </div>
      <p className="text-xs text-gray-500">Một đơn hiện chỉ được gửi một yêu cầu hủy, kể cả khi yêu cầu đã bị từ chối. Duyệt hủy và hoàn tiền là hai nghiệp vụ riêng.</p>

      <FormModal isOpen={selectedId !== null} onClose={close} title={`Chi tiết yêu cầu hủy #${selectedId || ''}`} maxWidth="max-w-3xl">
        {detailLoading && <p role="status" className="text-gray-500 py-8 text-center">Đang tải chi tiết mới nhất...</p>}
        {detailError && <div role="alert" className="text-red-700 p-3 bg-red-50 rounded-lg">{detailError}<button className="ml-3 underline" onClick={() => setDetailReload(n => n + 1)}>Thử lại</button></div>}
        {!detailLoading && detail && <>
          <CancelRequestDetails request={detail} />
          {resolveError && <p role="alert" className="my-3 text-red-700 bg-red-50 rounded-lg p-3">{resolveError}</p>}
          {!customerView && detail.status === 'PENDING' && <div className="mt-5 border-t pt-4">
            {!detail.canApprove && <p className="text-sm text-amber-800 mb-3">Đơn hiện không đủ điều kiện duyệt hủy (trạng thái đơn/vé đã đổi hoặc chuyến đã khởi hành). Bạn có thể từ chối kèm lý do; máy chủ luôn kiểm tra lại trước khi duyệt.</p>}
            {decision === null ? <div className="flex justify-end gap-3">
              <button onClick={() => { setDecision('reject'); setResolveError(''); }} className="inline-flex items-center gap-2 border border-red-300 text-red-700 rounded-md px-4 py-2"><XCircle size={16} />Từ chối</button>
              <button disabled={!detail.canApprove} onClick={() => { setDecision('approve'); setResolveError(''); }} className="inline-flex items-center gap-2 bg-green-700 text-white rounded-md px-4 py-2 disabled:opacity-40"><CheckCircle size={16} />Duyệt hủy</button>
            </div> : <form onSubmit={resolve} className="space-y-3">
              <h4 className="font-semibold text-gray-900">{decision === 'approve' ? 'Xác nhận duyệt hủy toàn bộ đơn vé?' : 'Từ chối yêu cầu hủy vé'}</h4>
              {decision === 'reject' ? <label className="block text-sm text-gray-700">Lý do từ chối (bắt buộc)
                <textarea autoFocus required maxLength={2000} disabled={saving} value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="block w-full border rounded-lg p-3 mt-1" rows={3} />
                <span className="text-xs text-gray-500">{rejectReason.length}/2000 ký tự. Khách hàng sẽ thấy lý do này.</span>
              </label> : <p className="text-sm text-gray-600">Tất cả vé trong đơn BKG-{detail.bookingId} sẽ chuyển sang đã hủy. Thao tác này không tự hoàn tiền.</p>}
              <div className="flex justify-end gap-3"><button type="button" disabled={saving} onClick={() => setDecision(null)} className="border rounded-md px-4 py-2 disabled:opacity-50">Quay lại</button><button type="submit" disabled={saving || (decision === 'reject' && !rejectReason.trim())} className={`text-white rounded-md px-4 py-2 disabled:opacity-50 ${decision === 'approve' ? 'bg-green-700' : 'bg-red-700'}`}>{saving ? 'Đang xử lý...' : 'Xác nhận'}</button></div>
            </form>}
          </div>}
        </>}
      </FormModal>
    </div>
  );
};
