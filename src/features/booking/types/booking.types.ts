export type BookingStatus = 'PAID' | 'PENDING_PAYMENT' | 'CANCELLED' | 'COMPLETED' | 'CANCEL_REQUESTED' | 'EXPIRED';

export interface RouteInfo {
  id: number;
  departureLocation: string;
  arrivalLocation: string;
  distanceKm?: number;
  durationMinutes?: number;
  basePrice?: number;
  status?: boolean;
}

export interface VehicleInfo {
  id: number;
  licensePlate: string;
  type: string;
  capacity: number;
  status?: string;
}

export interface TripInfo {
  id: number;
  route: RouteInfo;
  vehicle: VehicleInfo;
  departureTime: string;
  price: number;
  status?: string;
}

export interface CustomerInfo {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
}

export interface SeatItem {
  id: number;
  seatName: string;
  floor?: number;
  isBooked?: boolean;
}

export interface TicketItem {
  id: number;
  ticketCode: string;
  seat: SeatItem;
  seatNumber?: string;
  price: number;
  status: 'PENDING' | 'ISSUED' | 'USED' | 'CANCELLED' | 'RELEASED' | string;
  qrCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingItem {
  id: number;
  bookingCode?: string;
  customer?: CustomerInfo;
  trip: TripInfo;
  status: BookingStatus;
  totalPrice: number;
  holdExpiresAt?: string;
  createdAt: string;
  updatedAt?: string;
  holdExpired?: boolean;
  tickets?: TicketItem[];
  seats?: string[];
  pickupPoint?: string;
  dropoffPoint?: string;
  paymentMethod?: string;
}

export interface PaymentItem {
  id: number;
  amount: number;
  paymentMethod: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | string;
  transactionId?: string;
  createdAt: string;
}

export interface CancelRequestItem {
  id: number;
  booking: BookingItem;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectReason?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface CancelPolicy {
  timeBeforeDeparture: string;
  refundPercentage: number;
  description: string;
}

export interface CancelBookingPayload {
  bookingId: number;
  reason: string;
  bankAccount?: string;
  accountNumber?: string;
  bankName?: string;
  accountHolder?: string;
}
