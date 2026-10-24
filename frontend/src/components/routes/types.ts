import type { ReactNode } from "react";

export interface RouteItem {
  /** Absolute path. Doubles as the menu link target. */
  url: string;
  title: string;
  icon?: ReactNode;
  /** Page to render. Omit for menu-only groups that just hold `items`. */
  element?: ReactNode;
  /** Child routes. Rendered as a collapsible group in the sidebar. */
  items?: RouteItem[];
  /** Sidebar section group title (e.g. "Platform", "Platform Configurations"). Defaults to "Platform". */
  group?: string;

  /** Route exists but must not appear in the sidebar (details pages, /login…). */
  hideInMenu?: boolean;
  /** Reachable without a session. Defaults to false — routes are protected. */
  isPublic?: boolean;
  /**
   * Roles allowed to reach this route and see this menu entry. Undefined means
   * "any authenticated user". Children inherit the parent's roles unless they
   * declare their own.
   */
  roles?: string[];
}
