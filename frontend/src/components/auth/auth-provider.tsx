import { useMemo, type ReactNode } from "react";
import { AuthContext, type AuthUser } from "./auth-context";

/**
 * Placeholder session. Replace with the real source (token decode, /me call,
 * Keycloak, …) — everything downstream reads it through `useAuth`, so nothing
 * else has to change.
 */
const CURRENT_USER: AuthUser | null = {
  id: "dev",
  name: "Developer",
  email: "dev@keross.com",
  roles: ["admin"],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => {
    const user = CURRENT_USER;
    return {
      user,
      isAuthenticated: user !== null,
      hasRole: (roles?: string[]) =>
        !roles?.length || roles.some((role) => user?.roles.includes(role)),
    };
  }, []);

  return <AuthContext value={value}>{children}</AuthContext>;
}
