import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/common/AppLogo";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/uiSlice";
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
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
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

const adminNavItems: NavItem[] = [
  { label: "Admin Dashboard", path: "/admin", icon: ShieldAlert, adminOnly: true },
  { label: "Audit Logs", path: "/admin/audit-logs", icon: FileText, adminOnly: true },
];

export const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const demoMode = useAppSelector((state) => state.ui.demoMode);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out shrink-0 select-none z-30",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        <AppLogo collapsed={collapsed} />
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="hidden lg:flex size-7 items-center justify-center rounded-md border border-sidebar-border text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>

      {/* Demo Mode Badge */}
      {demoMode && (
        <div className="px-3 pt-3">
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 py-1.5",
              collapsed ? "justify-center px-1" : "px-3"
            )}
            title="Demo Mode is Active"
          >
            <Sparkles className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400 animate-pulse" />
            {!collapsed && (
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Demo Mode
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Main Menu
            </p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2"
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn("size-4.5 shrink-0 transition-transform group-hover:scale-105")} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* Admin Navigation */}
        {isAdmin && (
          <div className="space-y-1 pt-2 border-t border-sidebar-border">
            {!collapsed && (
              <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Administration
              </p>
            )}
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isActive
                        ? "bg-rose-600 text-white font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      collapsed && "justify-center px-2"
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="size-4.5 shrink-0 transition-transform group-hover:scale-105" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Coinpath v1.0.0</p>
          <p className="text-[11px] text-muted-foreground/80 mt-0.5">Enterprise Ledger Ready</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
