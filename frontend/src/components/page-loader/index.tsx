import { Skeleton } from "@/shadcn/ui/skeleton";

/** Suspense fallback shown while a lazily-loaded page chunk is downloading. */
export default function PageLoader() {
  return (
    <div className="flex w-full flex-col gap-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full max-w-2xl" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
