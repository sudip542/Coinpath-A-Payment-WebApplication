import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { logout } from "@/features/auth/authSlice";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  useEffect(() => {
    // Listen for unauthorized 401 events dispatched from axios interceptors
    const handleUnauthorized = () => {
      store.dispatch(logout());
    };

    window.addEventListener("coinpath:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("coinpath:unauthorized", handleUnauthorized);
    };
  }, []);

  return (
    <Provider store={store}>
      <TooltipProvider>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </TooltipProvider>
    </Provider>
  );
};

export default Providers;
