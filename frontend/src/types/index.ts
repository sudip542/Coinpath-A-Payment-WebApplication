export type Role = "USER" | "ADMIN" | "THEATRE_MANAGER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phoneNumber?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export type Genre = "ACTION" | "DRAMA" | "COMEDY" | "SCI_FI" | "HORROR" | "ROMANCE" | "THRILLER" | "ANIMATION";
export type Language = "ENGLISH" | "HINDI" | "TAMIL" | "TELUGU" | "BENGALI" | "KANNADA";

export interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  bannerUrl: string;
  trailerUrl: string;
  genre: Genre[];
  language: Language[];
  durationMinutes: number;
  rating: number;
  releaseDate: string;
  cast: Array<{ name: string; role: string; avatarUrl: string }>;
  isTrending?: boolean;
}

export interface Theatre {
  id: string;
  name: string;
  city: string;
  address: string;
  screensCount: number;
}

export type SeatCategory = "REGULAR" | "PREMIUM" | "VIP";
export type SeatStatus = "AVAILABLE" | "SELECTED" | "LOCKED" | "BOOKED";

export interface ShowSeat {
  id: string;
  seatNumber: string;
  rowName: string;
  category: SeatCategory;
  price: number;
  status: SeatStatus;
  lockedByUserId?: string;
}

export interface Show {
  id: string;
  movieId: string;
  movieTitle?: string;
  theatreId: string;
  theatreName: string;
  screenName: string;
  format: "2D" | "3D" | "IMAX 3D" | "4DX";
  startTime: string; // ISO date string
  date: string; // YYYY-MM-DD
  seatsAvailable: number;
  totalSeats: number;
  pricing: Record<SeatCategory, number>;
}

export interface SeatSelection {
  seatId: string;
  seatNumber: string;
  rowName: string;
  category: SeatCategory;
  price: number;
}

export interface LockSeatsRequest {
  showId: string;
  seatIds: string[];
}

export interface LockSeatsResponse {
  bookingId: string;
  showId: string;
  seatIds: string[];
  expiresAt: number; // Unix timestamp in ms
  totalAmount: number;
}

export interface PaymentRequest {
  bookingId: string;
  paymentMethod: "UPI" | "CARD" | "NET_BANKING";
  idempotencyKey: string;
  paymentDetails?: {
    upiId?: string;
    cardNumber?: string;
    cardExpiry?: string;
    cvv?: string;
    bankName?: string;
  };
}

export interface BookingReceipt {
  bookingId: string;
  movieTitle: string;
  posterUrl: string;
  theatreName: string;
  screenName: string;
  showTime: string;
  seats: string[];
  totalAmount: number;
  convenienceFee: number;
  paymentMethod: string;
  transactionId: string;
  qrCodeValue: string;
  createdAt: string;
}

export interface AdminStats {
  totalBookings: number;
  totalRevenue: number;
  activeMoviesCount: number;
  activeTheatresCount: number;
  recentBookings: Array<{
    id: string;
    movieTitle: string;
    userEmail: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}
