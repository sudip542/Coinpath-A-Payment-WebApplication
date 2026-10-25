import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";
import { Topbar } from "./Topbar";
import { useAppSelector } from "@/store/hooks";
import { AlertCircle } from "lucide-react";

export const AppLayout: React.FC = () => {
  const demoMode = useAppSelector((state) => state.ui.demoMode);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      <MobileSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar />

        {/* Demo Mode Notice Banner */}
        {demoMode && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                <strong>Demo Mode Active:</strong> Operations use realistic simulation. Disable in Settings or Topbar to connect directly to the Spring Boot backend.
              </span>
            </div>
            <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-wider text-amber-600/80">
              VITE_ENABLE_MOCK_API=true
            </span>
          </div>
        )}

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
