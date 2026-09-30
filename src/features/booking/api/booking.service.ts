import { api } from '../../../services/api';
import type { 
  BookingItem, 
  CancelBookingPayload, 
  SeatItem, 
  TicketItem, 
  PaymentItem,
  CancelRequestItem 
} from '../types/booking.types';

export interface CreateBookingPayload {
  tripId: number;
  seatIds: number[];
}

export interface SearchBookingParams {
  phoneNumber?: string;
  ticketCode?: string;
}

export const BookingService = {
  // Trips
  getTripById: async (tripId: number | string) => {
    const res = await api.get(`/trips/${tripId}`);
    return res.data;
  },

  searchTrips: async (departure: string, arrival: string, date: string) => {
    const res = await api.get('/trips/search', {
      params: {
        departureLocation: departure,
        arrivalLocation: arrival,
        date: date,
      },
    });
    return res.data;
  },

  // Seats & Occupancy
  getSeatsByVehicle: async (vehicleId: number): Promise<{ success: boolean; data: SeatItem[]; message?: string }> => {
    const res = await api.get(`/seats/vehicle/${vehicleId}`);
    return res.data;
  },

  getOccupiedSeats: async (tripId: number): Promise<{ success: boolean; data: number[]; message?: string }> => {
    const res = await api.get(`/tickets/occupied-seats/${tripId}`);
    return res.data;
  },

  // Booking CRUD & Hold
  createBooking: async (payload: CreateBookingPayload): Promise<{ success: boolean; data: BookingItem; message?: string }> => {
    const res = await api.post('/bookings', payload);
    return res.data;
  },

  getMyHistory: async (): Promise<{ success: boolean; data: BookingItem[]; message?: string }> => {
    const res = await api.get('/bookings/my-history');
    return res.data;
  },

  getBookingById: async (id: number | string): Promise<{ success: boolean; data: BookingItem; message?: string }> => {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },

  searchBookings: async (params: SearchBookingParams): Promise<{ success: boolean; data: BookingItem[]; message?: string }> => {
    const res = await api.get('/bookings/search', { params });
    return res.data;
  },

  cancelPendingBooking: async (bookingId: number): Promise<{ success: boolean; data: BookingItem; message?: string }> => {
    const res = await api.post(`/bookings/${bookingId}/cancel`);
    return res.data;
  },

  // Payments
  createVNPayPaymentUrl: async (bookingId: number): Promise<{ success: boolean; data: string; message?: string }> => {
    const res = await api.post('/payments/vnpay/create-link', { bookingId });
    return res.data;
  },

  processVNPayReturn: async (params: Record<string, string>): Promise<{ success: boolean; data: PaymentItem; message?: string }> => {
    const res = await api.get('/payments/vnpay/return', { params });
    return res.data;
  },

  testInstantPayment: async (bookingId: number): Promise<{ success: boolean; data: PaymentItem; message?: string }> => {
    const res = await api.post('/payments/webhook', {
      bookingId,
      code: '00',
      transactionId: `DEMO-${Date.now()}`
    });
    return res.data;
  },

  getPaymentByBookingId: async (bookingId: number): Promise<{ success: boolean; data: PaymentItem; message?: string }> => {
    const res = await api.get(`/payments/booking/${bookingId}`);
    return res.data;
  },

  // Tickets & QR
  getTicketsByBookingId: async (bookingId: number): Promise<{ success: boolean; data: TicketItem[]; message?: string }> => {
    const res = await api.get(`/tickets/booking/${bookingId}`);
    return res.data;
  },

  getTicketByCode: async (ticketCode: string): Promise<{ success: boolean; data: TicketItem; message?: string }> => {
    const res = await api.get(`/tickets/code/${ticketCode}`);
    return res.data;
  },

  getTicketQrCode: async (ticketId: number): Promise<{ success: boolean; data: string; message?: string }> => {
    const res = await api.get(`/tickets/${ticketId}/qr`);
    return res.data;
  },

  updateTicketStatus: async (ticketId: number, status: string): Promise<{ success: boolean; data: TicketItem; message?: string }> => {
    const res = await api.patch(`/tickets/${ticketId}/status`, { status });
    return res.data;
  },

  // Cancel Requests
  requestCancelBooking: async (payload: CancelBookingPayload): Promise<{ success: boolean; data: CancelRequestItem; message?: string }> => {
    const res = await api.post('/cancel-requests', {
      bookingId: payload.bookingId,
      reason: payload.reason,
    });
    return res.data;
  },

  getPendingCancelRequests: async (): Promise<{ success: boolean; data: CancelRequestItem[]; message?: string }> => {
    const res = await api.get('/cancel-requests');
    return res.data;
  },

  resolveCancelRequest: async (requestId: number, isApproved: boolean, rejectReason?: string): Promise<{ success: boolean; data: CancelRequestItem; message?: string }> => {
    const res = await api.patch(`/cancel-requests/${requestId}/resolve`, {
      isApproved,
      rejectReason: rejectReason || '',
    });
    return res.data;
  }
};

