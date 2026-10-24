import type { Movie, Theatre, Show, ShowSeat, AdminStats } from "@/types";

export const MOCK_MOVIES: Movie[] = [
  {
    id: "mov-1",
    title: "Dune: Part Two",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/embed/Way9Dexny3w",
    genre: ["SCI_FI", "ACTION"],
    language: ["ENGLISH", "HINDI"],
    durationMinutes: 166,
    rating: 8.8,
    releaseDate: "2026-03-01",
    isTrending: true,
    cast: [
      { name: "Timothée Chalamet", role: "Paul Atreides", avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" },
      { name: "Zendaya", role: "Chani", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
      { name: "Rebecca Ferguson", role: "Lady Jessica", avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80" },
    ],
  },
  {
    id: "mov-2",
    title: "Oppenheimer",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=800&auto=format&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/embed/uYPbbksJxIg",
    genre: ["DRAMA", "THRILLER"],
    language: ["ENGLISH", "HINDI", "TAMIL"],
    durationMinutes: 180,
    rating: 8.9,
    releaseDate: "2026-02-15",
    isTrending: true,
    cast: [
      { name: "Cillian Murphy", role: "J. Robert Oppenheimer", avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80" },
      { name: "Emily Blunt", role: "Katherine Oppenheimer", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" },
      { name: "Matt Damon", role: "Leslie Groves", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
    ],
  },
  {
    id: "mov-3",
    title: "Cyberpunk 2099",
    description: "In a neon-drenched metropolis, a rogue mercenary navigates cybernetic warfare to expose a mega-corp conspiracy.",
    posterUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/embed/Way9Dexny3w",
    genre: ["SCI_FI", "ACTION"],
    language: ["ENGLISH"],
    durationMinutes: 142,
    rating: 8.5,
    releaseDate: "2026-04-10",
    isTrending: true,
    cast: [
      { name: "Keanu Reeves", role: "Johnny Silver", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" },
    ],
  },
  {
    id: "mov-4",
    title: "The Dark Knight Rises",
    description: "Eight years after the Joker's reign of anarchy, Batman is forced from his exile to save Gotham City from Bane.",
    posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/embed/g8evyE9TuYk",
    genre: ["ACTION", "THRILLER"],
    language: ["ENGLISH", "HINDI"],
    durationMinutes: 165,
    rating: 8.4,
    releaseDate: "2026-01-20",
    isTrending: false,
    cast: [
      { name: "Christian Bale", role: "Bruce Wayne / Batman", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80" },
    ],
  },
];

export const MOCK_THEATRES: Theatre[] = [
  {
    id: "th-1",
    name: "PVR ICON: Phoenix Palladium",
    city: "Mumbai",
    address: "Lower Parel, Mumbai",
    screensCount: 7,
  },
  {
    id: "th-2",
    name: "INOX: Megaplex Inorbit",
    city: "Mumbai",
    address: "Malad West, Mumbai",
    screensCount: 11,
  },
  {
    id: "th-3",
    name: "Cinepolis: VIP Viviana",
    city: "Mumbai",
    address: "Thane West, Mumbai",
    screensCount: 10,
  },
];

export function generateMockShows(movieId: string, dateStr: string): Show[] {
  return [
    {
      id: `show-${movieId}-1`,
      movieId,
      movieTitle: "Dune: Part Two",
      theatreId: "th-1",
      theatreName: "PVR ICON: Phoenix Palladium",
      screenName: "IMAX Screen 1",
      format: "IMAX 3D",
      startTime: `${dateStr}T10:30:00`,
      date: dateStr,
      seatsAvailable: 45,
      totalSeats: 120,
      pricing: { REGULAR: 250, PREMIUM: 450, VIP: 800 },
    },
    {
      id: `show-${movieId}-2`,
      movieId,
      movieTitle: "Dune: Part Two",
      theatreId: "th-1",
      theatreName: "PVR ICON: Phoenix Palladium",
      screenName: "Screen 3",
      format: "4DX",
      startTime: `${dateStr}T14:15:00`,
      date: dateStr,
      seatsAvailable: 8,
      totalSeats: 100,
      pricing: { REGULAR: 300, PREMIUM: 500, VIP: 900 },
    },
    {
      id: `show-${movieId}-3`,
      movieId,
      movieTitle: "Dune: Part Two",
      theatreId: "th-2",
      theatreName: "INOX: Megaplex Inorbit",
      screenName: "Screen 2",
      format: "2D",
      startTime: `${dateStr}T18:00:00`,
      date: dateStr,
      seatsAvailable: 82,
      totalSeats: 150,
      pricing: { REGULAR: 200, PREMIUM: 350, VIP: 600 },
    },
    {
      id: `show-${movieId}-4`,
      movieId,
      movieTitle: "Dune: Part Two",
      theatreId: "th-3",
      theatreName: "Cinepolis: VIP Viviana",
      screenName: "VIP Screen A",
      format: "3D",
      startTime: `${dateStr}T21:30:00`,
      date: dateStr,
      seatsAvailable: 2,
      totalSeats: 80,
      pricing: { REGULAR: 350, PREMIUM: 600, VIP: 1200 },
    },
  ];
}

export function generateMockSeats(showId: string): ShowSeat[] {
  const seats: ShowSeat[] = [];
  const rows = [
    { rowName: "A", category: "REGULAR" as const, price: 200, count: 12 },
    { rowName: "B", category: "REGULAR" as const, price: 200, count: 12 },
    { rowName: "C", category: "REGULAR" as const, price: 250, count: 14 },
    { rowName: "D", category: "PREMIUM" as const, price: 400, count: 14 },
    { rowName: "E", category: "PREMIUM" as const, price: 400, count: 14 },
    { rowName: "F", category: "PREMIUM" as const, price: 450, count: 14 },
    { rowName: "G", category: "VIP" as const, price: 750, count: 10 },
    { rowName: "H", category: "VIP" as const, price: 850, count: 10 },
  ];

  rows.forEach((r) => {
    for (let i = 1; i <= r.count; i++) {
      const seatNumber = `${r.rowName}${i}`;
      // Deterministically mark some seats as booked/locked for realistic feel
      const isBooked = (r.rowName === "D" && (i === 5 || i === 6)) || (r.rowName === "G" && i === 3);
      const isLocked = r.rowName === "E" && i === 8;

      seats.push({
        id: `seat-${showId}-${seatNumber}`,
        seatNumber,
        rowName: r.rowName,
        category: r.category,
        price: r.price,
        status: isBooked ? "BOOKED" : isLocked ? "LOCKED" : "AVAILABLE",
      });
    }
  });

  return seats;
}

export const MOCK_ADMIN_STATS: AdminStats = {
  totalBookings: 1420,
  totalRevenue: 485900,
  activeMoviesCount: 12,
  activeTheatresCount: 8,
  recentBookings: [
    {
      id: "BK-9021",
      movieTitle: "Dune: Part Two",
      userEmail: "alex@example.com",
      amount: 900,
      status: "CONFIRMED",
      createdAt: "2026-09-06T19:40:00Z",
    },
    {
      id: "BK-9020",
      movieTitle: "Oppenheimer",
      userEmail: "sara@example.com",
      amount: 1500,
      status: "CONFIRMED",
      createdAt: "2026-09-06T18:15:00Z",
    },
    {
      id: "BK-9019",
      movieTitle: "Cyberpunk 2099",
      userEmail: "john@example.com",
      amount: 450,
      status: "CANCELLED",
      createdAt: "2026-09-06T17:02:00Z",
    },
  ],
};
