import { api } from '../../../services/api';
import { type Trip } from '../../admin/api/trip.service';
import { type Route } from '../../admin/api/route.service';

export interface Seat {
  id: number;
  seatName: string;
  floor: number;
  isBooked: boolean;
  isHeld: boolean;
  isAvailable: boolean;
}

export interface TicketRequest {
  tripId: number;
  seatIds: number[];
  seats: string[];
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface RouteLocations {
  departures: string[];
  arrivals: string[];
}

export const BookingService = {
  getTripById: async (tripId: number | string) => {
    const res = await api.get(`/trips/${tripId}`);
    return res.data;
  },

  searchTrips: async (departure: string, arrival: string, date: string) => {
    const res = await api.get('/trips/search', {
      params: {
        departureLocation: departure,
        arrivalLocation: arrival,
        date: date
      }
    });
    return res.data;
  },
  
  getSeatLayout: async (tripId: number): Promise<{ success: boolean; data: Seat[] }> => {
    try {
      const res = await api.get(`/seats/trip/${tripId}`);
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data;
      }
    } catch (err) {
      console.warn('Không thể tải sơ đồ ghế từ Backend, kích hoạt chế độ dự phòng:', err);
    }

    // Dự phòng an toàn (Fallback) nếu Backend chưa seed ghế hoặc chưa chạy API:
    const fallbackSeats: Seat[] = Array.from({ length: 36 }, (_, i) => ({
      id: i + 1,
      seatName: `${i < 18 ? 'A' : 'B'}${String((i % 18) + 1).padStart(2, '0')}`,
      floor: i < 18 ? 1 : 2,
      isBooked: i % 7 === 0,
      isHeld: false,
      isAvailable: i % 7 !== 0
    }));
    return { success: true, data: fallbackSeats };
  },

  getActiveRoutes: async (): Promise<{ success: boolean; data: Route[] }> => {
    try {
      const res = await api.get('/routes/active');
      return res.data;
    } catch (err) {
      // Fallback lấy toàn bộ routes nếu API active chưa sẵn
      const res = await api.get('/routes');
      return res.data;
    }
  },

  getRouteLocations: async (): Promise<{ success: boolean; data: RouteLocations }> => {
    try {
      const res = await api.get('/routes/locations');
      return res.data;
    } catch (err) {
      return {
        success: true,
        data: {
          departures: ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Nha Trang', 'Đà Lạt'],
          arrivals: ['Đà Lạt', 'Vũng Tàu', 'Phan Thiết', 'Nha Trang', 'Quy Nhơn', 'Huế', 'Sa Pa']
        }
      };
    }
  },

  searchRoutes: async (departure?: string, arrival?: string): Promise<{ success: boolean; data: Route[] }> => {
    const res = await api.get('/routes/search', {
      params: { departure, arrival }
    });
    return res.data;
  },

  createBooking: async (tripId: number, seatIds: number[]) => {
    const res = await api.post('/bookings', {
      tripId,
      seatIds
    });
    return res.data;
  },

  createMockPayment: async (data: TicketRequest) => {
    // Thử gọi API booking thật nếu có thể, hoặc mock payment success
    try {
      if (data.seatIds && data.seatIds.length > 0) {
        await api.post('/bookings', {
          tripId: data.tripId,
          seatIds: data.seatIds
        });
      }
    } catch (e) {
      console.warn('Booking API background sync:', e);
    }

    return new Promise<{ success: boolean; data: any }>((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          data: {
            bookingId: `BKG-${Math.floor(100000 + Math.random() * 900000)}`,
            ...data,
            status: 'PAID'
          }
        });
      }, 1000);
    });
  }
};
