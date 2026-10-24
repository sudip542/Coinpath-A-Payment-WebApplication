"use client"

import * as React from "react"

import { NavMain } from "@/components/app-sidebar/nav-main"
import { NavUser } from "@/components/app-sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/shadcn/ui/sidebar"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="text-center">
        <div className="truncate text-2xl group-data-[collapsible=icon]:hidden">
          Agentesa
        </div>
        <div className="truncate text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
          Where every workflow becomes an agent.
        </div>
        <div className="hidden text-2xl group-data-[collapsible=icon]:block">
          A
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
