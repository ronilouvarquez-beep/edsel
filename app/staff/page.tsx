"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ArrowUpRightIcon, CalendarDaysIcon, CheckIcon, Clock3Icon, MessageCircleIcon, MoreHorizontalIcon, UsersIcon, XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, LinkButton } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type ReservationStatus = "Pending" | "Confirmed" | "Declined"
type Reservation = { id: string; customer: string; order: string; date: string; time: string; guests: number; status: ReservationStatus }

const initialReservations: Reservation[] = [
  { id: "RES-1041", customer: "Juan Dela Cruz", order: "Birthday Dessert Table", date: "Sep 07, 2026", time: "2:00 PM", guests: 30, status: "Pending" },
  { id: "RES-1038", customer: "Liza Tan", order: "Corporate Snack Boxes", date: "Sep 14, 2026", time: "10:00 AM", guests: 55, status: "Pending" },
  { id: "RES-1042", customer: "Maria Santos", order: "Chocolate Dedication Cake", date: "Sep 06, 2026", time: "4:00 PM", guests: 12, status: "Confirmed" },
]

export default function StaffPage() {
  const [reservations, setReservations] = useState(initialReservations)
  const pendingCount = reservations.filter((reservation) => reservation.status === "Pending").length

  function updateReservation(id: string, status: ReservationStatus) {
    setReservations((current) => current.map((reservation) => reservation.id === id ? { ...reservation, status } : reservation))
    toast.success(status === "Confirmed" ? "Reservation confirmed." : "Reservation declined.")
  }

  return (
    <main className="flex flex-1 flex-col bg-muted/20"><div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-primary">Operations desk</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Good morning, team.</h1><p className="mt-2 text-muted-foreground">Review today&apos;s schedule and keep every celebration moving.</p></div><LinkButton href="/staff/schedule" variant="outline"><CalendarDaysIcon /> View schedule</LinkButton></section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric title="Awaiting confirmation" value={String(pendingCount)} detail="Needs your attention" icon={<Clock3Icon />} /><Metric title="Today&apos;s events" value="4" detail="Across the shop" icon={<CalendarDaysIcon />} /><Metric title="Guests to prepare for" value="92" detail="Across confirmed orders" icon={<UsersIcon />} /><Metric title="Unread messages" value="3" detail="From customers" icon={<MessageCircleIcon />} /></section>
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card className="bg-background"><CardHeader className="flex flex-row items-start justify-between gap-4 border-b"><div><CardTitle>Reservation queue</CardTitle><CardDescription>Confirm incoming requests before production begins.</CardDescription></div><Badge variant="secondary">{pendingCount} pending</Badge></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-sm"><thead className="border-b bg-muted/30 text-left text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Customer</th><th className="px-5 py-3 font-medium">Order</th><th className="px-5 py-3 font-medium">Event</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 text-right font-medium">Action</th></tr></thead><tbody>{reservations.map((reservation) => <tr key={reservation.id} className="border-b last:border-0"><td className="px-5 py-4"><p className="font-medium">{reservation.customer}</p><p className="text-xs text-muted-foreground">{reservation.id} · {reservation.guests} guests</p></td><td className="px-5 py-4">{reservation.order}</td><td className="px-5 py-4"><p>{reservation.date}</p><p className="text-xs text-muted-foreground">{reservation.time}</p></td><td className="px-5 py-4"><Badge variant={reservation.status === "Confirmed" ? "default" : reservation.status === "Declined" ? "destructive" : "secondary"}>{reservation.status}</Badge></td><td className="px-5 py-4 text-right">{reservation.status === "Pending" ? <span className="inline-flex gap-1"><Button size="icon-sm" aria-label={`Confirm ${reservation.customer}`} onPress={() => updateReservation(reservation.id, "Confirmed")}><CheckIcon /></Button><Button size="icon-sm" variant="outline" aria-label={`Decline ${reservation.customer}`} onPress={() => updateReservation(reservation.id, "Declined")}><XIcon /></Button></span> : <Button variant="ghost" size="icon-sm" aria-label={`More actions for ${reservation.customer}`}><MoreHorizontalIcon /></Button>}</td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t px-5 py-3"><span className="text-xs text-muted-foreground">Updates are saved for this session.</span><LinkButton href="/staff/reservations" variant="link" className="px-0">Open all reservations <ArrowUpRightIcon /></LinkButton></div></CardContent></Card>
        <Card className="bg-background"><CardHeader><CardTitle>Today&apos;s preparation</CardTitle><CardDescription>Keep the floor and kitchen aligned.</CardDescription></CardHeader><CardContent className="space-y-3"><Task label="Confirm ingredient availability" detail="4 of 4 events" done /><Task label="Review the dessert table layout" detail="Birthday Dessert Table" /><Task label="Message the wedding coordinator" detail="Wedding Catering Package" /><Task label="Pack corporate snack boxes" detail="Due Sep 14" /><LinkButton href="/staff/tasks" variant="outline" className="mt-2 w-full">Open task list <ArrowUpRightIcon /></LinkButton></CardContent></Card>
      </section>
    </div></main>
  )
}

function Metric({ title, value, detail, icon }: { title: string; value: string; detail: string; icon: React.ReactNode }) { return <Card className="bg-background"><CardContent className="flex items-center gap-4 pt-5"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">{icon}</div><div className="min-w-0"><p className="text-2xl font-semibold">{value}</p><p className="truncate text-sm font-medium">{title}</p><p className="truncate text-xs text-muted-foreground">{detail}</p></div></CardContent></Card> }

function Task({ label, detail, done = false }: { label: string; detail: string; done?: boolean }) { return <div className="flex items-start gap-3 rounded-lg border p-3"><span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${done ? "border-primary bg-primary text-primary-foreground" : "text-transparent"}`}><CheckIcon className="size-3" /></span><div className="min-w-0"><p className={`text-sm font-medium ${done ? "text-muted-foreground line-through" : ""}`}>{label}</p><p className="mt-0.5 text-xs text-muted-foreground">{detail}</p></div></div> }