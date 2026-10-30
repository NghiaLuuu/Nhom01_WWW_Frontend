import type { CancelRequest, CancelStatus } from '../../../services/cancelrequest.service';
import { cancelStatusLabels, formatCancelDate, formatCancelMoney } from '../utils';

export const CancelStatusBadge = ({ status }: { status: CancelStatus }) => (
  <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${status === 'PENDING' ? 'bg-amber-100 text-amber-800' : status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
    {cancelStatusLabels[status]}
  </span>
);

export const CancelRequestDetails = ({ request }: { request: CancelRequest }) => (
  <div className="space-y-4 text-sm text-gray-700">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="font-semibold">Yêu cầu #{request.id} · Đơn BKG-{request.bookingId}</span>
      <CancelStatusBadge status={request.status} />
    </div>
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 rounded-lg p-4">
      <div><dt className="text-gray-500">Khách hàng</dt><dd className="font-medium">{request.customerName}</dd></div>
      <div><dt className="text-gray-500">Điện thoại</dt><dd>{request.customerPhone || '—'}</dd></div>
      <div><dt className="text-gray-500">Tuyến đường</dt><dd>{request.departureLocation || '—'} → {request.arrivalLocation || '—'}</dd></div>
      <div><dt className="text-gray-500">Chuyến xe / biển số</dt><dd>#{request.tripId} · {request.licensePlate || '—'}</dd></div>
      <div><dt className="text-gray-500">Khởi hành</dt><dd>{formatCancelDate(request.departureTime)}</dd></div>
      <div><dt className="text-gray-500">Tổng tiền đơn</dt><dd className="font-semibold text-blue-700">{formatCancelMoney(request.bookingAmount)}</dd></div>
      <div><dt className="text-gray-500">Trạng thái đơn</dt><dd>{request.bookingStatus}</dd></div>
      <div><dt className="text-gray-500">Thời điểm gửi</dt><dd>{formatCancelDate(request.createdAt)}</dd></div>
    </dl>
    <section><h4 className="font-semibold mb-1">Lý do khách yêu cầu hủy</h4><p className="whitespace-pre-wrap break-words border rounded-lg p-3">{request.reason || 'Không có lý do được lưu trong dữ liệu cũ.'}</p></section>
    <section>
      <h4 className="font-semibold mb-2">Vé trong đơn ({request.tickets.length})</h4>
      <div className="overflow-auto max-h-48 border rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50"><tr><th className="p-2">Mã vé</th><th className="p-2">Ghế</th><th className="p-2">Trạng thái</th><th className="p-2 text-right">Giá</th></tr></thead>
          <tbody>{request.tickets.map(ticket => <tr key={ticket.id} className="border-t"><td className="p-2 font-mono">{ticket.ticketCode}</td><td className="p-2">{ticket.seatName || '—'}</td><td className="p-2">{ticket.status}</td><td className="p-2 text-right">{formatCancelMoney(ticket.price)}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
    {request.status !== 'PENDING' && <section className="rounded-lg border p-3 space-y-2">
      <h4 className="font-semibold">Kết quả xử lý</h4>
      <p>{cancelStatusLabels[request.status]} bởi <strong>{request.resolvedByName || 'Nhân viên'}</strong> · {formatCancelDate(request.resolvedAt)}</p>
      {request.status === 'REJECTED' && <p className="whitespace-pre-wrap break-words text-red-700">Lý do từ chối: {request.rejectReason || '—'}</p>}
    </section>}
    <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">Duyệt yêu cầu sẽ hủy toàn bộ vé trong đơn. Kết quả duyệt hủy không phải xác nhận hoàn tiền; thanh toán được giữ nguyên để đối soát.</p>
  </div>
);
