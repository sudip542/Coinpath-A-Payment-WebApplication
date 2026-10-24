import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Star, Play, Clock, Calendar, Globe, Users, ArrowLeft, Ticket } from "lucide-react";
import { useGetMovieByIdQuery } from "@/store/api/movieApi";
import { Button } from "@/shadcn/ui/button";
import { Badge } from "@/shadcn/ui/badge";
import { Card } from "@/shadcn/ui/card";
import { Dialog, DialogContent } from "@/shadcn/ui/dialog";
import { Skeleton } from "@/shadcn/ui/skeleton";

export default function MovieDetailsPage() {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const [trailerOpen, setTrailerOpen] = useState(false);

  const { data: movie, isLoading } = useGetMovieByIdQuery(movieId || "mov-1");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0f12] p-8 space-y-6">
        <Skeleton className="h-[400px] w-full rounded-2xl bg-slate-900" />
        <Skeleton className="h-10 w-1/3 bg-slate-900" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0d0f12] flex flex-col items-center justify-center p-8 text-center text-slate-300 space-y-4">
        <h2 className="text-2xl font-bold">Movie Not Found</h2>
        <Button onClick={() => navigate("/")} className="bg-red-600">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] text-slate-100 pb-20">
      <div className="relative h-[420px] md:h-[500px] w-full overflow-hidden border-b border-slate-800">
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105 opacity-40"
          style={{ backgroundImage: `url(${movie.bannerUrl || movie.posterUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12] via-[#0d0f12]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0f12] via-[#0d0f12]/90 to-transparent" />

        <div className="absolute top-6 left-6 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 sm:px-6 lg:px-8 pb-10">
          <div className="flex flex-col md:flex-row gap-8 items-end w-full">
            <div className="relative h-64 w-44 md:h-80 md:w-56 shrink-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/50 hidden sm:block">
              <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" />
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 text-sm">
                  <Star className="h-4 w-4 fill-amber-400" />
                  {movie.rating} / 10
                </div>
                {movie.genre.map((g) => (
                  <Badge key={g} className="bg-slate-800 text-slate-300 font-medium">
                    {g}
                  </Badge>
                ))}
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{movie.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-slate-300 font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-red-500" /> {movie.durationMinutes} minutes
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-red-500" /> {movie.language.join(", ")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-red-500" /> {movie.releaseDate}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  size="lg"
                  onClick={() => navigate(`/shows/${movie.id}`)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 shadow-xl shadow-red-600/30"
                >
                  <Ticket className="mr-2 h-5 w-5" />
                  Book Tickets
                </Button>

                {movie.trailerUrl && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setTrailerOpen(true)}
                    className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200"
                  >
                    <Play className="mr-2 h-4 w-4 text-red-500 fill-red-500" />
                    Watch Trailer
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        <section className="space-y-3 max-w-3xl">
          <h2 className="text-xl font-bold text-white tracking-tight">About the Movie</h2>
          <p className="text-slate-300 leading-relaxed text-base font-light">{movie.description}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-red-500" />
            Cast & Crew
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movie.cast.map((actor, idx) => (
              <Card key={idx} className="bg-slate-900/80 border-slate-800 p-3 text-center space-y-2 rounded-xl">
                <img
                  src={actor.avatarUrl}
                  alt={actor.name}
                  className="h-16 w-16 rounded-full object-cover mx-auto border-2 border-slate-700"
                />
                <div>
                  <h4 className="text-xs font-bold text-white truncate">{actor.name}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{actor.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
        <DialogContent className="sm:max-w-[800px] border-slate-800 bg-[#0d0f12] p-0 overflow-hidden">
          <div className="relative aspect-video w-full">
            <iframe
              src={movie.trailerUrl}
              title={`${movie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-none"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
