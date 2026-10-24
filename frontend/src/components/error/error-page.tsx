import { Button } from "@/shadcn/ui/button";
import { AlertTriangleIcon } from "lucide-react";
import { Link, isRouteErrorResponse, useRouteError } from "react-router";

/**
 * Rendered by the router whenever a route throws: a failed loader, an
 * unmatched url (404) or an error thrown while rendering a page.
 */
export default function ErrorPage() {
  const error = useRouteError();

  let status: number | undefined;
  let title = "Something went wrong";
  let detail = "An unexpected error occurred. Please try again.";

  if (isRouteErrorResponse(error)) {
    status = error.status;
    title = error.status === 404 ? "Page not found" : error.statusText;
    detail =
      error.status === 404
        ? "The page you are looking for does not exist or has been moved."
        : (typeof error.data === "string" && error.data) || detail;
  } else if (error instanceof Error) {
    detail = error.message;
  }

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-4 p-6 text-center">
      <AlertTriangleIcon className="size-10 text-destructive" />
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">
          {status ? `${status} — ${title}` : title}
        </h1>
        <p className="text-muted-foreground max-w-md text-sm">{detail}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
        <Button render={<Link to="/" />}>Go home</Button>
      </div>
    </div>
  );
}
