import { StaffSidebar } from "@/components/staff-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function StaffLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}><StaffSidebar variant="inset" /><SidebarInset><SiteHeader />{children}</SidebarInset></SidebarProvider>
}