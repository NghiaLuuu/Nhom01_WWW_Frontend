import { api } from '../../../services/api';
import { RouteService, type Route } from '../../admin/api/route.service';

export interface RouteLocations {
  departures: string[];
  arrivals: string[];
}

export interface Seat {
  seatId: number;
  id: string;
  seatName: string;
  floor: number;
  isBooked: boolean;
  isHeld: boolean;
}

export interface BookingRequest {
  tripId: number;
  seatIds: number[];
}

export interface MockPaymentRequest {
  tripId: number;
  seats: string[];
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export const BookingService = {
  getTripById: async (tripId: number | string) => {
    const res = await api.get(`/trips/${tripId}`);
    return res.data;
  },
  searchTrips: async (departure: string, arrival: string, date: string) => {
    // Calling the endpoint we saw in TripController:
    // /api/trips/search?departureLocation=...&arrivalLocation=...&date=...
    const res = await api.get('/trips/search', {
      params: {
        departureLocation: departure,
        arrivalLocation: arrival,
        date: date
      }
    });
    return res.data;
  },
  getRouteLocations: async (): Promise<{ success: boolean; data: RouteLocations }> => {
    const res = await RouteService.getAll();
    const routes = (res.data || []) as Route[];
    return {
      success: Boolean(res.success),
      data: {
        departures: [...new Set(routes.map(route => route.departureLocation))].sort(),
        arrivals: [...new Set(routes.map(route => route.arrivalLocation))].sort(),
      },
    };
  },
  
  getSeatLayout: async (tripId: number) => {
    const res = await api.get(`/trips/${tripId}/seats`);
    return res.data;
  },

  createMockPayment: async (data: MockPaymentRequest) => {
    return new Promise<{ success: boolean; data: MockPaymentRequest & { bookingId: string; status: string } }>((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            bookingId: `BKG-${Math.floor(100000 + Math.random() * 900000)}`,
            ...data,
            status: 'PAID',
          },
        });
      }, 800);
    });
  }
};
