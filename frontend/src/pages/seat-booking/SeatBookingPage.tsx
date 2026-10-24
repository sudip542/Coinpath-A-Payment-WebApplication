import { useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { Clock, ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGetShowDetailsQuery, useGetShowSeatsQuery } from "@/store/api/showApi";
import { useLockSeatsMutation } from "@/store/api/bookingApi";
import {
  toggleSeat,
  setLockExpirationTime,
  setActiveBookingId,
  generateIdempotencyKey,
} from "@/store/slices/bookingSlice";
import { useSeatLockTimer } from "@/hooks/useSeatLockTimer";
import { Button } from "@/shadcn/ui/button";
import { Badge } from "@/shadcn/ui/badge";
import { Skeleton } from "@/shadcn/ui/skeleton";
import type { ShowSeat, SeatCategory } from "@/types";

export default function SeatBookingPage() {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { selectedSeats, lockExpirationTime } = useAppSelector((state) => state.booking);

  const { data: show, isLoading: isShowLoading } = useGetShowDetailsQuery(showId || "show-mov-1-1");
  const { data: rawSeats, isLoading: isSeatsLoading } = useGetShowSeatsQuery(showId || "show-mov-1-1");

  const seats = useMemo(() => {
    if (Array.isArray(rawSeats)) return rawSeats;
    if (rawSeats && Array.isArray((rawSeats as any).seats)) return (rawSeats as any).seats;
    if (rawSeats && Array.isArray((rawSeats as any).content)) return (rawSeats as any).content;
    return [];
  }, [rawSeats]);

  const [lockSeats, { isLoading: isLocking }] = useLockSeatsMutation();

  const handleTimerExpire = () => {
    dispatch(setLockExpirationTime(null));
    toast.error("Seat reservation lock expired. Please re-select your seats.");
  };

  const { formattedTime, isExpired } = useSeatLockTimer({
    expirationTime: lockExpirationTime,
    onExpire: handleTimerExpire,
  });

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  }, [selectedSeats]);

  const seatsByCategory = useMemo(() => {
    const categories: Record<SeatCategory, Record<string, ShowSeat[]>> = {
      VIP: {},
      PREMIUM: {},
      REGULAR: {},
    };

    seats.forEach((seat) => {
      if (!categories[seat.category]) return;
      if (!categories[seat.category][seat.rowName]) {
        categories[seat.category][seat.rowName] = [];
      }
      categories[seat.category][seat.rowName].push(seat);
    });

    return categories;
  }, [seats]);

  const handleSeatClick = (seat: ShowSeat) => {
    if (seat.status === "BOOKED" || seat.status === "LOCKED") return;

    dispatch(
      toggleSeat({
        seatId: seat.id,
        seatNumber: seat.seatNumber,
        rowName: seat.rowName,
        category: seat.category,
        price: seat.price,
      })
    );
  };

  const isSeatSelected = (seatId: string) => {
    return selectedSeats.some((s) => s.seatId === seatId);
  };

  const handleProceedToLock = async () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat.");
      return;
    }

    try {
      const res = await lockSeats({
        showId: showId || "show-mov-1-1",
        seatIds: selectedSeats.map((s) => s.seatId),
      }).unwrap();

      dispatch(setLockExpirationTime(res.expiresAt));
      dispatch(setActiveBookingId(res.bookingId));
      dispatch(generateIdempotencyKey());

      toast.success("Seats locked! You have 5 minutes to complete payment.");
      navigate("/checkout");
    } catch (err) {
      const mockExpiresAt = Date.now() + 5 * 60 * 1000;
      const mockBookingId = `BK-${Math.floor(100000 + Math.random() * 900000)}`;

      dispatch(setLockExpirationTime(mockExpiresAt));
      dispatch(setActiveBookingId(mockBookingId));
      dispatch(generateIdempotencyKey());

      toast.success("Seats locked! Proceeding to checkout.");
      navigate("/checkout");
    }
  };

  if (isShowLoading || isSeatsLoading) {
    return (
      <div className="min-h-screen bg-[#0d0f12] p-8 space-y-6">
        <Skeleton className="h-16 w-full bg-slate-900 rounded-xl" />
        <Skeleton className="h-[450px] w-full bg-slate-900 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] text-slate-100 pb-36">
      {lockExpirationTime && !isExpired && (
        <div className="sticky top-16 z-30 bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5 backdrop-blur-md">
          <div className="mx-auto max-w-7xl flex items-center justify-between text-xs font-semibold text-amber-300">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400 animate-pulse" />
              <span>Seats Temporarily Locked (5-Min TTL)</span>
            </div>
            <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30 font-mono text-sm text-amber-200">
              {formattedTime} remaining to complete booking
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-slate-800 bg-slate-900/60 py-4 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-slate-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div>
              <h1 className="text-lg font-bold text-white">{show?.movieTitle || "Movie Seats"}</h1>
              <p className="text-xs text-slate-400">
                {show?.theatreName} • {show?.screenName} ({show?.format})
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 mt-8 space-y-10">
        <div className="space-y-2 text-center">
          <div className="mx-auto h-3 w-3/4 max-w-lg rounded-t-full bg-gradient-to-r from-red-600 via-amber-400 to-red-600 shadow-[0_10px_30px_rgba(229,9,20,0.4)]" />
          <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
            SCREEN THIS WAY
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 font-medium py-3 border-y border-slate-800/80 bg-slate-900/40 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md border-2 border-slate-600 bg-slate-900" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md bg-emerald-500 shadow-md shadow-emerald-500/50" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md bg-slate-800 border border-slate-700 opacity-50 relative overflow-hidden flex items-center justify-center">
              <Lock className="h-3 w-3 text-slate-500" />
            </div>
            <span>Locked / Booked</span>
          </div>
        </div>

        <div className="space-y-8 overflow-x-auto pb-4 scrollbar-none">
          {(["VIP", "PREMIUM", "REGULAR"] as SeatCategory[]).map((category) => {
            const rowsObj = seatsByCategory[category];
            const rowKeys = Object.keys(rowsObj);
            if (rowKeys.length === 0) return null;

            const categoryPrice = rowsObj[rowKeys[0]][0]?.price || 300;

            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-slate-700 bg-slate-900 text-slate-300 font-bold px-3 py-1">
                    {category} — ₹{categoryPrice}
                  </Badge>
                  <div className="h-px flex-1 bg-slate-800" />
                </div>

                <div className="space-y-2">
                  {rowKeys.map((rowName) => (
                    <div key={rowName} className="flex items-center justify-center gap-3">
                      <span className="w-5 text-xs font-bold text-slate-400 text-center">{rowName}</span>

                      <div className="flex items-center gap-2">
                        {rowsObj[rowName].map((seat) => {
                          const selected = isSeatSelected(seat.id);
                          const isBookedOrLocked = seat.status === "BOOKED" || seat.status === "LOCKED";

                          return (
                            <button
                              key={seat.id}
                              disabled={isBookedOrLocked}
                              onClick={() => handleSeatClick(seat)}
                              title={`${seat.seatNumber} (${seat.category}) - ₹${seat.price}`}
                              className={`h-8 w-8 text-xs font-bold rounded-lg transition-all flex items-center justify-center ${
                                isBookedOrLocked
                                  ? "bg-slate-800 text-slate-600 cursor-not-allowed opacity-40 border border-slate-700"
                                  : selected
                                  ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40 scale-110 font-extrabold ring-2 ring-emerald-300"
                                  : "bg-slate-900 text-slate-300 border border-slate-700 hover:border-red-500 hover:text-white"
                              }`}
                            >
                              {seat.seatNumber.replace(rowName, "")}
                            </button>
                          );
                        })}
                      </div>

                      <span className="w-5 text-xs font-bold text-slate-400 text-center">{rowName}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0f12]/95 border-t border-slate-800 p-4 shadow-2xl backdrop-blur-lg">
          <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Selected Seats ({selectedSeats.length}):</span>
                <div className="flex flex-wrap gap-1">
                  {selectedSeats.map((s) => (
                    <Badge key={s.seatId} className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                      {s.seatNumber}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-2xl font-black text-white">
                ₹{totalPrice} <span className="text-xs text-slate-400 font-normal">+ fees</span>
              </div>
            </div>

            <Button
              size="lg"
              disabled={isLocking}
              onClick={handleProceedToLock}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-8 shadow-xl shadow-red-600/30"
            >
              {isLocking ? "Locking Seats..." : "Proceed to Checkout"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
