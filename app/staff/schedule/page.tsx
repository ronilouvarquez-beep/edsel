"use client";

import { useMemo, useState } from "react";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Clock3Icon,
  MapPinIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ScheduleEvent = {
  id: number;
  date: string;
  title: string;
  time: string;
  location: string;
  type: string;
  notes: string;
};

type CalendarView = "Day" | "Week" | "Month" | "Year";

const calendarViews: CalendarView[] = ["Day", "Week", "Month", "Year"];

const initialEvents: ScheduleEvent[] = [
  {
    id: 1,
    date: "2026-09-01",
    title: "National Heroes Day setup",
    time: "9:00 AM",
    location: "Main venue",
    type: "Setup",
    notes: "Prepare decoration and buffet area.",
  },
  {
    id: 2,
    date: "2026-09-05",
    title: "Wedding catering",
    time: "2:00 PM",
    location: "Garden venue",
    type: "Event",
    notes: "Confirm buffet and venue styling.",
  },
  {
    id: 3,
    date: "2026-09-12",
    title: "Birthday delivery",
    time: "10:30 AM",
    location: "Makati",
    type: "Delivery",
    notes: "Deliver cake and food trays.",
  },
];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getMonthDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(
    month.getFullYear(),
    month.getMonth(),
    1 - firstDay.getDay(),
  );
  return Array.from(
    { length: 42 },
    (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index),
  );
}

