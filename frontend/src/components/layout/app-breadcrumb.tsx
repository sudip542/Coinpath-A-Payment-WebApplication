import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shadcn/ui/breadcrumb";
import { Fragment, useMemo } from "react";
import { Link, useLocation } from "react-router";
import { customRoutes } from "../routes";
import { getBreadcrumbs } from "../routes/breadcrumbs";

/** Breadcrumb trail derived from the url and `customRoutes`. */
export function AppBreadcrumb() {
  const { pathname } = useLocation();
  const crumbs = useMemo(() => getBreadcrumbs(customRoutes, pathname), [pathname]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <Fragment key={crumb.url ?? crumb.title}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {crumb.url ? (
                <BreadcrumbLink render={<Link to={crumb.url} />}>
                  {crumb.title}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
