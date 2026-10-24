import type { RouteItem } from "./types";

export interface Crumb {
  title: string;
  /** Undefined when the segment has no route of its own (not clickable). */
  url?: string;
}

/** Flattens the route tree into a url -> route lookup, children included. */
function indexRoutes(
  items: RouteItem[],
  index = new Map<string, RouteItem>()
): Map<string, RouteItem> {
  for (const item of items) {
    index.set(item.url, item);
    if (item.items?.length) indexRoutes(item.items, index);
  }
  return index;
}

/** "workflow-runs" -> "Workflow Runs"; ids and uuids are left untouched. */
function humanize(segment: string) {
  const decoded = decodeURIComponent(segment);
  if (/^[0-9a-f-]{8,}$/i.test(decoded)) return decoded;
  return decoded
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Builds the trail for a pathname from the route config: every url segment
 * becomes a crumb, titled from `customRoutes` when a route matches it and
 * humanized from the segment otherwise (detail pages such as /workflows/42).
 * The last crumb is the current page and is never linked by the renderer.
 */
export function getBreadcrumbs(
  items: RouteItem[],
  pathname: string
): Crumb[] {
  const index = indexRoutes(items);
  const home = index.get("/");
  const root: Crumb = { title: home?.title ?? "Home", url: "/" };

  const segments = pathname.split("/").filter(Boolean);
  if (!segments.length) return [{ ...root, url: undefined }];

  let url = "";
  const trail: Crumb[] = segments.map((segment) => {
    url += `/${segment}`;
    const match = index.get(url);
    return { title: match?.title ?? humanize(segment), url };
  });

  // The current page keeps its title but is rendered as plain text.
  trail[trail.length - 1] = { title: trail[trail.length - 1].title };

  return [...trail];
}
