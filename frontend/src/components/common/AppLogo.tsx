import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  collapsed?: boolean;
  to?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className,
  collapsed = false,
  to = "/dashboard",
}) => {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-2.5 font-bold tracking-tight text-foreground transition-opacity hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1",
        className
      )}
      aria-label="Coinpath Home"
    >
      <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/20">
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="8" strokeDasharray="30 10" />
          <path d="M10 12l2 2 4-4" stroke="#10B981" strokeWidth="2.5" />
        </svg>
      </div>

      {!collapsed && (
        <span className="text-xl font-extrabold tracking-tight">
          Coin<span className="text-primary font-black">path</span>
        </span>
      )}
    </Link>
  );
};

export default AppLogo;
