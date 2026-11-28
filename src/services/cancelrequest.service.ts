import { api } from './api';

export type CancelStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export interface CancelRequest {
  id: number;
  bookingId: number;
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  tripId: number;
  departureTime: string;
  departureLocation: string | null;
  arrivalLocation: string | null;
  licensePlate: string | null;
  bookingAmount: number;
  bookingStatus: string;
  status: CancelStatus;
  reason: string | null;
  rejectReason: string | null;
  resolvedBy: string | null;
  resolvedByName: string | null;
  createdAt: string;
  resolvedAt: string | null;
  canApprove: boolean;
  tickets: { id: number; ticketCode: string; status: string; seatName: string | null; price: number }[];
}
export interface CancelRequestPage {
  content: CancelRequest[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
export interface CancelFilters {
  status?: CancelStatus;
  bookingId?: number;
  page: number;
  size: number;
}
const unwrap = <T,>(body: { success: boolean; message: string; data: T }): T => {
  if (!body.success) throw new Error(body.message || 'Không thể xử lý yêu cầu hủy vé');
  return body.data;
};

export const CancelRequestService = {
  search: async (filters: CancelFilters, signal?: AbortSignal): Promise<CancelRequestPage> =>
    unwrap((await api.get('/cancel-requests', { params: filters, signal })).data),
  mine: async (filters: CancelFilters, signal?: AbortSignal): Promise<CancelRequestPage> =>
    unwrap((await api.get('/cancel-requests/mine', { params: filters, signal })).data),
  detail: async (id: number, customerView: boolean, signal?: AbortSignal): Promise<CancelRequest> =>
    unwrap((await api.get(`/cancel-requests/${customerView ? 'mine/' : ''}${id}`, { signal })).data),
  submit: async (bookingId: number, reason: string): Promise<CancelRequest> =>
    unwrap((await api.post('/cancel-requests', { bookingId, reason })).data),
  resolve: async (id: number, isApproved: boolean, rejectReason?: string): Promise<CancelRequest> =>
    unwrap((await api.patch(`/cancel-requests/${id}/resolve`, { isApproved, rejectReason })).data),
};
