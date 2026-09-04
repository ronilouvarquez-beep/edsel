"use client"

import * as React from "react"
import Image from "next/image"

import { NavMain } from "@/components/nav-main"
import { NavDocuments } from "@/components/nav-documents"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { CalendarCheckIcon, FileChartColumnIcon, LayoutDashboardIcon, PackageIcon, PartyPopperIcon, ReceiptTextIcon, Settings2Icon, ShoppingBagIcon, TagsIcon, UsersIcon } from "lucide-react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: <LayoutDashboardIcon /> },
    { title: "All Reservation", url: "/admin/reservations", icon: <CalendarCheckIcon /> },
  ],
  directory: [
    { title: "Users", url: "/admin/users", icon: <UsersIcon /> },
    { title: "Menu", url: "/admin/menu", icon: <ShoppingBagIcon /> },
    { title: "Category", url: "/admin/category", icon: <TagsIcon /> },
    { title: "Occasions", url: "/admin/occasions", icon: <PartyPopperIcon /> },
  ],
  navSecondary: [
    { title: "Settings", url: "/admin/settings", icon: <Settings2Icon /> },
  ],
  documents: [
    { name: "Reports", url: "/admin/documents/reports", icon: <FileChartColumnIcon /> },
    { name: "Inventory", url: "/admin/inventory", icon: <PackageIcon /> },
    { name: "Sales", url: "/admin/sales", icon: <ReceiptTextIcon /> },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              href="#"
              className="h-auto min-h-10 data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Image
                src="/logo.jpeg"
                alt="Edsel's Cake Shop logo"
                width={32}
                height={32}
                className="size-8 shrink-0 rounded-md object-cover"
                priority
              />
              <span className="flex min-w-0 flex-col whitespace-normal">
                <span className="truncate text-sm font-semibold leading-tight">
                  Edsel&apos;s Cake Shop &amp; Catering Services
                </span>
                <span className="truncate text-[0.65rem] font-normal leading-tight text-sidebar-foreground/70">
                  Serbisyo ug Lami Para sa Tanan
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavMain items={data.directory} label="Directory" />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
