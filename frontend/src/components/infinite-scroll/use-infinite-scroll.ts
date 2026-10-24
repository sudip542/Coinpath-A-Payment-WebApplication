import { useEffect, useRef, useState } from "react";

export type UseInfiniteScrollOptions = {
  /** Asks for the next page. Called at most once per intersection. */
  onLoadMore: () => void;
  /** Whether a next page exists at all. Nothing is observed when false. */
  hasMore: boolean;
  /** True while any page is in flight, so a load is never asked for twice. */
  isLoading: boolean;
  /**
   * How far below the viewport the sentinel starts counting as visible. The
   * next page is therefore already arriving by the time the reader gets there.
   */
  rootMargin?: string;
};

/**
 * Watches an element and asks for the next page when it nears the viewport.
 *
 * Returns a ref callback: put it on an empty element after the last item and
 * the list loads itself. Scroll listeners are the usual alternative and cost a
 * layout read on every frame; the observer is told once and stays quiet until
 * the element actually approaches.
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  rootMargin = "400px",
}: UseInfiniteScrollOptions) {
  // State rather than a ref for the node: the observer has to be attached the
  // moment the element mounts, and only a re-render tells an effect that it did.
  const [sentinel, setSentinel] = useState<Element | null>(null);

  // Read through a ref so a caller passing an inline handler does not tear the
  // observer down and build it again on every single render.
  const onLoadMoreRef = useRef(onLoadMore);
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  // Standing down for the duration of a load is not only about not asking
  // twice. A finished load leaves the sentinel where it was, so if it is still
  // on screen — a short page, or a viewport taller than the items — a surviving
  // observer would have no change to report and the list would stall one page
  // in. Building a new one instead gets a fresh callback for where it already is.
  useEffect(() => {
    if (!sentinel || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMoreRef.current();
      },
      { rootMargin },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, hasMore, isLoading, rootMargin]);

  return setSentinel;
}
