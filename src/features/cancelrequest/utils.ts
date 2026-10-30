import type { CancelStatus } from '../../services/cancelrequest.service';

export const cancelStatusLabels: Record<CancelStatus, string> = {
  PENDING: 'Chờ xử lý', APPROVED: 'Đã duyệt hủy', REJECTED: 'Đã từ chối',
};
export const formatCancelDate = (value: string | null) => value ? new Date(value).toLocaleString('vi-VN') : '—';
export const formatCancelMoney = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
