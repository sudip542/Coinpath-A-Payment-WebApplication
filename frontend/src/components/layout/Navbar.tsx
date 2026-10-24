import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Film, Search, MapPin, User as UserIcon, LogOut, ShieldCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSearchQuery, setSelectedCity } from "@/store/slices/movieSlice";
import { logout } from "@/store/slices/authSlice";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import AuthModal from "../auth/AuthModal";

const CITIES = ["Mumbai", "Delhi-NCR", "Bengaluru", "Hyderabad", "Kolkata", "Chennai"];

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { searchQuery, selectedCity } = useAppSelector((state) => state.movie);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleCityChange = (city: string | null) => {
    if (city) dispatch(setSelectedCity(city));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0d0f12]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0d0f12]/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 text-white shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
                <Film className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Show<span className="text-red-500">Zen</span>
              </span>
            </Link>

            {/* City Selector */}
            <div className="hidden md:flex items-center gap-2 text-slate-300">
              <MapPin className="h-4 w-4 text-red-500" />
              <Select value={selectedCity} onValueChange={handleCityChange}>
                <SelectTrigger className="w-[140px] border-slate-800 bg-slate-900/60 text-sm font-medium focus:ring-red-500">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent className="border-slate-800 bg-slate-900 text-slate-200">
                  {CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Search movies, genres or languages..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 bg-slate-900/80 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-red-500 focus:ring-red-500/20"
              />
            </div>
          </div>

          {/* User Controls & Navigation */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (user?.role === "ADMIN" || user?.role === "THEATRE_MANAGER") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin")}
                className="hidden lg:flex items-center gap-2 border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin Panel
              </Button>
            )}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700">
                  <UserIcon className="h-5 w-5 text-slate-200" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 border-slate-800 bg-slate-900 text-slate-200" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold text-white">{user?.name}</p>
                        <p className="text-xs text-slate-400">{user?.email}</p>
                        <span className="inline-flex w-fit items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400 border border-red-500/20">
                          {user?.role}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  <DropdownMenuGroup>
                    {(user?.role === "ADMIN" || user?.role === "THEATRE_MANAGER") && (
                      <DropdownMenuItem
                        onClick={() => navigate("/admin")}
                        className="cursor-pointer focus:bg-slate-800 text-slate-200"
                      >
                        <ShieldCheck className="mr-2 h-4 w-4 text-red-400" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer focus:bg-slate-800 text-red-400 focus:text-red-300"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthModalOpen(true);
                  }}
                  className="text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setAuthMode("register");
                    setAuthModalOpen(true);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium shadow-md shadow-red-600/20"
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        initialMode={authMode}
      />
    </>
  );
}
