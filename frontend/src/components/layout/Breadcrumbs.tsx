import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const routeNameMap: Record<string, string> = {
  dashboard: "Overview",
  wallet: "My Wallet",
  "add-money": "Add Money",
  withdraw: "Withdraw",
  transfers: "Transfers",
  new: "Send Money",
  transactions: "Transactions",
  payments: "Payments",
  refunds: "Refunds",
  notifications: "Notifications",
  settings: "Settings",
  admin: "Admin",
  "audit-logs": "Audit Logs",
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="hidden sm:flex items-center text-xs text-muted-foreground">
      <ol className="flex items-center space-x-1.5">
        <li>
          <Link
            to="/dashboard"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="size-3.5" />
            <span className="sr-only">Dashboard</span>
          </Link>
        </li>

        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const name = routeNameMap[value] || value;

          return (
            <li key={to} className="flex items-center space-x-1.5">
              <ChevronRight className="size-3 text-muted-foreground/60" />
              {isLast ? (
                <span className="font-semibold text-foreground truncate max-w-[150px]">
                  {name}
                </span>
              ) : (
                <Link
                  to={to}
                  className="hover:text-foreground transition-colors truncate max-w-[120px]"
                >
                  {name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
