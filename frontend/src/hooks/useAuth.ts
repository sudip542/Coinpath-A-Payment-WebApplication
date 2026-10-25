import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/features/auth/authSlice";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, status, error } = useAppSelector((state) => state.auth);

  const isAdmin = user?.role === "ROLE_ADMIN";

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    role: user?.role,
    status,
    error,
    logout: handleLogout,
  };
}

export default useAuth;
