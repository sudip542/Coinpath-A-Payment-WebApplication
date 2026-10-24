import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "./use-auth";

interface RequireAuthProps {
  children: ReactNode;
  roles?: string[];
}

/**
 * Route guard applied by the route builder to every non-public route.
 * Unauthenticated users are sent to /login (with the attempted url so they can
 * be returned there); authenticated users lacking the role get a 403.
 */
export function RequireAuth({ children, roles }: RequireAuthProps) {
  const { isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasRole(roles)) {
    throw new Response("Forbidden", { status: 403 });
  }

  return children;
}
