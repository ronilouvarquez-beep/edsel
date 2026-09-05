"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  CalendarDaysIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  SearchIcon,
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
import { Input } from "@/components/ui/input";

type TrackerStep = "Confirm" | "Preparing" | "Ready" | "Completed";
type ReservationTracker = {
  id: string;
  customer: string;
  order: string;
  date: string;
  guests: number;
  status: "Pending" | "Confirmed" | "Preparing" | "Completed";
  step: TrackerStep;
};

const trackerSteps: TrackerStep[] = [
  "Confirm",
  "Preparing",
  "Ready",
  "Completed",
];
const initialTrackers: ReservationTracker[] = [
  {
    id: "RES-1042",
    customer: "Maria Santos",
    order: "Chocolate Dedication Cake",
    date: "Sep 06, 2026",
    guests: 12,
    status: "Confirmed",
    step: "Ready",
  },
  {
    id: "RES-1041",
    customer: "Juan Dela Cruz",
    order: "Birthday Dessert Table",
    date: "Sep 07, 2026",
    guests: 30,
    status: "Pending",
    step: "Confirm",
  },
  {
    id: "RES-1040",
    customer: "Ana Reyes",
    order: "Wedding Catering Package",
    date: "Sep 10, 2026",
    guests: 120,
    status: "Confirmed",
    step: "Preparing",
  },
  {
    id: "RES-1039",
    customer: "Carlo Garcia",
    order: "Red Velvet Custom Cake",
    date: "Sep 12, 2026",
    guests: 20,
    status: "Preparing",
    step: "Preparing",
  },
  {
    id: "RES-1038",
    customer: "Liza Tan",
    order: "Corporate Snack Boxes",
    date: "Sep 14, 2026",
    guests: 55,
    status: "Pending",
    step: "Confirm",
  },
  {
    id: "RES-1037",
    customer: "Nina Flores",
    order: "Christening Catering",
    date: "Sep 16, 2026",
    guests: 80,
    status: "Completed",
    step: "Completed",
  },
];

