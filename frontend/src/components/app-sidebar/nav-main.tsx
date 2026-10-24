import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shadcn/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/shadcn/ui/sidebar";
import { ChevronRightIcon } from "lucide-react";
import { useMemo } from "react";
import { Link, useLocation } from "react-router";
import { useCanAccess } from "../auth/use-auth";
import { customRoutes } from "../routes";
import { filterMenu } from "../routes/filter-menu";
import type { RouteItem } from "../routes/types";

export function NavMain() {
  const canAccess = useCanAccess();
  const { pathname } = useLocation();

  // Recomputed only when the session changes, not on every navigation.
  const menu = useMemo(() => filterMenu(customRoutes, canAccess), [canAccess]);

  const groupedMenu = useMemo(() => {
    const groups: { label: string; items: RouteItem[] }[] = [];
    for (const item of menu) {
      const groupName = item.group || "Platform";
      let group = groups.find((g) => g.label === groupName);
      if (!group) {
        group = { label: groupName, items: [] };
        groups.push(group);
      }
      group.items.push(item);
    }
    return groups;
  }, [menu]);

  const isActive = (item: RouteItem) =>
    item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);

  return (
    <>
      {groupedMenu.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) =>
              item.items?.length ? (
                <Collapsible
                  key={item.url}
                  // Keep the group open when one of its pages is the current page.
                  defaultOpen={item.items.some(isActive)}
                  className="group/collapsible"
                  render={<SidebarMenuItem />}
                >
                  <CollapsibleTrigger
                    render={<SidebarMenuButton tooltip={item.title} />}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                    <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.url}>
                          <SidebarMenuSubButton
                            isActive={isActive(subItem)}
                            render={<Link to={subItem.url} />}
                          >
                            <span>{subItem.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive(item)}
                    render={<Link to={item.url} />}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            )}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
