import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { Calendar, MapPin, Film, Clock, Filter } from "lucide-react";
import { useGetMovieByIdQuery } from "@/store/api/movieApi";
import { useGetShowsByMovieAndDateQuery } from "@/store/api/showApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSelectedShowId } from "@/store/slices/bookingSlice";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Skeleton } from "@/shadcn/ui/skeleton";
import type { Show } from "@/types";

function generateDateOptions() {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 6; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const dayName = i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
    const dayNumber = d.getDate();
    const monthName = d.toLocaleDateString("en-US", { month: "short" });
    const dateIso = d.toISOString().split("T")[0];

    dates.push({ dayName, dayNumber, monthName, dateIso });
  }

  return dates;
}

export default function ShowtimeSelectionPage() {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedCity } = useAppSelector((state) => state.movie);

  const dateOptions = useMemo(() => generateDateOptions(), []);
  const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0].dateIso);
  const [selectedFormat, setSelectedFormat] = useState<string>("ALL");

  const { data: movie } = useGetMovieByIdQuery(movieId || "mov-1");
  const { data: rawShows, isLoading } = useGetShowsByMovieAndDateQuery({
    movieId: movieId || "mov-1",
    date: selectedDate,
    city: selectedCity,
  });

  const shows = useMemo(() => {
    if (Array.isArray(rawShows)) return rawShows;
    if (rawShows && Array.isArray((rawShows as any).content)) return (rawShows as any).content;
    return [];
  }, [rawShows]);

  const groupedShows = useMemo(() => {
    const groups: Record<string, { theatreName: string; address: string; shows: Show[] }> = {};

    shows.forEach((show) => {
      if (selectedFormat !== "ALL" && show.format !== selectedFormat) return;

      if (!groups[show.theatreId]) {
        groups[show.theatreId] = {
          theatreName: show.theatreName,
          address: "Central Metro Hub, " + selectedCity,
          shows: [],
        };
      }
      groups[show.theatreId].shows.push(show);
    });

    return Object.values(groups);
  }, [shows, selectedFormat, selectedCity]);

  const handleSelectShow = (showId: string) => {
    dispatch(setSelectedShowId(showId));
    navigate(`/seat-booking/${showId}`);
  };

  const getAvailabilityBadgeColor = (available: number) => {
    if (available > 30) {
      return "border-emerald-500/40 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-600 hover:text-white";
    }
    if (available > 5) {
      return "border-amber-500/40 bg-amber-950/30 text-amber-400 hover:bg-amber-600 hover:text-white";
    }
    return "border-red-500/40 bg-red-950/30 text-red-400 hover:bg-red-600 hover:text-white";
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-slate-100 pb-20">
      <div className="border-b border-slate-800 bg-slate-900/60 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">{movie?.title || "Movie Showtimes"}</h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <Film className="h-3.5 w-3.5 text-red-500" />
              {movie?.genre.join(", ")} • {movie?.durationMinutes} mins • {selectedCity}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center">
              <Filter className="h-3.5 w-3.5 mr-1" /> Format:
            </span>
            {["ALL", "2D", "3D", "IMAX 3D", "4DX"].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`px-3 py-1 text-xs font-semibold rounded-md border transition-all ${
                  selectedFormat === fmt
                    ? "bg-red-600 border-red-500 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-30 border-b border-slate-800 bg-[#0d0f12]/95 backdrop-blur py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            {dateOptions.map((opt) => {
              const isSelected = selectedDate === opt.dateIso;
              return (
                <button
                  key={opt.dateIso}
                  onClick={() => setSelectedDate(opt.dateIso)}
                  className={`flex flex-col items-center justify-center min-w-[76px] py-2 px-3 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-gradient-to-b from-red-600 to-red-700 border-red-500 text-white shadow-lg shadow-red-600/30 scale-105"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span className="text-[11px] font-semibold uppercase opacity-80">{opt.dayName}</span>
                  <span className="text-lg font-black">{opt.dayNumber}</span>
                  <span className="text-[10px] font-medium uppercase opacity-75">{opt.monthName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        <div className="flex items-center justify-end gap-6 text-xs text-slate-400 font-medium pb-2 border-b border-slate-800/60">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Available
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Filling Fast
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Almost Full
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-full bg-slate-900 rounded-2xl" />
            ))}
          </div>
        ) : groupedShows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
            <Calendar className="h-10 w-10 text-slate-600" />
            <h3 className="text-lg font-bold text-slate-300">No showtimes available</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Please select another date or format filter above.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedShows.map((group, idx) => (
              <Card key={idx} className="bg-slate-900/70 border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-500" />
                        {group.theatreName}
                      </h3>
                      <p className="text-xs text-slate-400 pl-6">{group.address}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    {group.shows.map((show) => {
                      const timeString = new Date(show.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <button
                          key={show.id}
                          onClick={() => handleSelectShow(show.id)}
                          className={`flex flex-col items-start px-4 py-2.5 rounded-xl border transition-all duration-200 shadow-sm ${getAvailabilityBadgeColor(
                            show.seatsAvailable
                          )}`}
                        >
                          <div className="flex items-center gap-2 font-bold text-sm">
                            <Clock className="h-3.5 w-3.5" />
                            {timeString}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-semibold mt-1">
                            <span>{show.format}</span>
                            <span>•</span>
                            <span>{show.screenName}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
