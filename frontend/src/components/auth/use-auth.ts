import { useCallback, useContext } from "react";
import { AuthContext } from "./auth-context";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}

/**
 * Menu/route access check shared by the router guard and the sidebar.
 * Stable across renders so callers can memoize on it.
 */
export function useCanAccess() {
  const { isAuthenticated, hasRole } = useAuth();
  return useCallback(
    (item: { isPublic?: boolean; roles?: string[] }) =>
      item.isPublic === true || (isAuthenticated && hasRole(item.roles)),
    [isAuthenticated, hasRole]
  );
}
