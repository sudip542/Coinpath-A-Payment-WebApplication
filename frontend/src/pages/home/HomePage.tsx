import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Star, Clock, Filter, Film, ArrowRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGetMoviesQuery } from "@/store/api/movieApi";
import { setSelectedGenre } from "@/store/slices/movieSlice";
import { Button } from "@/shadcn/ui/button";
import { Badge } from "@/shadcn/ui/badge";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Skeleton } from "@/shadcn/ui/skeleton";
import type { Genre, Language } from "@/types";

const GENRES: Array<Genre | "ALL"> = ["ALL", "ACTION", "DRAMA", "SCI_FI", "THRILLER", "COMEDY", "ROMANCE"];

export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { searchQuery, selectedGenre, selectedLanguage } = useAppSelector((state) => state.movie);

  const { data: rawMovies, isLoading } = useGetMoviesQuery();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const movies = useMemo(() => {
    if (Array.isArray(rawMovies)) return rawMovies;
    if (rawMovies && Array.isArray((rawMovies as any).content)) return (rawMovies as any).content;
    return [];
  }, [rawMovies]);

  const trendingMovies = useMemo(() => movies.filter((m) => m.isTrending), [movies]);
  const heroMovie = trendingMovies[currentBannerIndex] || movies[0];

  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      const genres = Array.isArray(m.genre) ? m.genre : [];
      const languages = Array.isArray(m.language) ? m.language : [];

      const matchesSearch =
        !searchQuery ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesGenre = selectedGenre === "ALL" || genres.includes(selectedGenre as Genre);
      const matchesLang = selectedLanguage === "ALL" || languages.includes(selectedLanguage as Language);

      return matchesSearch && matchesGenre && matchesLang;
    });
  }, [movies, searchQuery, selectedGenre, selectedLanguage]);

  return (
    <div className="min-h-screen bg-[#0d0f12] text-slate-100 pb-20">
      {heroMovie && (
        <section className="relative h-[480px] md:h-[560px] w-full overflow-hidden border-b border-slate-800">
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out scale-105"
            style={{ backgroundImage: `url(${heroMovie.bannerUrl || heroMovie.posterUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12] via-[#0d0f12]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d0f12] via-[#0d0f12]/60 to-transparent" />
          </div>

          <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 sm:px-6 lg:px-8 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end w-full">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-600 text-white font-bold px-3 py-1">TRENDING #1</Badge>
                  <div className="flex items-center text-amber-400 text-sm font-semibold">
                    <Star className="h-4 w-4 fill-amber-400 mr-1" />
                    {heroMovie.rating} / 10
                  </div>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
                  {heroMovie.title}
                </h1>

                <p className="text-slate-300 text-sm sm:text-base line-clamp-2 max-w-2xl font-light">
                  {heroMovie.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1 font-medium bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
                    <Clock className="h-3.5 w-3.5 text-red-500" /> {heroMovie.durationMinutes} mins
                  </span>
                  <div className="flex gap-1.5">
                    {Array.isArray(heroMovie.genre) &&
                      heroMovie.genre.map((g) => (
                        <Badge key={g} variant="outline" className="border-slate-700 bg-slate-900/50 text-slate-300">
                          {g}
                        </Badge>
                      ))}
                  </div>
                  <div className="flex gap-1">
                    {Array.isArray(heroMovie.language) &&
                      heroMovie.language.map((l) => (
                        <span key={l} className="text-xs bg-red-500/10 text-red-400 font-semibold px-2 py-0.5 rounded border border-red-500/20">
                          {l}
                        </span>
                      ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <Button
                    size="lg"
                    onClick={() => navigate(`/movies/${heroMovie.id}`)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 shadow-xl shadow-red-600/30 group"
                  >
                    Book Tickets
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>

              {trendingMovies.length > 1 && (
                <div className="lg:col-span-4 flex justify-end gap-2 pb-2">
                  {trendingMovies.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBannerIndex(idx)}
                      className={`h-2.5 rounded-full transition-all ${
                        idx === currentBannerIndex ? "w-8 bg-red-500" : "w-2.5 bg-slate-700 hover:bg-slate-500"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Film className="h-6 w-6 text-red-500" />
              Now Showing
            </h2>
            <p className="text-slate-400 text-xs">Explore blockbusters and reserve your favorite seats</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center">
                <Filter className="h-3.5 w-3.5 mr-1" /> Genre:
              </span>
              {GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => dispatch(setSelectedGenre(g))}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                    selectedGenre === g
                      ? "bg-red-600 text-white font-semibold shadow-md shadow-red-600/20"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-slate-900 border-slate-800 overflow-hidden">
                <Skeleton className="h-[360px] w-full bg-slate-800" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4 bg-slate-800" />
                  <Skeleton className="h-4 w-1/2 bg-slate-800" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
            <Film className="h-12 w-12 text-slate-600" />
            <h3 className="text-lg font-bold text-slate-300">No movies found</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Try adjusting your search query or clearing the genre filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <Card
                key={movie.id}
                onClick={() => navigate(`/movies/${movie.id}`)}
                className="group relative bg-slate-900/60 border-slate-800 overflow-hidden rounded-2xl hover:border-red-500/50 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer shadow-lg hover:shadow-red-600/10"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-amber-400 border border-white/10">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    {movie.rating}
                  </div>

                  <div className="absolute top-3 right-3 flex flex-col gap-1">
                    {Array.isArray(movie.language) &&
                      movie.language.slice(0, 2).map((l) => (
                        <span key={l} className="rounded bg-red-600/90 text-[10px] font-bold text-white px-2 py-0.5 uppercase tracking-wider backdrop-blur-sm">
                          {l}
                        </span>
                      ))}
                  </div>
                </div>

                <CardContent className="p-4 space-y-2 bg-slate-900/90">
                  <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors truncate">
                    {movie.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="truncate max-w-[160px]">{movie.genre.join(", ")}</span>
                    <span>{movie.durationMinutes}m</span>
                  </div>

                  <Button
                    size="sm"
                    className="w-full mt-2 bg-slate-800 group-hover:bg-red-600 text-slate-200 group-hover:text-white font-semibold transition-colors"
                  >
                    Book Tickets
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
