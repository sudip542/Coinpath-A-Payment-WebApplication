import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { AuthProvider } from "../auth/auth-provider";
import { ErrorBoundary } from "../error/error-boundary";
import ErrorPage from "../error/error-page";
import MainLayout from "../layout/MainLayout";
import { customRoutes } from "../routes";
import { buildRouteObjects } from "../routes/build-routes";

// Built once at module load: the route tree is static, only access is dynamic.
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    // Catches unmatched urls (404) and anything the page boundaries miss.
    errorElement: <ErrorPage />,
    children: buildRouteObjects(customRoutes),
  },
]);

export default function CustomRouterProvider() {
  return (
    <ErrorBoundary>
      {/* Outside the router so guards and the sidebar share one session. */}
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  );
}
