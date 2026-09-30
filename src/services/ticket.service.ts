import { api } from './api';
import { type Trip } from '../features/admin/api/trip.service';
import { type User } from '../features/admin/api/user.service';

export interface Ticket {
  id: number;
  bookingCode?: string;
  trip: Trip;
  customer?: User;
  seats?: string[];
  totalPrice: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'CANCEL_REQUESTED' | 'CANCELLED' | 'USED' | 'EXPIRED' | string;
  createdAt: string;
  tickets?: any[];
}

export const TicketService = {
  // Customer methods
  getMyHistory: async () => {
    const res = await api.get('/bookings/my-history');
    return res.data;
  },

  // Admin/Staff methods
  getAllBookings: async (phoneNumber?: string, ticketCode?: string) => {
    const res = await api.get('/bookings/search', {
      params: { phoneNumber, ticketCode }
    });
    return res.data;
  },

  getTicketsByBooking: async (bookingId: number) => {
    const res = await api.get(`/tickets/booking/${bookingId}`);
    return res.data;
  },

  getTicketByCode: async (ticketCode: string) => {
    const res = await api.get(`/tickets/code/${ticketCode}`);
    return res.data;
  },

  updateTicketStatus: async (ticketId: number, status: string) => {
    const res = await api.patch(`/tickets/${ticketId}/status`, { status });
    return res.data;
  },

  getCancelRequests: async () => {
    const res = await api.get('/cancel-requests');
    return res.data;
  },

  approveCancel: async (requestId: number) => {
    const res = await api.patch(`/cancel-requests/${requestId}/resolve`, {
      isApproved: true,
      rejectReason: ''
    });
    return res.data;
  },

  rejectCancel: async (requestId: number, rejectReason: string) => {
    const res = await api.patch(`/cancel-requests/${requestId}/resolve`, {
      isApproved: false,
      rejectReason
    });
    return res.data;
  }
};

