import type { RouteItem } from "./types";

type AccessCheck = (item: Pick<RouteItem, "isPublic" | "roles">) => boolean;

/**
 * Menu entries the current user may see. Groups inherit their access rules to
 * children and are dropped when nothing inside them survives the filter.
 */
export function filterMenu(
  items: RouteItem[],
  canAccess: AccessCheck
): RouteItem[] {
  return items.reduce<RouteItem[]>((visible, item) => {
    if (item.hideInMenu || !canAccess(item)) return visible;

    if (item.items?.length) {
      const children = filterMenu(
        item.items.map((child) => ({
          isPublic: item.isPublic,
          roles: item.roles,
          ...child,
        })),
        canAccess
      );
      if (!children.length) return visible;
      return [...visible, { ...item, items: children }];
    }

    return [...visible, item];
  }, []);
}
