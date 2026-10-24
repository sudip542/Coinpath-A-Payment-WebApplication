import { Suspense } from "react";
import { Outlet } from "react-router";
import Navbar from "./Navbar";
import PageLoader from "../page-loader";

export default function MainLayout() {
  return (
    <div className="flex h-svh w-full min-w-0 flex-col overflow-hidden bg-[#0d0f12]">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Scrollable Viewport */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
