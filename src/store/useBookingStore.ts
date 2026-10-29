import { create } from 'zustand';
import { type Trip } from '../features/admin/api/trip.service';

interface BookingState {
  selectedTrip: Trip | null;
  selectedSeats: string[]; // e.g. ["A01", "A02"] for display
  selectedSeatIds: number[]; // e.g. [1, 2] for API payloads
  holdExpiresAt: number | null; // Timestamp
  
  setSelectedTrip: (trip: Trip | null) => void;
  toggleSeat: (seatId: number, seatName: string, maxSeats?: number) => void;
  startHoldTimer: () => void;
  clearBooking: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedTrip: null,
  selectedSeats: [],
  selectedSeatIds: [],
  holdExpiresAt: null,

  setSelectedTrip: (trip) => set({ 
    selectedTrip: trip, 
    selectedSeats: [], 
    selectedSeatIds: [],
    holdExpiresAt: null 
  }),
  
  toggleSeat: (seatId, seatName, maxSeats = 5) => {
    const { selectedSeatIds, selectedSeats } = get();
    if (selectedSeatIds.includes(seatId)) {
      set({ 
        selectedSeatIds: selectedSeatIds.filter(id => id !== seatId),
        selectedSeats: selectedSeats.filter(name => name !== seatName)
      });
    } else {
      if (selectedSeatIds.length < maxSeats) {
        set({ 
          selectedSeatIds: [...selectedSeatIds, seatId],
          selectedSeats: [...selectedSeats, seatName]
        });
      }
    }
  },

  startHoldTimer: () => {
    // Set timer for 5 minutes from now
    set({ holdExpiresAt: Date.now() + 5 * 60 * 1000 });
  },

  clearBooking: () => {
    set({ selectedTrip: null, selectedSeats: [], selectedSeatIds: [], holdExpiresAt: null });
  }
}));
