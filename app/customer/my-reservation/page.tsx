"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, FilterIcon, SearchIcon, ShoppingCartIcon } from "lucide-react"

import { listCustomerReservations, type CustomerReservation } from "@/app/actions/customer-menu"
import { Badge } from "@/components/ui/badge"
import { Button, LinkButton } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { readCustomerCart } from "@/lib/customer-cart"

type ReservationStatus = CustomerReservation["status"]
type Reservation = CustomerReservation
type ColumnKey = keyof Reservation

const columns: { key: ColumnKey; label: string }[] = [
  { key: "order", label: "Order" },
  { key: "event", label: "Event" },
  { key: "date", label: "Event date" },
  { key: "mobileNumber", label: "Mobile number" },
  { key: "status", label: "Status" },
]

export default function MyReservationPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"All" | ReservationStatus>("All")
  const [sortColumn, setSortColumn] = useState<ColumnKey | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const pageSize = 10

  useEffect(() => {
    Promise.resolve().then(() => setCartCount(readCustomerCart().length))
  }, [])

  useEffect(() => {
    async function loadReservations() {
      const { data: userData, error: userError } = await createClient().auth.getUser()
      if (userError || !userData.user) {
        setError("Please sign in to view your reservations.")
        setLoading(false)
        return
      }
      const result = await listCustomerReservations(userData.user.id, userData.user.email ?? null)
      setReservations(result.data)
      setError(result.error)
      setLoading(false)
    }
    loadReservations()
  }, [])

  const filtered = useMemo(() => reservations.filter((reservation) => {
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || Object.values(reservation).some((value) => String(value).toLowerCase().includes(query))
    return matchesSearch && (status === "All" || reservation.status === status)
  }), [reservations, search, status])

  const sorted = useMemo(() => {
    if (!sortColumn) return filtered
    return [...filtered].sort((left, right) => {
      const comparison = String(left[sortColumn]).localeCompare(String(right[sortColumn]), undefined, { numeric: true })
      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [filtered, sortColumn, sortDirection])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const visible = sorted.slice((page - 1) * pageSize, page * pageSize)

  function sortBy(column: ColumnKey) {
    setSortDirection(sortColumn === column && sortDirection === "asc" ? "desc" : "asc")
    setSortColumn(column)
    setPage(1)
  }

  return (
    <main className="flex flex-1 flex-col bg-muted/20">
      <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 p-4 md:p-6 lg:p-8">
        <header>
          <p className="text-sm font-medium text-primary">Customer records</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">My Reservation</h1>
          <p className="mt-2 text-muted-foreground">Review your reservation requests and their current status.</p>
          <LinkButton href="/customer/menu" variant="outline" size="sm" className="mt-4 w-fit"><ShoppingCartIcon />Cart ({cartCount})</LinkButton>
        </header>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <div className="relative min-w-0 max-w-sm flex-1">
              <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search reservations..." className="pl-9" aria-label="Search reservations" />
            </div>
            <DropdownMenuTrigger>
              <Button variant="outline" size="sm" aria-label="Filter reservations"><FilterIcon />Filter</Button>
              <DropdownMenu placement="bottom start">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(["All", "Pending", "Confirmed", "Preparing", "Completed"] as const).map((item) => <DropdownMenuItem key={item} id={item} onAction={() => { setStatus(item); setPage(1) }}>{item}{status === item ? "  ✓" : ""}</DropdownMenuItem>)}
              </DropdownMenu>
            </DropdownMenuTrigger>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-muted-foreground"><tr>{columns.map((column) => <th key={column.key} className="h-10 px-4 font-medium"><button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => sortBy(column.key)}>{column.label}{sortColumn === column.key ? (sortDirection === "asc" ? <ArrowUpIcon className="size-3.5" /> : <ArrowDownIcon className="size-3.5" />) : <ArrowUpDownIcon className="size-3.5" />}</button></th>)}</tr></thead>
              <tbody>
                {loading && <tr><td colSpan={columns.length} className="h-24 text-center text-muted-foreground">Loading reservations...</td></tr>}
                {!loading && error && <tr><td colSpan={columns.length} className="h-24 text-center text-destructive">{error}</td></tr>}
                {!loading && !error && visible.map((reservation) => <tr key={reservation.id} className="border-b last:border-0 hover:bg-muted/30"><td className="px-4 py-3">{reservation.order}</td><td className="px-4 py-3">{reservation.event}</td><td className="px-4 py-3"><span className="inline-flex items-center gap-2"><CalendarDaysIcon className="size-4 text-muted-foreground" />{reservation.date}</span></td><td className="px-4 py-3">{reservation.mobileNumber}</td><td className="px-4 py-3"><Badge variant={reservation.status === "Confirmed" || reservation.status === "Completed" ? "default" : "secondary"}>{reservation.status}</Badge></td></tr>)}
                {!loading && !error && visible.length === 0 && <tr><td colSpan={columns.length} className="h-24 text-center text-muted-foreground">No reservations found.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length} reservations</span><div className="flex items-center gap-2"><span>Page {page} of {pageCount}</span><Button variant="outline" size="icon-sm" aria-label="Previous page" isDisabled={page === 1} onPress={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeftIcon /></Button><Button variant="outline" size="icon-sm" aria-label="Next page" isDisabled={page >= pageCount} onPress={() => setPage((current) => Math.min(pageCount, current + 1))}><ChevronRightIcon /></Button></div></div>
        </div>
      </section>
    </main>
  )
}