export default function StaffTasksPage() {
  const [trackers, setTrackers] = useState(initialTrackers);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | TrackerStep>("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [view, setView] = useState<"table" | "calendar">("table");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<
    "customer" | "order" | "date" | "guests" | "status" | null
  >(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const filteredTrackers = useMemo(
    () =>
      trackers.filter((tracker) => {
        const matchesSearch =
          `${tracker.customer} ${tracker.order} ${tracker.id}`
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesStep = filter === "All" || tracker.step === filter;
        const matchesDate =
          !selectedDate ||
          new Date(tracker.date).toISOString().slice(0, 10) === selectedDate;
        return matchesSearch && matchesStep && matchesDate;
      }),
    [filter, search, selectedDate, trackers],
  );
  const sortedTrackers = useMemo(
    () =>
      sortColumn
        ? [...filteredTrackers].sort((left, right) => {
            const leftValue = String(left[sortColumn]);
            const rightValue = String(right[sortColumn]);
            const result = leftValue.localeCompare(rightValue, undefined, {
              numeric: true,
            });
            return sortDirection === "asc" ? result : -result;
          })
        : filteredTrackers,
    [filteredTrackers, sortColumn, sortDirection],
  );
  const pageCount = Math.max(1, Math.ceil(sortedTrackers.length / pageSize));
  const visibleTrackers = sortedTrackers.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  function setTrackerStep(id: string, step: TrackerStep) {
    setTrackers((current) =>
      current.map((tracker) =>
        tracker.id === id ? { ...tracker, step } : tracker,
      ),
    );
  }

  function advanceTracker(id: string) {
    setTrackers((current) =>
      current.map((tracker) => {
        const nextIndex = Math.min(
          trackerSteps.indexOf(tracker.step) + 1,
          trackerSteps.length - 1,
        );
        return tracker.id === id
          ? { ...tracker, step: trackerSteps[nextIndex] }
          : tracker;
      }),
    );
  }

  function sortBy(column: typeof sortColumn) {
    if (!column) return;
    setSortDirection(
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc",
    );
    setSortColumn(column);
    setPage(1);
  }

  return (
    <main className="flex flex-1 flex-col bg-muted/20">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-3 md:p-4 lg:p-5">
        <header>
          <p className="text-xs font-medium text-primary">Staff workspace</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Set tracker
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set the preparation stage for every reservation customer.
          </p>
        </header>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Summary
            label="Confirm"
            value={
              trackers.filter((tracker) => tracker.step === "Confirm").length
            }
          />
          <Summary
            label="Preparing"
            value={
              trackers.filter((tracker) => tracker.step === "Preparing").length
            }
          />
          <Summary
            label="Ready"
            value={
              trackers.filter((tracker) => tracker.step === "Ready").length
            }
          />
          <Summary
            label="Completed"
            value={
              trackers.filter((tracker) => tracker.step === "Completed").length
            }
          />
        </section>
        <Card className="bg-background">
          <CardHeader className="gap-3 border-b p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">Reservation tracker</CardTitle>
                <CardDescription className="text-xs">
                  Manage the preparation stage for each customer reservation.
                </CardDescription>
              </div>
              <div className="flex rounded-md bg-muted p-0.5">
                <button
                  type="button"
                  onClick={() => setView("table")}
                  className={`px-2 py-1 text-[11px] font-medium ${view === "table" ? "rounded bg-background shadow-sm" : "text-muted-foreground"}`}
                >
                  Table
                </button>
                <button
                  type="button"
                  onClick={() => setView("calendar")}
                  className={`px-2 py-1 text-[11px] font-medium ${view === "calendar" ? "rounded bg-background shadow-sm" : "text-muted-foreground"}`}
                >
                  Calendar
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-full max-w-xs items-center gap-2">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search customer or reservation"
                    className="h-8 pl-8 text-xs"
                    aria-label="Search trackers"
                  />
                </div>
                <label
                  className="relative flex h-8 items-center gap-1 rounded-md border bg-background px-2 text-[11px] text-muted-foreground"
                  title="Filter by event date"
                >
                  <CalendarDaysIcon className="size-3.5" />
                  <span className="sr-only">Event date</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => {
                      setSelectedDate(event.target.value);
                      setPage(1);
                    }}
                    className="w-[7.2rem] bg-transparent text-xs text-foreground outline-none"
                    aria-label="Filter by event date"
                  />
                  {selectedDate && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate("");
                        setPage(1);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Clear event date"
                    >
                      ×
                    </button>
                  )}
                </label>
              </div>
              <div className="flex gap-1 overflow-x-auto rounded-md bg-muted p-0.5">
                {(["All", ...trackerSteps] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setFilter(item);
                      setPage(1);
                    }}
                    className={`whitespace-nowrap rounded px-2 py-1 text-[11px] font-medium ${filter === item ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {view === "calendar" ? (
              <TrackerCalendar
                trackers={trackers}
                selectedDate={selectedDate}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setPage(1);
                }}
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px] text-xs">
                    <thead className="border-b bg-muted/40 text-left text-muted-foreground">
                      <tr>
                        <SortableHeader
                          label="Customer"
                          column="customer"
                          sortColumn={sortColumn}
                          sortDirection={sortDirection}
                          onSort={sortBy}
                        />
                        <SortableHeader
                          label="Reservation"
                          column="order"
                          sortColumn={sortColumn}
                          sortDirection={sortDirection}
                          onSort={sortBy}
                        />
                        <SortableHeader
                          label="Event date"
                          column="date"
                          sortColumn={sortColumn}
                          sortDirection={sortDirection}
                          onSort={sortBy}
                        />
                        <SortableHeader
                          label="Guests"
                          column="guests"
                          sortColumn={sortColumn}
                          sortDirection={sortDirection}
                          onSort={sortBy}
                          align="right"
                        />
                        <SortableHeader
                          label="Status"
                          column="status"
                          sortColumn={sortColumn}
                          sortDirection={sortDirection}
                          onSort={sortBy}
                        />
                        <th className="px-3 py-2 font-medium">Tracker</th>
                        <th className="px-3 py-2 font-medium">Set</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleTrackers.map((tracker) => (
                        <tr
                          key={tracker.id}
                          className="border-b last:border-0 hover:bg-muted/30"
                        >
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center gap-2">
                              <Avatar className="size-7">
                                <AvatarFallback className="text-[10px]">
                                  {tracker.customer
                                    .split(" ")
                                    .map((name) => name[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                <span className="block font-medium">
                                  {tracker.customer}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {tracker.id}
                                </span>
                              </span>
                            </span>
                          </td>
                          <td className="px-3 py-2">{tracker.order}</td>
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDaysIcon className="size-3.5 text-muted-foreground" />
                              {tracker.date}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            {tracker.guests}
                          </td>
                          <td className="px-3 py-2">
                            <Badge
                              className="text-[10px]"
                              variant={
                                tracker.status === "Confirmed" ||
                                tracker.status === "Completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {tracker.status}
                            </Badge>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex min-w-[400px] items-center gap-1">
                              {trackerSteps.map((step, index) => {
                                const currentIndex = trackerSteps.indexOf(
                                  tracker.step,
                                );
                                const complete = index <= currentIndex;
                                const active = step === tracker.step;
                                return (
                                  <div
                                    key={step}
                                    className="flex flex-1 items-center gap-1"
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setTrackerStep(tracker.id, step)
                                      }
                                      className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] transition-colors ${active ? "bg-primary text-primary-foreground" : complete ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
                                    >
                                      <span className="flex size-3.5 items-center justify-center rounded-full border text-[8px]">
                                        {complete ? (
                                          <CheckIcon className="size-2" />
                                        ) : (
                                          index + 1
                                        )}
                                      </span>
                                      {step}
                                    </button>
                                    {index < trackerSteps.length - 1 && (
                                      <span
                                        className={`h-px flex-1 ${index < currentIndex ? "bg-primary" : "bg-border"}`}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              disabled={tracker.step === "Completed"}
                              onClick={() => advanceTracker(tracker.id)}
                              className="rounded border px-2 py-1 text-[10px] font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {tracker.step === "Completed" ? "Done" : "Go"}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {visibleTrackers.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="h-20 text-center text-muted-foreground"
                          >
                            No reservation trackers found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col gap-2 border-t px-3 py-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Showing{" "}
                    {sortedTrackers.length === 0
                      ? 0
                      : (page - 1) * pageSize + 1}
                    -{Math.min(page * pageSize, sortedTrackers.length)} of{" "}
                    {sortedTrackers.length} reservations
                  </span>
                  <div className="flex items-center gap-2">
                    <label htmlFor="tracker-page-size">Rows</label>
                    <select
                      id="tracker-page-size"
                      value={pageSize}
                      onChange={(event) => {
                        setPageSize(Number(event.target.value));
                        setPage(1);
                      }}
                      className="h-7 rounded border bg-background px-1 text-xs"
                    >
                      <option value="10">10</option>
                      <option value="50">50</option>
                    </select>
                    <span>
                      Page {page} of {pageCount}
                    </span>
                    <button
                      type="button"
                      className="rounded p-1 hover:bg-muted disabled:opacity-40"
                      disabled={page === 1}
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                      aria-label="Previous page"
                    >
                      <ChevronLeftIcon className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      className="rounded p-1 hover:bg-muted disabled:opacity-40"
                      disabled={page >= pageCount}
                      onClick={() =>
                        setPage((current) => Math.min(pageCount, current + 1))
                      }
                      aria-label="Next page"
                    >
                      <ChevronRightIcon className="size-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <ClipboardListIcon className="size-3" /> Click any step to update a
          customer&apos;s preparation tracker.
        </p>
      </div>
    </main>
  );
}

function Summary({ label, value }: { label: TrackerStep; value: number }) {
  return (
    <Card className="bg-background">
      <CardContent className="flex items-center justify-between gap-3 pt-5">
        <div>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-sm font-medium">{label}</p>
        </div>
        <span className="size-3 rounded-full bg-primary" />
      </CardContent>
    </Card>
  );
}

function SortableHeader({
  label,
  column,
  sortColumn,
  sortDirection,
  onSort,
  align,
}: {
  label: string;
  column: "customer" | "order" | "date" | "guests" | "status";
  sortColumn: "customer" | "order" | "date" | "guests" | "status" | null;
  sortDirection: "asc" | "desc";
  onSort: (column: typeof sortColumn) => void;
  align?: "right";
}) {
  return (
    <th
      className={`px-3 py-2 font-medium ${align === "right" ? "text-right" : "text-left"}`}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className="inline-flex items-center gap-1 hover:text-foreground"
      >
        {label}
        {sortColumn === column ? (
          sortDirection === "asc" ? (
            <ArrowUpIcon className="size-3" />
          ) : (
            <ArrowDownIcon className="size-3" />
          )
        ) : (
          <ArrowUpDownIcon className="size-3" />
        )}
      </button>
    </th>
  );
}

function TrackerCalendar({
  trackers,
  selectedDate,
  onSelectDate,
}: {
  trackers: ReservationTracker[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  const days = Array.from({ length: 30 }, (_, index) => index + 1);
  const startOffset = new Date(2026, 8, 1).getDay();
  const dateKey = (day: number) => `2026-09-${String(day).padStart(2, "0")}`;
  const eventsForDay = (day: number) =>
    trackers.filter(
      (tracker) =>
        new Date(tracker.date).toISOString().slice(0, 10) === dateKey(day),
    );

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">September 2026</p>
          <p className="text-xs text-muted-foreground">
            Select a date to filter reservations.
          </p>
        </div>
        {selectedDate && (
          <button
            type="button"
            onClick={() => onSelectDate("")}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear date
          </button>
        )}
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border">
        <div className="contents">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="bg-muted/50 p-2 text-center text-[10px] font-semibold text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>
        {Array.from({ length: startOffset }).map((_, index) => (
          <div key={`empty-${index}`} className="min-h-20 bg-muted/20" />
        ))}
        {days.map((day) => {
          const date = dateKey(day);
          const dayTrackers = eventsForDay(day);
          const isSelected = selectedDate === date;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`min-h-20 bg-background p-2 text-left transition-colors hover:bg-muted/40 ${isSelected ? "ring-2 ring-inset ring-primary" : ""}`}
            >
              <span
                className={`flex size-6 items-center justify-center rounded-full text-xs font-medium ${isSelected ? "bg-primary text-primary-foreground" : ""}`}
              >
                {day}
              </span>
              {dayTrackers.length > 0 && (
                <span className="mt-2 flex items-center gap-1 text-[10px] text-primary">
                  <span className="size-1.5 rounded-full bg-primary" />
                  {dayTrackers.length} reservation
                  {dayTrackers.length === 1 ? "" : "s"}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
