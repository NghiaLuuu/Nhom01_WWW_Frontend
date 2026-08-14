import { api } from '../../../services/api';

export interface Seat {
  id: string; // e.g. "A1", "A2"
  isBooked: boolean;
}

export interface TicketRequest {
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
  
  getSeatLayout: async (tripId: number) => {
    // Mocking seat layout since backend might not have this endpoint yet.
    // In a real app, you would fetch /api/trips/{tripId}/seats
    return new Promise<{ success: boolean; data: Seat[] }>((resolve) => {
      setTimeout(() => {
        const mockSeats: Seat[] = Array.from({ length: 36 }, (_, i) => ({
          id: `${i < 18 ? 'A' : 'B'}${i % 18 + 1}`,
          isBooked: Math.random() < 0.3 // 30% chance a seat is already booked
        }));
        resolve({ success: true, data: mockSeats });
      }, 500);
    });
  },

  createMockPayment: async (data: TicketRequest) => {
    // Simulate a mock payment processing time
    return new Promise<{ success: boolean; data: any }>((resolve) => {
      setTimeout(() => {
        // Return a mock success response with a fake booking ID
        resolve({ 
          success: true, 
          data: {
            bookingId: `BKG-${Math.floor(100000 + Math.random() * 900000)}`,
            ...data,
            status: 'PAID'
          }
        });
      }, 1500);
    });
  }
};
