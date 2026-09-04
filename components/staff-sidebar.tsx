"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { CalendarCheckIcon, CalendarDaysIcon, ClipboardListIcon, HouseIcon, MessageCircleIcon, Settings2Icon } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

const staffNav = [
  { title: "Overview", url: "/staff", icon: <HouseIcon /> },
  { title: "Reservations", url: "/staff/reservations", icon: <CalendarCheckIcon /> },
  { title: "Schedule", url: "/staff/schedule", icon: <CalendarDaysIcon /> },
  { title: "Preparation tasks", url: "/staff/tasks", icon: <ClipboardListIcon /> },
  { title: "Messages", url: "/staff/messages", icon: <MessageCircleIcon /> },
]

export function StaffSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({ name: "Staff member", email: "Account", avatar: "" })

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) return
      setUser({ name: data.user.user_metadata?.full_name ?? "Staff member", email: data.user.email ?? "Account", avatar: "" })
    })
  }, [])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader><SidebarMenu><SidebarMenuItem><SidebarMenuButton href="/staff" className="h-auto min-h-10 data-[slot=sidebar-menu-button]:p-1.5!"><Image src="/logo.jpeg" alt="Edsel's Cake Shop logo" width={32} height={32} className="size-8 shrink-0 rounded-md object-cover" priority /><span className="flex min-w-0 flex-col whitespace-normal"><span className="truncate text-sm font-semibold leading-tight">Edsel&apos;s Cake Shop</span><span className="truncate text-[0.65rem] font-normal leading-tight text-sidebar-foreground/70">Staff workspace</span></span></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarHeader>
      <SidebarContent><NavMain items={staffNav} /><NavMain label="Account" items={[{ title: "Settings", url: "/staff/settings", icon: <Settings2Icon /> }]} /></SidebarContent>
      <SidebarFooter><NavUser user={user} /></SidebarFooter>
    </Sidebar>
  )
}