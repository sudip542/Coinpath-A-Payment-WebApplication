import React from "react";
import { Link } from "react-router-dom";
import { Breadcrumbs } from "./Breadcrumbs";
import { UserMenu } from "./UserMenu";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setMobileSidebarOpen, toggleTheme } from "@/store/slices/uiSlice";
import { Menu, Bell, Sun, Moon, ShieldCheck, Sparkles } from "lucide-react";

export const Topbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const demoMode = useAppSelector((state) => state.ui.demoMode);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-md transition-colors sm:px-6">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(setMobileSidebarOpen(true))}
          className="flex md:hidden size-9 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted"
          aria-label="Open mobile menu"
        >
          <Menu className="size-5" />
        </button>

        <Breadcrumbs />
      </div>

      {/* Right: Status indicators, Theme toggle, Notifications, UserMenu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Security badge */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="size-3.5" />
          <span>256-bit Encrypted</span>
        </div>

        {/* Demo Mode Pill */}
        {demoMode && (
          <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 animate-pulse">
            <Sparkles className="size-3" />
            <span className="hidden sm:inline">DEMO MODE</span>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
        </button>

        {/* Notifications Icon */}
        <Link
          to="/notifications"
          className="relative flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Notifications"
        >
          <Bell className="size-4.5" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-indigo-600 ring-2 ring-card" />
        </Link>

        {/* User Account Menu */}
        <div className="pl-1 border-l border-border">
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
