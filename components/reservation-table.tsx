"use client"

import { useMemo, useState } from "react"
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, Columns3Icon, FilterIcon, RefreshCwIcon, SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

const initialReservations = [
  { id: "RES-1042", customer: "Maria Santos", order: "Chocolate Dedication Cake", date: "Sep 06, 2026", guests: 12, status: "Confirmed" },
  { id: "RES-1041", customer: "Juan Dela Cruz", order: "Birthday Dessert Table", date: "Sep 07, 2026", guests: 30, status: "Pending" },
  { id: "RES-1040", customer: "Ana Reyes", order: "Wedding Catering Package", date: "Sep 10, 2026", guests: 120, status: "Confirmed" },
  { id: "RES-1039", customer: "Carlo Garcia", order: "Red Velvet Custom Cake", date: "Sep 12, 2026", guests: 20, status: "Preparing" },
  { id: "RES-1038", customer: "Liza Tan", order: "Corporate Snack Boxes", date: "Sep 14, 2026", guests: 55, status: "Pending" },
  { id: "RES-1037", customer: "Nina Flores", order: "Christening Catering", date: "Sep 16, 2026", guests: 80, status: "Completed" },
]

const columnLabels = {
  customer: "Customer",
  order: "Food order",
  date: "Event date",
  guests: "Guests",
  status: "Status",
} as const

type ColumnKey = keyof typeof columnLabels

