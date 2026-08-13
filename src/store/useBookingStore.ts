import { create } from 'zustand';
import { Trip } from '../admin/api/trip.service';

interface BookingState {
  selectedTrip: Trip | null;
  selectedSeats: string[];
  holdExpiresAt: number | null; // Timestamp
  
  setSelectedTrip: (trip: Trip | null) => void;
  toggleSeat: (seatId: string, maxSeats: number) => void;
  startHoldTimer: () => void;
  clearBooking: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedTrip: null,
  selectedSeats: [],
  holdExpiresAt: null,

  setSelectedTrip: (trip) => set({ selectedTrip: trip, selectedSeats: [], holdExpiresAt: null }),
  
  toggleSeat: (seatId, maxSeats) => {
    const { selectedSeats } = get();
    if (selectedSeats.includes(seatId)) {
      set({ selectedSeats: selectedSeats.filter(id => id !== seatId) });
    } else {
      if (selectedSeats.length < maxSeats) {
        set({ selectedSeats: [...selectedSeats, seatId] });
      }
    }
  },

  startHoldTimer: () => {
    // Set timer for 5 minutes from now
    set({ holdExpiresAt: Date.now() + 5 * 60 * 1000 });
  },

  clearBooking: () => {
    set({ selectedTrip: null, selectedSeats: [], holdExpiresAt: null });
  }
}));
