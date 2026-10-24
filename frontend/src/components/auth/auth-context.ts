import { createContext } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True when the required roles are satisfied (undefined/empty = any role). */
  hasRole: (roles?: string[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
