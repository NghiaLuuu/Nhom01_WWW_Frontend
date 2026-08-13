import { api } from './api';
import { Trip } from '../features/admin/api/trip.service';
import { User } from '../features/admin/api/user.service';

export interface Ticket {
  id: number;
  bookingCode: string;
  trip: Trip;
  customer?: User;
  seats: string[];
  totalPrice: number;
  status: 'PAID' | 'CANCEL_REQUESTED' | 'CANCELLED' | 'USED';
  createdAt: string;
}

export const TicketService = {
  // Customer methods
  getMyHistory: async () => {
    const res = await api.get('/bookings/my-history');
    return res.data;
  },
  requestCancel: async (id: number) => {
    const res = await api.patch(`/bookings/${id}/request-cancel`);
    return res.data;
  },

  // Admin/Staff methods
  getAllTickets: async () => {
    const res = await api.get('/admin/bookings'); // Assuming this endpoint for staff
    return res.data;
  },
  approveCancel: async (id: number) => {
    const res = await api.patch(`/admin/bookings/${id}/approve-cancel`);
    return res.data;
  },
  rejectCancel: async (id: number) => {
    const res = await api.patch(`/admin/bookings/${id}/reject-cancel`);
    return res.data;
  }
};