export function ReservationTable() {
  const [reservations, setReservations] = useState(initialReservations)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("All")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortColumn, setSortColumn] = useState<ColumnKey | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    customer: true,
    order: true,
    date: true,
    guests: true,
    status: true,
  })

  const filteredReservations = useMemo(() => {
    const searchTerm = search.toLowerCase().trim()
    return reservations.filter((reservation) => {
      const matchesSearch = !searchTerm || Object.values(reservation).some((value) => String(value).toLowerCase().includes(searchTerm))
      const matchesStatus = status === "All" || reservation.status === status
      return matchesSearch && matchesStatus
    })
  }, [reservations, search, status])

  const sortedReservations = useMemo(() => {
    if (!sortColumn) return filteredReservations
    return [...filteredReservations].sort((left, right) => {
      const leftValue = String(left[sortColumn])
      const rightValue = String(right[sortColumn])
      return sortDirection === "asc"
        ? leftValue.localeCompare(rightValue, undefined, { numeric: true })
        : rightValue.localeCompare(leftValue, undefined, { numeric: true })
    })
  }, [filteredReservations, sortColumn, sortDirection])

  const pageCount = Math.max(1, Math.ceil(sortedReservations.length / pageSize))
  const paginatedReservations = sortedReservations.slice((page - 1) * pageSize, page * pageSize)

  function toggleColumn(column: ColumnKey) {
    setVisibleColumns((current) => ({ ...current, [column]: !current[column] }))
  }

  function sortBy(column: ColumnKey) {
    if (sortColumn === column) {
      setSortDirection((current) => current === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
    setPage(1)
  }

  function refreshReservations() {
    setReservations([...initialReservations])
    setSearch("")
    setStatus("All")
    setPage(1)
  }

  return (
    <section className="flex flex-1 flex-col gap-4 px-4 pb-6 lg:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">All Reservation</h1>
          <p className="text-sm text-muted-foreground">Manage food orders and catering reservations.</p>
        </div>
      </div>

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
                {(["All", "Pending", "Confirmed", "Preparing", "Completed"] as const).map((item) => (
                  <DropdownMenuItem key={item} id={item} onAction={() => { setStatus(item); setPage(1) }}>
                    {item}{status === item ? "  ✓" : ""}
                  </DropdownMenuItem>
                ))}
              </DropdownMenu>
            </DropdownMenuTrigger>
            {status !== "All" && <Badge variant="secondary">{status}</Badge>}
          </div>

          <div className="flex items-center justify-end gap-1 rounded-md border bg-card p-1">
            <DropdownMenuTrigger>
              <Button variant="ghost" size="sm" aria-label="Choose columns"><Columns3Icon />Columns</Button>
              <DropdownMenu placement="bottom end">
                <DropdownMenuLabel>Show columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.keys(columnLabels) as ColumnKey[]).map((column) => (
                  <DropdownMenuItem key={column} id={column} onAction={() => toggleColumn(column)}>
                    {visibleColumns[column] ? "✓  " : "    "}{columnLabels[column]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenu>
            </DropdownMenuTrigger>
            <Button variant="ghost" size="icon" aria-label="Refresh reservations" onPress={refreshReservations}>
              <RefreshCwIcon />
            </Button>
          </div>
        </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-muted-foreground">
              <tr>
                {visibleColumns.customer && <SortableHeader column="customer" label="Customer" sortColumn={sortColumn} sortDirection={sortDirection} onSort={sortBy} />}
                {visibleColumns.order && <SortableHeader column="order" label="Food order" sortColumn={sortColumn} sortDirection={sortDirection} onSort={sortBy} />}
                {visibleColumns.date && <SortableHeader column="date" label="Event date" sortColumn={sortColumn} sortDirection={sortDirection} onSort={sortBy} />}
                {visibleColumns.guests && <SortableHeader column="guests" label="Guests" sortColumn={sortColumn} sortDirection={sortDirection} onSort={sortBy} align="right" />}
                {visibleColumns.status && <SortableHeader column="status" label="Status" sortColumn={sortColumn} sortDirection={sortDirection} onSort={sortBy} />}
              </tr>
            </thead>
            <tbody>
              {paginatedReservations.map((reservation) => (
                <tr key={reservation.id} className="border-b last:border-0 hover:bg-muted/30">
                  {visibleColumns.customer && <td className="px-4 py-3"><span className="inline-flex items-center gap-2"><Avatar className="size-8"><AvatarFallback>{reservation.customer.split(" ").map((name) => name[0]).join("")}</AvatarFallback></Avatar>{reservation.customer}</span></td>}
                  {visibleColumns.order && <td className="px-4 py-3">{reservation.order}</td>}
                  {visibleColumns.date && <td className="px-4 py-3"><span className="inline-flex items-center gap-2"><CalendarDaysIcon className="size-4 text-muted-foreground" />{reservation.date}</span></td>}
                  {visibleColumns.guests && <td className="px-4 py-3 text-right">{reservation.guests}</td>}
                  {visibleColumns.status && <td className="px-4 py-3"><Badge variant={reservation.status === "Confirmed" || reservation.status === "Completed" ? "default" : "secondary"}>{reservation.status}</Badge></td>}
                </tr>
              ))}
              {sortedReservations.length === 0 && <tr><td colSpan={5} className="h-24 text-center text-muted-foreground">No reservations found.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Showing {filteredReservations.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredReservations.length)} of {filteredReservations.length} reservations</span>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="page-size" className="sr-only">Rows per page</label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}
              className="h-8 rounded-md border bg-background px-2 text-sm text-foreground"
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>
            <span>Page {page} of {pageCount}</span>
            <Button variant="outline" size="icon-sm" aria-label="Previous page" isDisabled={page === 1} onPress={() => setPage((current) => Math.max(1, current - 1))}>
              <ChevronLeftIcon />
            </Button>
            <Button variant="outline" size="icon-sm" aria-label="Next page" isDisabled={page >= pageCount} onPress={() => setPage((current) => Math.min(pageCount, current + 1))}>
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function SortableHeader({ column, label, sortColumn, sortDirection, onSort, align }: { column: ColumnKey; label: string; sortColumn: ColumnKey | null; sortDirection: "asc" | "desc"; onSort: (column: ColumnKey) => void; align?: "right" }) {
  const isActive = sortColumn === column
  return (
    <th className={`h-10 px-4 font-medium ${align === "right" ? "text-right" : "text-left"}`}>
      <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => onSort(column)}>
        {label}
        {isActive ? (sortDirection === "asc" ? <ArrowUpIcon className="size-3.5" /> : <ArrowDownIcon className="size-3.5" />) : <ArrowUpDownIcon className="size-3.5" />}
      </button>
    </th>
  )
}
