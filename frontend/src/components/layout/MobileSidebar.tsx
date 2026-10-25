import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/common/AppLogo";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setMobileSidebarOpen } from "@/store/slices/uiSlice";
import {
  LayoutDashboard,
  Wallet,
  Send,
  PlusCircle,
  ArrowDownToLine,
  Receipt,
  CreditCard,
  RotateCcw,
  Bell,
  Settings,
  ShieldAlert,
  FileText,
  X,
  Sparkles,
} from "lucide-react";

const navItems = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { label: "My Wallet", path: "/wallet", icon: Wallet },
  { label: "Send Money", path: "/transfers/new", icon: Send },
  { label: "Add Money", path: "/wallet/add-money", icon: PlusCircle },
  { label: "Withdraw", path: "/wallet/withdraw", icon: ArrowDownToLine },
  { label: "Transactions", path: "/transactions", icon: Receipt },
  { label: "Payments", path: "/payments", icon: CreditCard },
  { label: "Refunds", path: "/refunds", icon: RotateCcw },
  { label: "Notifications", path: "/notifications", icon: Bell },
  { label: "Settings", path: "/settings", icon: Settings },
];

const adminNavItems = [
  { label: "Admin Dashboard", path: "/admin", icon: ShieldAlert },
  { label: "Audit Logs", path: "/admin/audit-logs", icon: FileText },
];

export const MobileSidebar: React.FC = () => {
  const { isAdmin } = useAuth();
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.ui.mobileSidebarOpen);
  const demoMode = useAppSelector((state) => state.ui.demoMode);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => dispatch(setMobileSidebarOpen(false))}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-sidebar text-sidebar-foreground p-4 shadow-2xl flex flex-col justify-between border-r border-sidebar-border animate-in slide-in-from-left duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-sidebar-border">
            <AppLogo />
            <button
              onClick={() => dispatch(setMobileSidebarOpen(false))}
              className="flex size-8 items-center justify-center rounded-lg border border-sidebar-border text-muted-foreground hover:bg-muted"
              aria-label="Close menu"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Demo Mode Badge */}
          {demoMode && (
            <div className="pt-3">
              <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="size-3.5 text-amber-500" />
                Demo Mode
              </div>
            </div>
          )}

          {/* Nav List */}
          <div className="mt-4 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
            <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => dispatch(setMobileSidebarOpen(false))}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )
                  }
                >
                  <Icon className="size-5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            {isAdmin && (
              <div className="pt-3 mt-3 border-t border-sidebar-border space-y-1">
                <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Admin
                </p>
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => dispatch(setMobileSidebarOpen(false))}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-rose-600 text-white font-semibold"
                            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )
                      }
                    >
                      <Icon className="size-5 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-sidebar-border text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Coinpath Mobile</p>
          <p className="text-[11px] text-muted-foreground/80">Secure Instant Transfers</p>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;
