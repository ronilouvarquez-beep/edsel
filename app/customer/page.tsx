import Link from "next/link"
import {
  ArrowUpRightIcon,
  CalendarDaysIcon,
  ChefHatIcon,
  Clock3Icon,
  MapPinIcon,
  MessageCircleHeartIcon,
  ShoppingBagIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LinkButton } from "@/components/ui/button"

export default function CustomerPage() {
  return (
    <main className="flex flex-1 flex-col bg-muted/20">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
        <section className="relative overflow-hidden rounded-2xl bg-primary px-6 py-8 text-primary-foreground md:px-10 md:py-10">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] opacity-75">Your Edsel&apos;s space</p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Good to see you again.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 opacity-80 md:text-base">Plan your next celebration, keep an eye on reservations, and discover something delicious for the table.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton href="/customer/menu" variant="secondary"><ShoppingBagIcon /> Browse the menu</LinkButton>
              <LinkButton href="/customer/reservations" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><CalendarDaysIcon /> Make a reservation</LinkButton>
            </div>
          </div>
          <ChefHatIcon className="absolute -right-3 -bottom-8 size-48 opacity-10 md:right-10 md:size-64" />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Upcoming reservation", value: "1", detail: "See your scheduled visits", icon: <CalendarDaysIcon /> },
            { title: "Saved favorites", value: "0", detail: "Cakes and dishes you love", icon: <ChefHatIcon /> },
            { title: "Open requests", value: "0", detail: "Catering requests in progress", icon: <MessageCircleHeartIcon /> },
          ].map(({ title, value, detail, icon }) => (
            <Card key={title as string} className="bg-background">
              <CardContent className="flex items-center gap-4 pt-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">{icon}</div>
                <div className="min-w-0"><p className="text-2xl font-semibold">{value}</p><p className="truncate text-sm font-medium">{title}</p><p className="truncate text-xs text-muted-foreground">{detail}</p></div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <Card className="bg-background">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b">
              <div><CardTitle>Next up</CardTitle><CardDescription>Your upcoming reservation</CardDescription></div>
              <Badge variant="secondary">Confirmed</Badge>
            </CardHeader>
            <CardContent className="grid gap-5 pt-5 sm:grid-cols-[1fr_auto]">
              <div><p className="text-xl font-semibold">Birthday celebration</p><div className="mt-4 grid gap-3 text-sm text-muted-foreground"><span className="flex items-center gap-2"><CalendarDaysIcon className="size-4 text-primary" /> Saturday, September 14, 2026</span><span className="flex items-center gap-2"><Clock3Icon className="size-4 text-primary" /> 3:00 PM - 6:00 PM</span><span className="flex items-center gap-2"><MapPinIcon className="size-4 text-primary" /> Edsel&apos;s Cake Shop, Cebu City</span></div></div>
              <LinkButton href="/customer/reservations" variant="outline" className="self-end sm:self-start">View details <ArrowUpRightIcon /></LinkButton>
            </CardContent>
          </Card>

          <Card className="bg-background">
            <CardHeader><CardTitle>Need a hand?</CardTitle><CardDescription>We&apos;re here to help with your next event.</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Link href="/customer/messages" className="flex items-center justify-between rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-muted"><span>Talk to our team</span><ArrowUpRightIcon className="size-4 text-muted-foreground" /></Link>
              <Link href="/customer/menu" className="flex items-center justify-between rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-muted"><span>Explore cakes and catering</span><ArrowUpRightIcon className="size-4 text-muted-foreground" /></Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}