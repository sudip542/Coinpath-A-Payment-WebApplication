import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleTheme, setDemoMode } from "@/store/slices/uiSlice";
import {
  User,
  LogOut,
  Settings,
  Sun,
  Moon,
  Shield,
  Sparkles,
} from "lucide-react";

export const UserMenu: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const demoMode = useAppSelector((state) => state.ui.demoMode);

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "CP";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full p-1 text-sm outline-none transition-all hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User account menu"
      >
        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs ring-1 ring-border">
          {initials}
        </div>
        <span className="hidden lg:inline text-xs font-semibold text-foreground max-w-[100px] truncate">
          {user?.fullName || "My Account"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card p-2 text-card-foreground shadow-xl animate-in fade-in-50 zoom-in-95 z-50">
          {/* User Profile Header */}
          <div className="px-3 py-2.5 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                {initials}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate text-foreground">
                  {user?.fullName || "Coinpath User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || "user@coinpath.io"}
                </p>
              </div>
            </div>
            {isAdmin && (
              <div className="mt-2 inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                <Shield className="size-3" />
                ADMINISTRATOR
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1 text-sm space-y-0.5">
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Settings className="size-4" />
              <span>Account Settings</span>
            </Link>

            <Link
              to="/wallet"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <User className="size-4" />
              <span>Wallet Details</span>
            </Link>

            <button
              onClick={() => dispatch(toggleTheme())}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-2.5">
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                <span>Theme</span>
              </span>
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                {theme}
              </span>
            </button>

            <button
              onClick={() => dispatch(setDemoMode(!demoMode))}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Sparkles className="size-4 text-amber-500" />
                <span>Demo Mode</span>
              </span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                {demoMode ? "ON" : "OFF"}
              </span>
            </button>
          </div>

          {/* Logout */}
          <div className="pt-1 border-t border-border">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="size-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
