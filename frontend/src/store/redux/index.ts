import { combineReducers } from "@reduxjs/toolkit";
import { baseApi } from "../api/baseApi";
import authReducer from "../slices/authSlice";
import bookingReducer from "../slices/bookingSlice";
import movieReducer from "../slices/movieSlice";

export const reducers = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
  booking: bookingReducer,
  movie: movieReducer,
});

export default reducers;

export type GlobalState = ReturnType<typeof reducers>;