export default function StaffSchedulePage() {
  const [month, setMonth] = useState(new Date(2026, 8, 1));
  const [events, setEvents] = useState(initialEvents);
  const [selectedDate, setSelectedDate] = useState("2026-09-05");
  const [showAdd, setShowAdd] = useState(false);
  const [calendarView, setCalendarView] = useState<CalendarView>("Month");
  const days = useMemo(() => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(
      month.getFullYear(),
      month.getMonth(),
      1 - firstDay.getDay(),
    );
    return Array.from(
      { length: 42 },
      (_, index) =>
        new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate() + index,
        ),
    );
  }, [month]);
  const weekDays = useMemo(() => {
    const selected = new Date(`${selectedDate}T00:00:00`);
    const start = new Date(selected);
    start.setDate(selected.getDate() - selected.getDay());
    return Array.from(
      { length: 7 },
      (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index),
    );
  }, [selectedDate]);
  const yearMonths = useMemo(
    () => Array.from({ length: 12 }, (_, index) => new Date(month.getFullYear(), index, 1)),
    [month],
  );
  const selectedEvents = events.filter((event) => event.date === selectedDate);
  const monthName = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(month);
  const calendarTitle = calendarView === "Year" ? String(month.getFullYear()) : monthName;
  const scheduledEventCount = events.filter((event) =>
    calendarView === "Year"
      ? event.date.startsWith(String(month.getFullYear()))
      : event.date.startsWith(
        `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`,
      ),
  ).length;
  const visibleDays = calendarView === "Day"
    ? [new Date(`${selectedDate}T00:00:00`)]
    : calendarView === "Week"
      ? weekDays
      : days;
  const dayLabels = calendarView === "Month"
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : visibleDays.map((day) => new Intl.DateTimeFormat("en-US", { weekday: "short", day: "numeric" }).format(day));

  function moveMonth(amount: number) {
    setMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  }

  function addEvent(event: Omit<ScheduleEvent, "id">) {
    setEvents((current) => [
      ...current,
      { ...event, id: Math.max(...current.map((item) => item.id), 0) + 1 },
    ]);
    setSelectedDate(event.date);
    setMonth(new Date(`${event.date}T00:00:00`));
    setShowAdd(false);
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-muted/30 p-4 md:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Staff workspace</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Schedule
            </h1>
            <p className="mt-2 text-muted-foreground">
              Review events, deliveries, and assigned service shifts.
            </p>
          </div>
        </header>
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <Card className="overflow-hidden rounded-2xl border-black/10 shadow-sm">
            <CardHeader className="flex flex-col gap-4 border-b bg-background/90 sm:flex-row sm:items-center sm:justify-between">
              <div className="sm:flex-1">
                <CardTitle className="text-2xl tracking-tight">{calendarTitle}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {scheduledEventCount}{" "}
                  scheduled events
                </p>
              </div>
              <div className="order-3 flex items-center self-center rounded-xl border bg-muted/40 p-0.5 sm:order-2">
                {calendarViews.map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => setCalendarView(view)}
                    className={`min-w-20 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${calendarView === view ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {view}
                  </button>
                ))}
              </div>
              <div className="order-2 flex items-center gap-1 self-center sm:order-3 sm:self-auto">
                <Button
                  variant="outline"
                  size="icon"
                  onPress={() => moveMonth(-1)}
                  aria-label="Previous month"
                >
                  <ChevronLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    setMonth(new Date(2026, 8, 1));
                    setSelectedDate("2026-09-05");
                  }}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onPress={() => moveMonth(1)}
                  aria-label="Next month"
                >
                  <ChevronRightIcon />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {calendarView === "Year" ? (
                <div className="grid gap-x-8 gap-y-10 p-6 sm:grid-cols-2 xl:grid-cols-4">
                  {yearMonths.map((yearMonth) => {
                    const monthKey = `${yearMonth.getFullYear()}-${String(yearMonth.getMonth() + 1).padStart(2, "0")}`;
                    const monthEvents = events.filter((event) => event.date.startsWith(monthKey));
                    return (
                      <section
                        key={monthKey}
                        aria-labelledby={`year-month-${monthKey}`}
                        className="min-w-0"
                      >
                        <h3 id={`year-month-${monthKey}`} className="mb-4 text-lg font-medium text-red-500">
                          {new Intl.DateTimeFormat("en-US", { month: "long" }).format(yearMonth)}
                        </h3>
                        <p className="-mt-3 mb-3 text-[10px] text-muted-foreground">
                          {monthEvents.length} {monthEvents.length === 1 ? "event" : "events"}
                        </p>
                        <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] tabular-nums">
                          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                            <span key={`${day}-${index}`} className="font-semibold text-muted-foreground">
                              {day}
                            </span>
                          ))}
                          {getMonthDays(yearMonth).map((day) => {
                            const key = dateKey(day);
                            const isCurrentMonth = day.getMonth() === yearMonth.getMonth();
                            const isSelected = key === selectedDate;
                            const hasEvent = monthEvents.some((event) => event.date === key);
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => setSelectedDate(key)}
                                aria-label={formatDate(day)}
                                className={`mx-auto flex size-6 items-center justify-center rounded-full font-medium transition-colors hover:bg-muted ${isSelected ? "bg-red-500 text-white" : isCurrentMonth ? "text-foreground" : "text-muted-foreground/40"}`}
                                title={hasEvent ? `${monthEvents.find((event) => event.date === key)?.title}` : undefined}
                              >
                                {day.getDate()}
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
                </div>
              ) : (
                <>
                  <div className={`grid ${calendarView === "Day" ? "grid-cols-1" : "grid-cols-7"} border-b bg-muted/20`}>
                    {dayLabels.map((day) => (
                      <div
                        key={day}
                        className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className={`grid ${calendarView === "Day" ? "grid-cols-1" : "grid-cols-7"}`}>
                    {visibleDays.map((day) => {
                  const key = dateKey(day);
                  const dayEvents = events.filter(
                    (event) => event.date === key,
                  );
                  const isCurrentMonth = day.getMonth() === month.getMonth();
                  const isSelected = key === selectedDate;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDate(key)}
                      className={`${calendarView === "Day" ? "min-h-96" : "min-h-28"} border-b border-r p-2 text-left transition-colors hover:bg-muted/40 ${!isCurrentMonth ? "bg-muted/20 text-muted-foreground/50" : "bg-background"} ${isSelected ? "ring-2 ring-inset ring-primary" : ""}`}
                    >
                      <span
                        className={`flex size-7 items-center justify-center rounded-full text-sm ${key === "2026-09-05" ? "bg-destructive text-destructive-foreground" : ""}`}
                      >
                        {day.getDate()}
                      </span>
                      {dayEvents.length > 0 && (
                        <div className="mt-2 grid gap-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <span
                              key={event.id}
                              className="block truncate rounded-md bg-primary/10 px-1.5 py-1 text-[10px] font-medium text-primary"
                            >
                              <span className="mr-1 inline-block size-1.5 rounded-full bg-primary align-middle" />
                              {event.title}
                            </span>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{dayEvents.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="h-fit">
            <CardHeader>
              <p className="text-sm text-muted-foreground">Selected day</p>
              <CardTitle>
                {formatDate(new Date(`${selectedDate}T00:00:00`))}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {selectedEvents.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <CalendarDaysIcon className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No events scheduled.
                  </p>
                </div>
              ) : (
                selectedEvents.map((event) => (
                  <div key={event.id} className="rounded-xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge variant="secondary">{event.type}</Badge>
                        <h3 className="mt-2 font-semibold">{event.title}</h3>
                      </div>
                      <button
                        type="button"
                        className="flex size-8 items-center justify-center rounded-lg hover:bg-muted"
                        aria-label={`Remove ${event.title}`}
                        onClick={() =>
                          setEvents((current) =>
                            current.filter((item) => item.id !== event.id),
                          )
                        }
                      >
                        <XIcon className="size-4" />
                      </button>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Clock3Icon className="size-4 text-primary" />
                        {event.time}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPinIcon className="size-4 text-primary" />
                        {event.location}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
                      <p className="text-sm text-muted-foreground">{event.notes}</p>
                      <Button size="sm" variant="outline" onPress={() => window.alert(`Reminder set for ${event.title}.`)}>Remind</Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {showAdd && (
        <AddScheduleModal onClose={() => setShowAdd(false)} onAdd={addEvent} />
      )}
    </main>
  );
}

function AddScheduleModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (event: Omit<ScheduleEvent, "id">) => void;
}) {
  const [date, setDate] = useState("2026-09-05");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Event");
  const [notes, setNotes] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAdd({ date, title, time, location, type, notes });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-schedule-title"
        className="w-full max-w-lg rounded-2xl border bg-background p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="add-schedule-title"
              className="text-2xl font-bold text-primary"
            >
              Add schedule
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Create an event or staff assignment.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onPress={onClose}
            aria-label="Close add schedule"
          >
            <XIcon />
          </Button>
        </div>
        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Date
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Time
              <Input
                value={time}
                onChange={(event) => setTime(event.target.value)}
                placeholder="9:00 AM"
                required
              />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-medium">
            Schedule title
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Wedding catering"
              required
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Type
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option>Event</option>
                <option>Setup</option>
                <option>Delivery</option>
                <option>Shift</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Location
              <Input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Main venue"
                required
              />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-medium">
            Notes
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Staff instructions or event details"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onPress={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <PlusIcon /> Add schedule
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
