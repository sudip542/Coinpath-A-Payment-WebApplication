import { Film, ShieldCheck } from "lucide-react";
import {
  HomePage,
  MovieDetailsPage,
  ShowtimeSelectionPage,
  SeatBookingPage,
  CheckoutPage,
  BookingSuccessPage,
  AdminDashboardPage,
} from "./lazy-pages";
import type { RouteItem } from "./types";

export type { RouteItem } from "./types";

export const customRoutes: RouteItem[] = [
  {
    title: "Home",
    url: "/",
    icon: <Film />,
    element: <HomePage />,
    isPublic: true,
  },
  {
    title: "Movie Details",
    url: "/movies/:movieId",
    element: <MovieDetailsPage />,
    hideInMenu: true,
    isPublic: true,
  },
  {
    title: "Showtimes",
    url: "/shows/:movieId",
    element: <ShowtimeSelectionPage />,
    hideInMenu: true,
    isPublic: true,
  },
  {
    title: "Seat Booking",
    url: "/seat-booking/:showId",
    element: <SeatBookingPage />,
    hideInMenu: true,
    isPublic: true,
  },
  {
    title: "Checkout",
    url: "/checkout",
    element: <CheckoutPage />,
    hideInMenu: true,
    isPublic: true,
  },
  {
    title: "Booking Success",
    url: "/booking-success/:bookingId",
    element: <BookingSuccessPage />,
    hideInMenu: true,
    isPublic: true,
  },
  {
    title: "Admin Panel",
    url: "/admin",
    icon: <ShieldCheck />,
    element: <AdminDashboardPage />,
    roles: ["ADMIN", "THEATRE_MANAGER"],
  },
];
