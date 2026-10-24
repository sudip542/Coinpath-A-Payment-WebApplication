import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Last-resort boundary around the whole app. Route-level errors are handled by
 * the router's `errorElement`; this catches anything that escapes it, such as
 * a failure inside the router provider itself.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught application error:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex min-h-svh w-full flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground max-w-md text-sm">
          {error.message}
        </p>
        <button
          className="border-input hover:bg-accent rounded-md border px-4 py-2 text-sm"
          onClick={() => window.location.reload()}
        >
          Reload the app
        </button>
      </div>
    );
  }
}
