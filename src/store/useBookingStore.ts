import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Trip } from '../features/admin/api/trip.service';
import type { BookingItem, SeatItem } from '../features/booking/types/booking.types';

interface BookingState {
  selectedTrip: Trip | null;
  selectedSeats: string[];
  selectedSeatItems: SeatItem[];
  currentBooking: BookingItem | null;
  holdExpiresAt: number | null; // Timestamp (ms)
  
  setSelectedTrip: (trip: Trip | null) => void;
  toggleSeat: (seatId: string, maxSeats?: number) => void;
  toggleSeatItem: (seat: SeatItem, maxSeats?: number) => void;
  setCurrentBooking: (booking: BookingItem | null) => void;
  setHoldExpiresAt: (timestamp: number | null) => void;
  startHoldTimer: () => void;
  clearBooking: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      selectedTrip: null,
      selectedSeats: [],
      selectedSeatItems: [],
      currentBooking: null,
      holdExpiresAt: null,

      setSelectedTrip: (trip) => set({ 
        selectedTrip: trip, 
        selectedSeats: [], 
        selectedSeatItems: [], 
        currentBooking: null, 
        holdExpiresAt: null 
      }),
      
      toggleSeat: (seatId, maxSeats = 5) => {
        const { selectedSeats } = get();
        if (selectedSeats.includes(seatId)) {
          set({ selectedSeats: selectedSeats.filter(id => id !== seatId) });
        } else {
          if (selectedSeats.length < maxSeats) {
            set({ selectedSeats: [...selectedSeats, seatId] });
          }
        }
      },

      toggleSeatItem: (seat, maxSeats = 5) => {
        const { selectedSeatItems, selectedSeats } = get();
        const exists = selectedSeatItems.some(s => s.id === seat.id);
        if (exists) {
          set({ 
            selectedSeatItems: selectedSeatItems.filter(s => s.id !== seat.id),
            selectedSeats: selectedSeats.filter(id => id !== (seat.seatName || String(seat.id)))
          });
        } else {
          if (selectedSeatItems.length < maxSeats) {
            set({ 
              selectedSeatItems: [...selectedSeatItems, seat],
              selectedSeats: [...selectedSeats, seat.seatName || String(seat.id)]
            });
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

      startHoldTimer: () => {
        set({ holdExpiresAt: Date.now() + 5 * 60 * 1000 });
      },

      setHoldExpiresAt: (timestamp) => set({ holdExpiresAt: timestamp }),

      clearBooking: () => {
        set({ 
          selectedTrip: null, 
          selectedSeats: [], 
          selectedSeatItems: [], 
          currentBooking: null, 
          holdExpiresAt: null 
        });
      }
    }),
    {
      name: 'vexe-booking-storage'
    }
  )
);
