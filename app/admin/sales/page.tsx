"use client"

import { useMemo, useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon, CheckCircle2Icon, Clock3Icon, FilterIcon, MoreHorizontalIcon, RefreshCwIcon, SearchIcon, ShoppingBagIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

const initialSales = [
  { id: "SALE-1048", customer: "Maria Santos", date: "Sep 05, 2026", items: "Wedding catering buffet", total: 8500, payment: "GCash", status: "Paid" },
  { id: "SALE-1047", customer: "Juan Dela Cruz", date: "Sep 04, 2026", items: "Fiesta food tray", total: 1450, payment: "Cash", status: "Paid" },
  { id: "SALE-1046", customer: "Ana Reyes", date: "Sep 03, 2026", items: "Birthday cake setup", total: 1800, payment: "GCash", status: "Pending" },
  { id: "SALE-1045", customer: "Carlo Garcia", date: "Sep 02, 2026", items: "Pasta and chicken tray", total: 1250, payment: "Cash", status: "Paid" },
  { id: "SALE-1044", customer: "Liza Mendoza", date: "Sep 01, 2026", items: "Baptism family spread", total: 3500, payment: "GCash", status: "Paid" },
]

type SaleColumn = "id" | "customer" | "date" | "items" | "total" | "payment" | "status"
const saleLabels: Record<SaleColumn, string> = { id: "Sale ID", customer: "Customer", date: "Date", items: "Items", total: "Total", payment: "Payment", status: "Status" }

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(amount)
}

