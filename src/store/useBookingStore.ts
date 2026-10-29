import { create } from 'zustand';
import { type Trip } from '../features/admin/api/trip.service';

interface BookingState {
  selectedTrip: Trip | null;
  selectedSeats: string[];
  selectedSeatIds: number[];
  holdExpiresAt: number | null; // Timestamp
  
  setSelectedTrip: (trip: Trip | null) => void;
  toggleSeat: (seatId: number, seatName: string, maxSeats: number) => void;
  startHoldTimer: () => void;
  clearBooking: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedTrip: null,
  selectedSeats: [],
  selectedSeatIds: [],
  holdExpiresAt: null,

  setSelectedTrip: (trip) => set({ selectedTrip: trip, selectedSeats: [], selectedSeatIds: [], holdExpiresAt: null }),
  
  toggleSeat: (seatId, seatName, maxSeats) => {
    const state = get();
    const seats = state.selectedSeats;
    const seatIds = state.selectedSeatIds;
    if (seats.includes(seatName)) {
      const next = {
        seats: seats.filter(name => name !== seatName),
        ids: seatIds.filter(id => id !== seatId),
      };
      set({ selectedSeats: next.seats, selectedSeatIds: next.ids });
    } else {
      if (seats.length < maxSeats) {
        set({ selectedSeats: [...seats, seatName], selectedSeatIds: [...seatIds, seatId] });
      }
    }
  },

  startHoldTimer: () => {
    // Set timer for 5 minutes from now
    set({ holdExpiresAt: Date.now() + 5 * 60 * 1000 });
  },

  clearBooking: () => {
    set({
      selectedTrip: null, selectedSeats: [], selectedSeatIds: [], holdExpiresAt: null,
    });
  }
}));
