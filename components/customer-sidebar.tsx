"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  CalendarCheckIcon,
  CircleUserRoundIcon,
  HouseIcon,
  MenuIcon,
  MessageCircleHeartIcon,
  Settings2Icon,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { NavMain } from "@/components/nav-main"
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

const customerNav = [
  { title: "Overview", url: "/customer", icon: <HouseIcon /> },
  { title: "Browse Menu", url: "/customer/menu", icon: <MenuIcon /> },
  { title: "My Reservations", url: "/customer/reservations", icon: <CalendarCheckIcon /> },
  { title: "Messages", url: "/customer/messages", icon: <MessageCircleHeartIcon /> },
]

export function CustomerSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({ name: "Customer", email: "Account", avatar: "" })

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) return
      setUser({
        name: data.user.user_metadata?.full_name ?? "Customer",
        email: data.user.email ?? "Account",
        avatar: "",
      })
    })
  }, [])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="/customer" className="h-auto min-h-10 data-[slot=sidebar-menu-button]:p-1.5!">
              <Image src="/logo.jpeg" alt="Edsel's Cake Shop logo" width={32} height={32} className="size-8 shrink-0 rounded-md object-cover" priority />
              <span className="flex min-w-0 flex-col whitespace-normal">
                <span className="truncate text-sm font-semibold leading-tight">Edsel&apos;s Cake Shop</span>
                <span className="truncate text-[0.65rem] font-normal leading-tight text-sidebar-foreground/70">Customer space</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={customerNav} />
        <NavMain
          label="Account"
          items={[
            { title: "Profile", url: "/customer/profile", icon: <CircleUserRoundIcon /> },
            { title: "Settings", url: "/customer/settings", icon: <Settings2Icon /> },
          ]}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}