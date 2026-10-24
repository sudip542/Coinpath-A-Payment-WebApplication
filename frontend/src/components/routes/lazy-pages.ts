import { lazy } from "react";

export const HomePage = lazy(() => import("@/pages/home/HomePage"));
export const MovieDetailsPage = lazy(() => import("@/pages/movie/MovieDetailsPage"));
export const ShowtimeSelectionPage = lazy(() => import("@/pages/theatre/ShowtimeSelectionPage"));
export const SeatBookingPage = lazy(() => import("@/pages/seat-booking/SeatBookingPage"));
export const CheckoutPage = lazy(() => import("@/pages/checkout/CheckoutPage"));
export const BookingSuccessPage = lazy(() => import("@/pages/checkout/BookingSuccessPage"));
export const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