export default function SalesPage() {
  const [sales, setSales] = useState(initialSales)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortColumn, setSortColumn] = useState<SaleColumn | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const query = search.trim().toLowerCase()
  const filtered = useMemo(() => sales.filter((sale) => (!query || Object.values(sale).some((value) => String(value).toLowerCase().includes(query))) && (statusFilter === "All" || sale.status === statusFilter)), [query, sales, statusFilter])
  const sorted = useMemo(() => sortColumn ? [...filtered].sort((left, right) => { const leftValue = String(left[sortColumn]); const rightValue = String(right[sortColumn]); const result = leftValue.localeCompare(rightValue, undefined, { numeric: true }); return sortDirection === "asc" ? result : -result }) : filtered, [filtered, sortColumn, sortDirection])
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)
  const revenue = sales.reduce((sum, sale) => sum + sale.total, 0)
  const paidRevenue = sales.filter((sale) => sale.status === "Paid").reduce((sum, sale) => sum + sale.total, 0)

  function sortBy(column: SaleColumn) {
    setSortDirection(sortColumn === column && sortDirection === "asc" ? "desc" : "asc")
    setSortColumn(column)
    setPage(1)
  }

  function refreshSales() {
    setSearch("")
    setStatusFilter("All")
    setSortColumn(null)
    setPage(1)
    setSales(initialSales)
  }

  return <main className="flex min-h-screen flex-1 flex-col bg-muted/20 p-4 md:p-6 lg:p-8"><div className="mx-auto flex w-full max-w-7xl flex-col gap-6"><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-semibold tracking-tight">Sales</h1><p className="mt-2 text-muted-foreground">Track all completed orders, payments, and revenue.</p></div><Button variant="outline" onPress={refreshSales}><RefreshCwIcon /> Refresh sales</Button></header><section className="grid gap-4 sm:grid-cols-3"><Summary icon={<ShoppingBagIcon />} label="All sales" value={`${sales.length}`} detail="Recorded orders" /><Summary icon={<TrendingUpIcon />} label="Total revenue" value={formatCurrency(revenue)} detail="All recorded sales" /><Summary icon={<CheckCircle2Icon />} label="Paid revenue" value={formatCurrency(paidRevenue)} detail="Confirmed payments" /></section><Card><CardContent className="p-4 lg:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-2"><div className="relative min-w-0 max-w-sm flex-1"><SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search sales..." aria-label="Search sales" className="pl-9" /></div><DropdownMenuTrigger><Button variant="outline" size="sm"><FilterIcon />Filter</Button><DropdownMenu placement="bottom start"><DropdownMenuLabel>Filter by status</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem id="all" onAction={() => { setStatusFilter("All"); setPage(1) }}>All{statusFilter === "All" ? "  ✓" : ""}</DropdownMenuItem><DropdownMenuItem id="paid" onAction={() => { setStatusFilter("Paid"); setPage(1) }}>Paid{statusFilter === "Paid" ? "  ✓" : ""}</DropdownMenuItem><DropdownMenuItem id="pending" onAction={() => { setStatusFilter("Pending"); setPage(1) }}>Pending{statusFilter === "Pending" ? "  ✓" : ""}</DropdownMenuItem></DropdownMenu></DropdownMenuTrigger>{statusFilter !== "All" && <Badge variant="secondary">{statusFilter}</Badge>}</div></div><div className="mt-4 overflow-hidden rounded-lg border bg-card"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/40 text-left text-muted-foreground"><tr>{(Object.keys(saleLabels) as SaleColumn[]).map((column) => <th key={column} className="h-10 px-4 font-medium"><button type="button" onClick={() => sortBy(column)} className="inline-flex items-center gap-1 hover:text-foreground">{saleLabels[column]}{sortColumn === column ? sortDirection === "asc" ? <ArrowUpIcon className="size-3.5" /> : <ArrowDownIcon className="size-3.5" /> : <ArrowUpDownIcon className="size-3.5" />}</button></th>)}<th className="h-10 w-10 px-2"><span className="sr-only">Actions</span></th></tr></thead><tbody>{paginated.map((sale) => <tr key={sale.id} className="border-b last:border-0 hover:bg-muted/30"><td className="px-4 py-3 font-medium">{sale.id}</td><td className="px-4 py-3">{sale.customer}</td><td className="px-4 py-3 text-muted-foreground">{sale.date}</td><td className="px-4 py-3">{sale.items}</td><td className="px-4 py-3 font-medium">{formatCurrency(sale.total)}</td><td className="px-4 py-3">{sale.payment}</td><td className="px-4 py-3"><Badge variant="outline" className={`gap-1.5 ${sale.status === "Paid" ? "text-emerald-700" : "text-amber-700"}`}>{sale.status === "Paid" ? <CheckCircle2Icon className="size-3.5" /> : <Clock3Icon className="size-3.5" />}{sale.status}</Badge></td><td className="px-2 py-3"><button type="button" className="flex size-8 items-center justify-center rounded-lg hover:bg-muted" aria-label={`More actions for ${sale.id}`}><MoreHorizontalIcon className="size-4" /></button></td></tr>)}{paginated.length === 0 && <tr><td colSpan={8} className="h-24 p-3 text-center text-muted-foreground">No sales found.</td></tr>}</tbody></table></div></div><div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>Showing {sorted.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, sorted.length)} of {sorted.length} sales</span><div className="flex items-center gap-2"><label className="flex items-center gap-2">Rows <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }} className="h-8 rounded-md border bg-background px-2"><option value="5">5</option><option value="10">10</option><option value="20">20</option></select></label><span>Page {page} of {pageCount}</span><Button variant="outline" size="icon-sm" aria-label="Previous page" isDisabled={page <= 1} onPress={() => setPage((current) => Math.max(1, current - 1))}>‹</Button><Button variant="outline" size="icon-sm" aria-label="Next page" isDisabled={page >= pageCount} onPress={() => setPage((current) => Math.min(pageCount, current + 1))}>›</Button></div></div></CardContent></Card></div></main>
}

function Summary({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <Card><CardContent className="flex items-center gap-3 p-4"><span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span><div><p className="text-xl font-semibold leading-none">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label} · {detail}</p></div></CardContent></Card>
}
