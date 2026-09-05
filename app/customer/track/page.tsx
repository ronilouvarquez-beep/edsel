"use client";

import { useState } from "react";

import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  CookingPotIcon,
  PackageCheckIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type OrderStep = "Confirm" | "Preparing" | "Ready" | "Completed";
type Order = {
  id: string;
  order: string;
  date: string;
  guests: number;
  status: string;
  step: OrderStep;
};

const steps: OrderStep[] = ["Confirm", "Preparing", "Ready", "Completed"];
const stepIcons = [
  ClipboardCheckIcon,
  CookingPotIcon,
  PackageCheckIcon,
  CheckCircle2Icon,
];
const orders: Order[] = [
  {
    id: "RES-1042",
    order: "Chocolate Dedication Cake",
    date: "Sep 06, 2026",
    guests: 12,
    status: "Confirmed",
    step: "Ready",
  },
  {
    id: "RES-1041",
    order: "Birthday Dessert Table",
    date: "Sep 07, 2026",
    guests: 30,
    status: "Pending",
    step: "Confirm",
  },
];

export default function CustomerTrackPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<"order" | "date" | "guests" | "status" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const sortedOrders = sortColumn
    ? [...orders].sort((left, right) => {
        const result = String(left[sortColumn]).localeCompare(String(right[sortColumn]), undefined, { numeric: true });
        return sortDirection === "asc" ? result : -result;
      })
    : orders;
  const pageCount = Math.max(1, Math.ceil(sortedOrders.length / pageSize));
  const visibleOrders = sortedOrders.slice((page - 1) * pageSize, page * pageSize);

  function sortBy(column: typeof sortColumn) {
    if (!column) return;
    setSortDirection(sortColumn === column && sortDirection === "asc" ? "desc" : "asc");
    setSortColumn(column);
    setPage(1);
  }

  return (
    <main className="flex flex-1 flex-col bg-muted/20">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 p-4 md:p-6 lg:p-8">
        <header>
          <p className="text-sm font-medium text-primary">Customer space</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Track my Order
          </h1>
          <p className="mt-2 text-muted-foreground">
            Follow the preparation progress of your reservations.
          </p>
        </header>
        <Card className="bg-background">
          <CardHeader>
            <CardTitle>My orders</CardTitle>
            <CardDescription>
              Your latest reservations and their current preparation stage.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="border-b bg-muted/40 text-left text-muted-foreground">
                  <tr>
                    <SortableHeader label="Order" column="order" sortColumn={sortColumn} sortDirection={sortDirection} onSort={sortBy} />
                    <SortableHeader label="Event date" column="date" sortColumn={sortColumn} sortDirection={sortDirection} onSort={sortBy} />
                    <SortableHeader label="Guests" column="guests" sortColumn={sortColumn} sortDirection={sortDirection} onSort={sortBy} align="right" />
                    <SortableHeader label="Status" column="status" sortColumn={sortColumn} sortDirection={sortDirection} onSort={sortBy} />
                    <th className="px-4 py-3 font-medium">
                      Preparation progress
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleOrders.map((order) => {
                    const currentIndex = steps.indexOf(order.step);
                    return (
                      <tr key={order.id} className="border-b last:border-0">
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-2">
                            <Avatar className="size-8">
                              <AvatarFallback>
                                <ClipboardListIcon className="size-4" />
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              <span className="block font-medium">
                                {order.order}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {order.id}
                              </span>
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDaysIcon className="size-4 text-muted-foreground" />
                            {order.date}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">{order.guests}</td>
                        <td className="px-4 py-4">
                          <Badge
                            variant={
                              order.status === "Confirmed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex min-w-[430px] items-center gap-1">
                            {steps.map((step, index) => {
                              const StepIcon = stepIcons[index];
                              return (
                                <div
                                  key={step}
                                  className="flex flex-1 items-center gap-1"
                                >
                                  <span
                                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${index === currentIndex ? "bg-primary text-primary-foreground" : index < currentIndex ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}
                                  >
                                    <span className="flex size-4 items-center justify-center rounded-full border text-[9px]">
                                      {index <= currentIndex ? (
                                        <CheckIcon className="size-2.5" />
                                      ) : (
                                        <StepIcon className="size-2.5" />
                                      )}
                                    </span>
                                    {step}
                                  </span>
                                  {index < steps.length - 1 && (
                                    <span
                                      className={`h-px flex-1 ${index < currentIndex ? "bg-primary" : "bg-border"}`}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {visibleOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="h-20 text-center text-muted-foreground">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-2 border-t px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>Showing {sortedOrders.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, sortedOrders.length)} of {sortedOrders.length} orders</span>
              <div className="flex items-center gap-2">
                <label htmlFor="order-page-size">Rows</label>
                <select id="order-page-size" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }} className="h-7 rounded border bg-background px-1 text-xs"><option value="10">10</option><option value="50">50</option></select>
                <span>Page {page} of {pageCount}</span>
                <button type="button" className="rounded p-1 hover:bg-muted disabled:opacity-40" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Previous page"><ChevronLeftIcon className="size-3.5" /></button>
                <button type="button" className="rounded p-1 hover:bg-muted disabled:opacity-40" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} aria-label="Next page"><ChevronRightIcon className="size-3.5" /></button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function SortableHeader({ label, column, sortColumn, sortDirection, onSort, align }: { label: string; column: "order" | "date" | "guests" | "status"; sortColumn: "order" | "date" | "guests" | "status" | null; sortDirection: "asc" | "desc"; onSort: (column: "order" | "date" | "guests" | "status" | null) => void; align?: "right" }) {
  return <th className={`px-4 py-3 font-medium ${align === "right" ? "text-right" : "text-left"}`}><button type="button" onClick={() => onSort(column)} className="inline-flex items-center gap-1 hover:text-foreground">{label}{sortColumn === column ? sortDirection === "asc" ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" /> : <ArrowUpDownIcon className="size-3" />}</button></th>
}
