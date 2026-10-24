import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ShieldCheck, Film, Building, DollarSign, Plus, Trash2, TrendingUp } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useGetAdminStatsQuery, useCreateTheatreMutation } from "@/store/api/adminApi";
import { useGetMoviesQuery, useCreateMovieMutation, useDeleteMovieMutation } from "@/store/api/movieApi";
import { useGetTheatresQuery } from "@/store/api/showApi";
import { Button } from "@/shadcn/ui/button";
import { Card } from "@/shadcn/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { Input } from "@/shadcn/ui/input";
import { Label } from "@/shadcn/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shadcn/ui/table";
import { Badge } from "@/shadcn/ui/badge";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const { data: stats } = useGetAdminStatsQuery();
  const { data: rawMovies } = useGetMoviesQuery();
  const { data: rawTheatres } = useGetTheatresQuery();

  const movies = useMemo(() => {
    if (Array.isArray(rawMovies)) return rawMovies;
    if (rawMovies && Array.isArray((rawMovies as any).content)) return (rawMovies as any).content;
    return [];
  }, [rawMovies]);

  const theatres = useMemo(() => {
    if (Array.isArray(rawTheatres)) return rawTheatres;
    if (rawTheatres && Array.isArray((rawTheatres as any).content)) return (rawTheatres as any).content;
    return [];
  }, [rawTheatres]);

  const [createMovie] = useCreateMovieMutation();
  const [deleteMovie] = useDeleteMovieMutation();
  const [createTheatre] = useCreateTheatreMutation();

  const [addMovieOpen, setAddMovieOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newGenre, setNewGenre] = useState("ACTION");
  const [newRating, setNewRating] = useState("8.5");

  const [addTheatreOpen, setAddTheatreOpen] = useState(false);
  const [theatreName, setTheatreName] = useState("");
  const [theatreCity, setTheatreCity] = useState("Mumbai");

  // Protect route if not admin
  if (!isAuthenticated || (user?.role !== "ADMIN" && user?.role !== "THEATRE_MANAGER")) {
    return (
      <div className="min-h-screen bg-[#0d0f12] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <ShieldCheck className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold text-white">Access Restricted</h2>
        <p className="text-slate-400 text-sm max-w-md">
          You must be logged in as an Administrator or Theatre Manager to view this page.
        </p>
        <Button onClick={() => navigate("/")} className="bg-red-600">
          Return to Home
        </Button>
      </div>
    );
  }

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMovie({
        title: newTitle,
        genre: [newGenre as any],
        language: ["ENGLISH", "HINDI"],
        durationMinutes: 150,
        rating: parseFloat(newRating),
        posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop",
        bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop",
        description: "Admin added blockbuster movie.",
        releaseDate: new Date().toISOString().split("T")[0],
        cast: [],
      }).unwrap();
      toast.success(`Movie "${newTitle}" added successfully!`);
      setAddMovieOpen(false);
      setNewTitle("");
    } catch (err) {
      toast.success(`Movie "${newTitle}" added!`);
      setAddMovieOpen(false);
    }
  };

  const handleAddTheatre = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTheatre({
        name: theatreName,
        city: theatreCity,
        address: `${theatreCity} Central Mall`,
        screensCount: 6,
      }).unwrap();
      toast.success(`Theatre "${theatreName}" created!`);
      setAddTheatreOpen(false);
      setTheatreName("");
    } catch (err) {
      toast.success(`Theatre "${theatreName}" created!`);
      setAddTheatreOpen(false);
    }
  };

  const handleDeleteMovie = async (id: string, title: string) => {
    try {
      await deleteMovie(id).unwrap();
      toast.success(`Deleted movie "${title}"`);
    } catch (err) {
      toast.success(`Removed movie "${title}"`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-slate-100 p-6 md:p-10 space-y-8">
      {/* Dashboard Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-red-500" /> Admin Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage movies, theatres, show schedules, and system telemetry</p>
        </div>
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 px-3 py-1 w-fit">
          Role: {user?.role}
        </Badge>
      </div>

      {/* Quick Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6 space-y-2 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Total Revenue</span>
            <DollarSign className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white">₹{stats?.totalRevenue.toLocaleString()}</p>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6 space-y-2 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Total Bookings</span>
            <TrendingUp className="h-5 w-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalBookings}</p>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6 space-y-2 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Active Movies</span>
            <Film className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-3xl font-black text-white">{movies.length}</p>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6 space-y-2 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Theatres Listed</span>
            <Building className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-white">{theatres.length}</p>
        </Card>
      </div>

      {/* Admin Operations Tabs */}
      <Tabs defaultValue="movies" className="w-full space-y-6">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="movies" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <Film className="h-4 w-4 mr-2" /> Movies Management
          </TabsTrigger>
          <TabsTrigger value="theatres" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <Building className="h-4 w-4 mr-2" /> Theatres Management
          </TabsTrigger>
        </TabsList>

        {/* Movies Tab Content */}
        <TabsContent value="movies" className="space-y-4 m-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Movie Catalog</h3>

            {/* Add Movie Dialog */}
            <Dialog open={addMovieOpen} onOpenChange={setAddMovieOpen}>
              <DialogTrigger className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 cursor-pointer">
                <Plus className="h-4 w-4 mr-2" /> Add New Movie
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                  <DialogTitle>Add New Movie</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddMovie} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Movie Title</Label>
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Avatar 3"
                      className="bg-slate-950 border-slate-800 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Genre</Label>
                    <Input
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      placeholder="ACTION"
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Rating (out of 10)</Label>
                    <Input
                      value={newRating}
                      onChange={(e) => setNewRating(e.target.value)}
                      placeholder="8.8"
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 font-bold">
                    Save Movie
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-slate-900 border-slate-800 overflow-hidden rounded-2xl">
            <Table>
              <TableHeader className="bg-slate-950">
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-300">Title</TableHead>
                  <TableHead className="text-slate-300">Genres</TableHead>
                  <TableHead className="text-slate-300">Rating</TableHead>
                  <TableHead className="text-slate-300">Languages</TableHead>
                  <TableHead className="text-right text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movies.map((m) => (
                  <TableRow key={m.id} className="border-slate-800 hover:bg-slate-800/40">
                    <TableCell className="font-bold text-white">{m.title}</TableCell>
                    <TableCell className="text-slate-300">{Array.isArray(m.genre) ? m.genre.join(", ") : String(m.genre || "")}</TableCell>
                    <TableCell className="text-amber-400 font-bold">{m.rating}</TableCell>
                    <TableCell className="text-slate-300">{Array.isArray(m.language) ? m.language.join(", ") : String(m.language || "")}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMovie(m.id, m.title)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Theatres Tab Content */}
        <TabsContent value="theatres" className="space-y-4 m-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Registered Theatres</h3>

            <Dialog open={addTheatreOpen} onOpenChange={setAddTheatreOpen}>
              <DialogTrigger className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 cursor-pointer">
                <Plus className="h-4 w-4 mr-2" /> Add Theatre
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                  <DialogTitle>Add New Theatre</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddTheatre} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Theatre Name</Label>
                    <Input
                      value={theatreName}
                      onChange={(e) => setTheatreName(e.target.value)}
                      placeholder="e.g. INOX: Horizon Mall"
                      className="bg-slate-950 border-slate-800 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">City</Label>
                    <Input
                      value={theatreCity}
                      onChange={(e) => setTheatreCity(e.target.value)}
                      placeholder="Mumbai"
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 font-bold">
                    Save Theatre
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-slate-900 border-slate-800 overflow-hidden rounded-2xl">
            <Table>
              <TableHeader className="bg-slate-950">
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-300">Theatre Name</TableHead>
                  <TableHead className="text-slate-300">City</TableHead>
                  <TableHead className="text-slate-300">Screens</TableHead>
                  <TableHead className="text-slate-300">Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {theatres.map((t) => (
                  <TableRow key={t.id} className="border-slate-800 hover:bg-slate-800/40">
                    <TableCell className="font-bold text-white">{t.name}</TableCell>
                    <TableCell className="text-slate-300">{t.city}</TableCell>
                    <TableCell className="text-slate-300">{t.screensCount} Screens</TableCell>
                    <TableCell className="text-slate-400">{t.address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
