import { create } from 'zustand';
import { type Trip } from '../features/admin/api/trip.service';
import type { BookingItem, SeatItem } from '../features/booking/types/booking.types';

interface BookingState {
  selectedTrip: Trip | null;
  selectedSeats: SeatItem[];
  currentBooking: BookingItem | null;
  holdExpiresAt: number | null; // Timestamp (ms)
  
  setSelectedTrip: (trip: Trip | null) => void;
  toggleSeatItem: (seat: SeatItem, maxSeats?: number) => void;
  setCurrentBooking: (booking: BookingItem | null) => void;
  setHoldExpiresAt: (timestamp: number | null) => void;
  clearBooking: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedTrip: null,
  selectedSeats: [],
  currentBooking: null,
  holdExpiresAt: null,

  setSelectedTrip: (trip) => set({ selectedTrip: trip, selectedSeats: [], currentBooking: null, holdExpiresAt: null }),
  
  toggleSeatItem: (seat, maxSeats = 5) => {
    const { selectedSeats } = get();
    const exists = selectedSeats.some(s => s.id === seat.id);
    if (exists) {
      set({ selectedSeats: selectedSeats.filter(s => s.id !== seat.id) });
    } else {
      if (selectedSeats.length < maxSeats) {
        set({ selectedSeats: [...selectedSeats, seat] });
      }
    }
  },

  setCurrentBooking: (booking) => {
    let expiresAt: number | null = null;
    if (booking?.holdExpiresAt) {
      expiresAt = new Date(booking.holdExpiresAt).getTime();
    }
    set({ currentBooking: booking, holdExpiresAt: expiresAt });
  },

  setHoldExpiresAt: (timestamp) => set({ holdExpiresAt: timestamp }),

  clearBooking: () => {
    set({ selectedTrip: null, selectedSeats: [], currentBooking: null, holdExpiresAt: null });
  }
}));

