import { api } from './api';
import { type Trip } from '../features/admin/api/trip.service';
import { type User } from '../features/admin/api/user.service';

export interface Ticket {
  id: number;
  bookingCode: string;
  trip: Trip;
  customer?: User;
  seats: string[];
  totalPrice: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'CANCEL_REQUESTED' | 'CANCELLED' | 'USED';
  createdAt: string;
  cancelRequestId?: number;
  cancelRequestStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  cancelReason?: string;
  rejectReason?: string;
  canCancel: boolean;
}

export const TicketService = {
  // Customer methods
  getMyHistory: async () => {
    const res = await api.get('/web/bookings/my-history');
    return res.data;
  },
  requestCancel: async (id: number, reason: string) => {
    const res = await api.post('/cancel-requests', { bookingId: id, reason });
    return res.data;
  },

  // Admin/Staff methods
  getAllTickets: async () => {
    const res = await api.get('/web/bookings');
    return res.data;
  },
  approveCancel: async (id: number) => {
    const res = await api.patch(`/cancel-requests/${id}/resolve`, { isApproved: true });
    return res.data;
  },
  rejectCancel: async (id: number, rejectReason: string) => {
    const res = await api.patch(`/cancel-requests/${id}/resolve`, { isApproved: false, rejectReason });
    return res.data;
  }
};
