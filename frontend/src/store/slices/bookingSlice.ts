import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SeatSelection } from "@/types";

interface BookingState {
  selectedShowId: string | null;
  selectedSeats: SeatSelection[];
  lockExpirationTime: number | null; // Timestamp in milliseconds
  idempotencyKey: string | null;
  activeBookingId: string | null;
}

const initialState: BookingState = {
  selectedShowId: null,
  selectedSeats: [],
  lockExpirationTime: null,
  idempotencyKey: null,
  activeBookingId: null,
};

export const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setSelectedShowId: (state, action: PayloadAction<string | null>) => {
      if (state.selectedShowId !== action.payload) {
        state.selectedShowId = action.payload;
        state.selectedSeats = [];
        state.lockExpirationTime = null;
        state.activeBookingId = null;
        state.idempotencyKey = null;
      }
    },
    toggleSeat: (state, action: PayloadAction<SeatSelection>) => {
      const seat = action.payload;
      const index = state.selectedSeats.findIndex(
        (s) => s.seatId === seat.seatId
      );

      if (index >= 0) {
        state.selectedSeats.splice(index, 1);
      } else {
        // Enforce maximum 10 seats per booking
        if (state.selectedSeats.length < 10) {
          state.selectedSeats.push(seat);
        }
      }
    },
    clearSelectedSeats: (state) => {
      state.selectedSeats = [];
    },
    setLockExpirationTime: (state, action: PayloadAction<number | null>) => {
      state.lockExpirationTime = action.payload;
    },
    setActiveBookingId: (state, action: PayloadAction<string | null>) => {
      state.activeBookingId = action.payload;
    },
    generateIdempotencyKey: (state) => {
      state.idempotencyKey = crypto.randomUUID();
    },
    resetBooking: (state) => {
      state.selectedShowId = null;
      state.selectedSeats = [];
      state.lockExpirationTime = null;
      state.idempotencyKey = null;
      state.activeBookingId = null;
    },
  },
});

export const {
  setSelectedShowId,
  toggleSeat,
  clearSelectedSeats,
  setLockExpirationTime,
  setActiveBookingId,
  generateIdempotencyKey,
  resetBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
