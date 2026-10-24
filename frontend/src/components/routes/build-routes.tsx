import type { RouteObject } from "react-router";
import { RequireAuth } from "../auth/require-auth";
import ErrorPage from "../error/error-page";
import type { RouteItem } from "./types";

/**
 * Flattens the menu tree into router route objects.
 *
 * - entries without an `element` are menu-only groups and register no route;
 * - `url: "/"` becomes the index route of the layout;
 * - protected entries are wrapped in `<RequireAuth>`, so authorization is
 *   declared once in the route config and enforced automatically;
 * - children inherit `roles` / `isPublic` unless they override them.
 */
export function buildRouteObjects(items: RouteItem[]): RouteObject[] {
  return items.flatMap((item) => {
    const children = item.items
      ? buildRouteObjects(
          item.items.map((child) => ({
            isPublic: item.isPublic,
            roles: item.roles,
            ...child,
          }))
        )
      : [];

    if (!item.element) return children;

    const element = item.isPublic ? (
      item.element
    ) : (
      <RequireAuth roles={item.roles}>{item.element}</RequireAuth>
    );

    // Per-route boundary: a page failure stays inside the layout.
    const route: RouteObject =
      item.url === "/"
        ? { index: true, element, errorElement: <ErrorPage /> }
        : { path: item.url, element, errorElement: <ErrorPage /> };

    return [route, ...children];
  });
}
