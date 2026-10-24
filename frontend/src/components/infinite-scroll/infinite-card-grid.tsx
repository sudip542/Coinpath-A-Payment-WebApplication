import { Fragment, type Key, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/shadcn/ui/button";
import { Skeleton } from "@/shadcn/ui/skeleton";

import { useInfiniteScroll } from "./use-infinite-scroll";

export type InfiniteCardGridProps<TItem> = {
  /** Every page flattened into one list. */
  items: readonly TItem[];
  renderItem: (item: TItem, index: number) => ReactNode;
  /** A stable id per item. Falling back to the index re-mounts cards on reorder. */
  getItemKey: (item: TItem, index: number) => Key;

  /** The first page is in flight — placeholders stand in for the whole grid. */
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  /**
   * Any request for this list in flight, background refetches included. Pass
   * the query's `isFetching`: a refetch triggered by a mutation replaces every
   * page at once, and a page appended from the sentinel while that is in the
   * air would be computed against the list as it was before.
   */
  isFetching?: boolean;

  isError?: boolean;
  /** Message for the error state. */
  errorMessage?: string;
  /** Wire this to the query's `refetch` to make the error state recoverable. */
  onRetry?: () => void;

  /** Shown once the list has loaded and is empty. */
  emptyState?: ReactNode;
  /** Shown after the last page. Omit it and nothing is drawn. */
  endMessage?: ReactNode;

  /** One placeholder card, repeated. Defaults to a plain block. */
  renderSkeleton?: () => ReactNode;
  /** Placeholders per load. Match it to the endpoint's page size. */
  skeletonCount?: number;
  /**
   * Column tracks and gap for the grid. Replaces the default outright rather
   * than merging onto it, so pass the whole thing — `grid` included.
   *
   * Merging is the tempting alternative and quietly does the wrong thing: a
   * base `grid-cols-1` cannot override the default's `md:grid-cols-2`, because
   * conflicts only resolve within one breakpoint. A caller asking for a single
   * column would get one on a phone and three on a desktop.
   */
  className?: string;
};

const DEFAULT_GRID = "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3";

/**
 * A card grid that loads the next page as the reader reaches the bottom.
 *
 * Deliberately knows nothing about where its pages come from: it takes a flat
 * list plus the paging flags, so it fits any RTK Query `infiniteQuery` — or
 * anything else that can answer "is there more" — without a per-page copy of
 * the loading, empty, error and end-of-list states.
 */
export function InfiniteCardGrid<TItem>({
  items,
  renderItem,
  getItemKey,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  isFetching = false,
  isError = false,
  errorMessage = "Something went wrong while loading this list.",
  onRetry,
  emptyState,
  endMessage,
  renderSkeleton,
  skeletonCount = 6,
  className,
}: InfiniteCardGridProps<TItem>) {
  const gridClass = className ?? DEFAULT_GRID;

  // A failed page must stop the sentinel: leave it observed and it re-fires the
  // request that just failed, on repeat, for as long as the reader sits there.
  const canLoadMore = hasNextPage && !isError;

  const sentinelRef = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasMore: canLoadMore,
    isLoading: isLoading || isFetchingNextPage || isFetching,
  });

  // Offset paging is not a snapshot of one moment: a row inserted or deleted on
  // the server between two page requests moves the boundary, and the same item
  // arrives on two pages. React reconciles duplicate keys wrongly and warns, so
  // the first copy wins and later ones are dropped.
  const seen = new Set<Key>();
  const visible: Array<{ key: Key; item: TItem; index: number }> = [];
  items.forEach((item, index) => {
    const key = getItemKey(item, index);
    if (seen.has(key)) return;
    seen.add(key);
    visible.push({ key, item, index });
  });

  const placeholders = Array.from({ length: skeletonCount }, (_, i) => (
    <Fragment key={`skeleton-${i}`}>
      {renderSkeleton ? renderSkeleton() : <Skeleton className="h-44 w-full rounded-xl" />}
    </Fragment>
  ));

  if (isLoading) {
    return (
      <div className={gridClass} aria-busy="true">
        {placeholders}
      </div>
    );
  }

  // Nothing loaded and the request failed: the error is the whole page.
  if (isError && visible.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center" role="alert">
        <p className="text-sm text-destructive">{errorMessage}</p>
        {/* Wrapped rather than passed directly: these handlers take an options
            object, and React would hand them the click event as one. */}
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => onRetry()}
          >
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <>
        {emptyState ?? (
          <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
            Nothing here yet.
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className={gridClass}>
        {visible.map(({ key, item, index }) => (
          <Fragment key={key}>{renderItem(item, index)}</Fragment>
        ))}
        {isFetchingNextPage && placeholders}
      </div>

      {/* Zero-height and after the grid, so it neither takes a grid cell nor
          shifts anything as it moves in and out of the tree. */}
      {canLoadMore && <div ref={sentinelRef} aria-hidden className="h-px w-full" />}

      <div
        className="flex items-center justify-center py-6 text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        {isFetchingNextPage && (
          <span className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Loading more...
          </span>
        )}

        {/* A page failed with items already on screen: keep them, and offer the
            retry here rather than replacing the list with an error. Retrying is
            `fetchNextPage`, not `onRetry` — the page that failed was never
            cached, and a refetch only re-runs the pages that were. */}
        {isError && !isFetchingNextPage && (
          <span className="flex items-center gap-3">
            <span className="text-destructive">Couldn&apos;t load more.</span>
            <Button variant="outline" size="sm" onClick={() => fetchNextPage()}>
              Try again
            </Button>
          </span>
        )}

        {!hasNextPage && !isError && endMessage}
      </div>
    </>
  );
}
