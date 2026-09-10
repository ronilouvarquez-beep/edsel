"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import dynamic from "next/dynamic"
import Image from "next/image"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CakeSliceIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  ChefHatIcon,
  ChevronDownIcon,
  ChurchIcon,
  ClipboardCheckIcon,
  CreditCardIcon,
  EyeIcon,
  HeartIcon,
  Maximize2Icon,
  PartyPopperIcon,
  SearchIcon,
  ShoppingCartIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import { createReservation, listCustomerCatalog, type CustomerMenuItem } from "@/app/actions/customer-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { readCustomerCart, writeCustomerCart } from "@/lib/customer-cart"

const ReactPhotoSphereViewer = dynamic(
  () => import("react-photo-sphere-viewer").then((module) => module.ReactPhotoSphereViewer),
  { ssr: false },
)

const steps = [
  { title: "Select Menu", description: "Choose what you need", icon: ChefHatIcon },
  { title: "Event", description: "Choose the occasion", icon: PartyPopperIcon },
  { title: "Details", description: "Set date and event details", icon: CalendarDaysIcon },
  { title: "Review", description: "Confirm your request", icon: ClipboardCheckIcon },
  { title: "Payment", description: "Choose how to pay", icon: CreditCardIcon },
]

const eventTypes = [
  { title: "Birthday", description: "Cakes and party treats", icon: CakeSliceIcon },
  { title: "Wedding", description: "Catering for your special day", icon: HeartIcon },
  { title: "Food trays & Dessert", description: "Sharing food, cakes, pastries, and sweet treats", icon: ChefHatIcon },
  { title: "Baptism", description: "A thoughtful celebration spread", icon: ChurchIcon },
  { title: "Other event", description: "Tell us what you are planning", icon: PartyPopperIcon },
]

type ReservationPackage = {
  id: string
  title: string
  category: string
  categories: string[]
  description: string
  price: string
  includes: string[]
  images: string[]
  kind: CustomerMenuItem["kind"]
}

function toReservationPackage(item: CustomerMenuItem): ReservationPackage {
  return {
    id: item.id,
    title: item.name,
    category: item.category,
    categories: [item.kind === "occasion" ? "Occasions" : "Food", item.category],
    description: item.description,
    price: item.price,
    includes: item.includes,
    images: item.images,
    kind: item.kind,
  }
}

const PAGE_SIZE = 10

export default function CustomerReservationsPage() {
  const [packages, setPackages] = useState<ReservationPackage[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [eventType, setEventType] = useState("Birthday")
  const [eventDate, setEventDate] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [location, setLocation] = useState("")
  const [eventDetails, setEventDetails] = useState<Record<string, string>>({})
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [paymentReference, setPaymentReference] = useState("")
  const [gcashAccountName, setGcashAccountName] = useState("")
  const [gcashNumber, setGcashNumber] = useState("")
  const [gcashReceipt, setGcashReceipt] = useState<File | null>(null)
  const [cart, setCart] = useState<string[]>([])
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({})
  const [showCart, setShowCart] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    Promise.resolve().then(() => {
      const storedCart = readCustomerCart()
      setCart(storedCart)
      setCartQuantities(Object.fromEntries(storedCart.map((id) => [id, 1])))
    })
    listCustomerCatalog().then(({ data, error }) => {
      if (error) toast.error("Failed to load menus.", { description: error })
      setPackages((data ?? []).map(toReservationPackage))
      setCatalogLoading(false)
    })
  }, [])

  function validateDetails() {
    if (eventType !== "Birthday") return true

    const requiredFields = [
      ["Event date", eventDate],
      ["Mobile Number", mobileNumber],
      ["Event Started", eventDetails.eventStarted],
      ["Event location", location],
      ["Celebrant name", eventDetails.celebrantName],
      ["Age of celebrant", eventDetails.ageOfCelebrant],
      ["Birthday theme", eventDetails.birthdayTheme],
    ]

    const missingField = requiredFields.find(([, value]) => !value?.trim())
    if (missingField) {
      toast.error(`Please fill in ${missingField[0]}.`)
      return false
    }

    return true
  }

  async function nextStep() {
    if (step === 0 && cart.length === 0) {
      toast.error("Please add at least one menu item before continuing.")
      return
    }
    if (step === 2 && !validateDetails()) return
    if (step === steps.length - 1) {
      if ((paymentMethod === "GCash" || paymentMethod === "Maya") && !gcashReceipt) return
      const { data: userData, error: userError } = await createClient().auth.getUser()
      if (userError || !userData.user) {
        toast.error("Please sign in before confirming your reservation.")
        return
      }

      const selectedPackages = packages.filter((item) => cart.includes(item.id))
      const totalAmount = selectedPackages.reduce((sum, item) => sum + getPackagePrice(item.price) * (cartQuantities[item.id] ?? 1), 0)
      const { error } = await createReservation({
        customerId: userData.user.id,
        customerEmail: userData.user.email ?? null,
        eventType,
        eventDate,
        mobileNumber,
        location,
        eventDetails,
        cart,
        quantities: cartQuantities,
        packages: selectedPackages.map((item) => ({ id: item.id, kind: item.kind, name: item.title, price: item.price })),
        totalAmount,
        paymentMethod: paymentMethod as "Cash" | "GCash" | "Maya",
        paymentReference,
        paymentAccountName: gcashAccountName,
        paymentAccountNumber: gcashNumber,
        paymentReceipt: gcashReceipt,
      })
      if (error) {
        toast.error("Unable to save your reservation.", { description: error })
        return
      }
      writeCustomerCart([])
      setCart([])
      setCartQuantities({})
      setSubmitted(true)
      return
    }
    setStep((current) => current + 1)
  }

  function addToCart(id: string) {
    setCart((current) => {
      const next = current.includes(id) ? current : [...current, id]
      writeCustomerCart(next)
      return next
    })
    setCartQuantities((current) => ({ ...current, [id]: current[id] ?? 1 }))
  }

  function toggleCart(id: string) {
    setCart((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      writeCustomerCart(next)
      return next
    })
    setCartQuantities((current) => { const next = { ...current }; if (next[id]) delete next[id]; else next[id] = 1; return next })
  }

  function removeFromCart(id: string) {
    setCart((current) => {
      const next = current.filter((item) => item !== id)
      writeCustomerCart(next)
      return next
    })
    setCartQuantities((current) => { const next = { ...current }; delete next[id]; return next })
  }

  function changeCartQuantity(id: string, quantity: number) {
    setCartQuantities((current) => ({ ...current, [id]: Math.max(1, quantity) }))
  }

  if (submitted) {
    return <SuccessState eventType={eventType} eventDate={eventDate} />
  }

  return (
    <main className="customer-reservation-form flex flex-1 flex-col bg-muted/20">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
        <section>
          <p className="text-sm font-medium text-primary">Plan your celebration</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Make a reservation</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Share a few details and our team will prepare the perfect cake, food, or event package for you.</p>
        </section>

        <nav aria-label="Reservation progress" className="grid grid-cols-5 gap-2">
          {steps.map((item, index) => {
            const Icon = item.icon
            const isCurrent = index === step
            const isComplete = index < step
            return <button key={item.title} type="button" onClick={() => index <= step && setStep(index)} className={`group flex min-w-0 flex-col gap-2 border-t-2 pt-3 text-left transition-colors ${isCurrent ? "border-primary text-foreground" : isComplete ? "border-primary/50 text-primary" : "border-border text-muted-foreground"}`} aria-current={isCurrent ? "step" : undefined}><span className="flex items-center gap-2"><span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${isCurrent ? "bg-primary text-primary-foreground" : isComplete ? "bg-primary/15 text-primary" : "bg-muted"}`}>{isComplete ? <CheckCircle2Icon className="size-4" /> : <Icon className="size-4" />}</span><span className="hidden min-w-0 sm:block"><span className="block truncate text-sm font-medium">{item.title}</span><span className="block truncate text-xs text-muted-foreground">{item.description}</span></span><span className="text-xs font-medium sm:hidden">{index + 1}</span></span></button>
          })}
        </nav>

        <Card className="bg-background">
          {step === 0 && <MenuStep packages={packages} loading={catalogLoading} cart={cart} onAddToCart={addToCart} onToggleCart={toggleCart} onChange={() => undefined} onCustomize={(id, title, details, quantity) => { addToCart(id); changeCartQuantity(id, quantity) }} />}
          {step === 1 && <EventStep value={eventType} onChange={setEventType} />}
          {step === 2 && <CustomerDetailsStep eventType={eventType} eventDate={eventDate} mobileNumber={mobileNumber} location={location} details={eventDetails} onDateChange={setEventDate} onMobileNumberChange={setMobileNumber} onLocationChange={setLocation} onDetailsChange={(key, value) => setEventDetails((current) => ({ ...current, [key]: value }))} />}
          {step === 3 && <ReviewStep packages={packages} cart={cart} quantities={cartQuantities} eventType={eventType} eventDate={eventDate} guests={mobileNumber} location={location} eventDetails={eventDetails} />}
          {step === 4 && <><PaymentNotice /><PaymentStep method={paymentMethod} reference={paymentReference} gcashAccountName={gcashAccountName} gcashNumber={gcashNumber} gcashReceipt={gcashReceipt} onMethodChange={setPaymentMethod} onReferenceChange={setPaymentReference} onGcashAccountNameChange={setGcashAccountName} onGcashNumberChange={setGcashNumber} onGcashReceiptChange={setGcashReceipt} /><ReceiptPreview key={`${paymentMethod}-${gcashReceipt?.name ?? "none"}-${gcashReceipt?.lastModified ?? 0}`} file={gcashReceipt} active={paymentMethod === "GCash" || paymentMethod === "Maya"} method={paymentMethod} accountName={gcashAccountName} phoneNumber={gcashNumber} reference={paymentReference} /><UnavailablePaymentMethods /></>}
          <CardContent className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between"><Button variant="ghost" onPress={() => setStep((current) => Math.max(0, current - 1))} isDisabled={step === 0}><ArrowLeftIcon /> Back</Button><div className="flex items-center gap-3"><span className="text-xs text-muted-foreground">Step {step + 1} of {steps.length}</span><Button onPress={nextStep} isDisabled={(step === 0 && cart.length === 0) || (step === steps.length - 1 && (paymentMethod === "GCash" || paymentMethod === "Maya") && !gcashReceipt)}>{step === steps.length - 1 ? "Confirm reservation" : "Continue"}{step === steps.length - 1 ? <CheckCircle2Icon /> : <ArrowRightIcon />}</Button></div></CardContent>
        </Card>
        {step === 0 && <div className="sticky bottom-4 z-20 flex justify-end pointer-events-none"><Button size="icon-lg" className="pointer-events-auto relative rounded-full shadow-xl" onPress={() => setShowCart(true)} aria-label={`View cart with ${cart.length} item${cart.length === 1 ? "" : "s"}`}><ShoppingCartIcon />{cart.length > 0 && <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">{cart.length}</span>}</Button></div>}
        {showCart && <CartModal packages={packages} items={cart} quantities={cartQuantities} onQuantityChange={changeCartQuantity} onRemove={removeFromCart} onClose={() => setShowCart(false)} />}
      </div>
    </main>
  )
}

function EventStep({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <><CardHeader><CardTitle>What would you like to add?</CardTitle><CardDescription>Choose the items or services you would like to include in your reservation.</CardDescription></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{eventTypes.map(({ title, description, icon: Icon }) => <button key={title} type="button" onClick={() => onChange(title)} className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${value === title ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "hover:bg-muted"}`} aria-pressed={value === title}><span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${value === title ? "bg-primary text-primary-foreground" : "bg-muted text-primary"}`}><Icon className="size-5" /></span><span><span className="block font-medium">{title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span></span></button>)}</CardContent></>
}

function DateField({ label, value, onChange, minimumDate }: { label: string; value: string; onChange: (value: string) => void; minimumDate?: string }) {
  const selectedDate = value ? new Date(`${value}T00:00:00`) : null
  const today = new Date()
  const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  const minimumAllowedDate = minimumDate ?? todayValue
  const [month, setMonth] = useState(() => selectedDate ?? new Date())
  const [open, setOpen] = useState(false)
  const fieldRef = useRef<HTMLLabelElement>(null)
  useEffect(() => {
    if (!open) return
    const handleOutsideClick = (event: PointerEvent) => {
      if (!fieldRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", handleOutsideClick)
    return () => document.removeEventListener("pointerdown", handleOutsideClick)
  }, [open])
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const calendarDays = Array.from({ length: 42 }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1 - firstDay.getDay()))
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(month)

  return <label ref={fieldRef} className="relative text-sm font-medium"><RequiredText text={label} /><Input type="date" value={value} min={minimumAllowedDate} onChange={(event) => onChange(event.target.value)} required className="sr-only" /><button type="button" onClick={() => setOpen((current) => !current)} className="mt-2 flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 py-1 text-left text-base font-normal outline-none hover:bg-muted md:text-sm" aria-haspopup="dialog" aria-expanded={open}>{selectedDate ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(selectedDate) : "Choose a date"}</button>{open && <div className="absolute top-full z-30 mt-2 w-72 rounded-xl border bg-background p-3 shadow-xl" role="dialog" aria-label={`${label} calendar`}><div className="flex items-center justify-between"><button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-md px-2 py-1 text-sm hover:bg-muted" aria-label="Previous month">‹</button><p className="text-sm font-semibold">{monthLabel}</p><button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-md px-2 py-1 text-sm hover:bg-muted" aria-label="Next month">›</button></div><div className="mt-3 grid grid-cols-7 text-center text-[10px] font-medium text-muted-foreground">{["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div><div className="mt-1 grid grid-cols-7 gap-1">{calendarDays.map((day) => { const dayValue = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`; const isSelected = dayValue === value; const isCurrentMonth = day.getMonth() === month.getMonth(); const isBeforeMinimum = dayValue < minimumAllowedDate; return <button key={dayValue} type="button" disabled={isBeforeMinimum} onClick={() => { onChange(dayValue); setOpen(false) }} className={`flex size-8 items-center justify-center rounded-full text-xs ${isSelected ? "bg-primary text-primary-foreground" : isBeforeMinimum ? "cursor-not-allowed text-muted-foreground/25" : isCurrentMonth ? "hover:bg-muted" : "text-muted-foreground/40"}`} aria-pressed={isSelected}>{day.getDate()}</button> })}</div></div>}</label>
}

function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const fieldRef = useRef<HTMLLabelElement>(null)
  useEffect(() => {
    if (!open) return
    const handleOutsideClick = (event: PointerEvent) => {
      if (!fieldRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", handleOutsideClick)
    return () => document.removeEventListener("pointerdown", handleOutsideClick)
  }, [open])
  const times = Array.from({ length: 96 }, (_, index) => `${String(Math.floor(index / 4)).padStart(2, "0")}:${String((index % 4) * 15).padStart(2, "0")}`)
  const displayTime = value ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(`1970-01-01T${value}:00`)) : "Choose a time"

  return <label ref={fieldRef} className="relative text-sm font-medium"><RequiredText text={label} /><Input type="time" value={value} onChange={(event) => onChange(event.target.value)} required className="sr-only" /><button type="button" onClick={() => setOpen((current) => !current)} className="mt-2 flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 py-1 text-left text-base font-normal outline-none hover:bg-muted md:text-sm" aria-haspopup="listbox" aria-expanded={open}>{displayTime}<span className="text-muted-foreground">{value ? "" : "Select"}</span></button>{open && <div className="absolute top-full z-30 mt-2 grid max-h-56 w-full grid-cols-2 gap-1 overflow-y-auto rounded-xl border bg-background p-2 shadow-xl" role="listbox" aria-label={`${label} options`}>{times.map((time) => <button key={time} type="button" onClick={() => { onChange(time); setOpen(false) }} className={`rounded-md px-3 py-2 text-left text-sm hover:bg-muted ${time === value ? "bg-primary text-primary-foreground" : ""}`} role="option" aria-selected={time === value}>{new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(`1970-01-01T${time}:00`))}</button>)}</div>}</label>
}

function RequiredText({ text }: { text: string }) {
  return <span>{text}<span className="required-field-mark">*</span></span>
}

function CustomerDetailsStep({ eventType, eventDate, mobileNumber, location, details, onDateChange, onMobileNumberChange, onLocationChange, onDetailsChange }: { eventType: string; eventDate: string; mobileNumber: string; location: string; details: Record<string, string>; onDateChange: (value: string) => void; onMobileNumberChange: (value: string) => void; onLocationChange: (value: string) => void; onDetailsChange: (key: string, value: string) => void }) {
  const field = (key: string, placeholder: string) => <Input value={details[key] ?? ""} onChange={(event) => onDetailsChange(key, event.target.value)} placeholder={placeholder} required />
  const motifColors = details.motifColors ? details.motifColors.split(",") : ["#f4b4c4"]

  function updateMotifColor(index: number, value: string) {
    onDetailsChange("motifColors", motifColors.map((color, colorIndex) => colorIndex === index ? value : color).join(","))
  }

  function addMotifColor() {
    onDetailsChange("motifColors", [...motifColors, "#ffffff"].join(","))
  }

  function removeMotifColor(index: number) {
    onDetailsChange("motifColors", motifColors.filter((_, colorIndex) => colorIndex !== index).join(","))
  }

  const motifColorField = <div className="grid gap-2 text-sm font-medium sm:col-span-2">
    <span>Motif Color (Optional)</span>
    <div className="flex flex-wrap items-center gap-2">
      {motifColors.map((color, index) => <div key={`${index}-${color}`} className="flex items-center gap-2"><Input type="color" value={color || "#ffffff"} onChange={(event) => updateMotifColor(index, event.target.value)} aria-label={`Motif color ${index + 1}`} className="h-10 w-14 cursor-pointer p-1" />{motifColors.length > 1 && <button type="button" onClick={() => removeMotifColor(index)} className="text-xs text-muted-foreground underline-offset-4 hover:underline" aria-label={`Remove motif color ${index + 1}`}>Remove</button>}</div>)}
      <button type="button" onClick={addMotifColor} className="rounded-md border px-3 py-2 text-xs font-medium hover:bg-muted">Add color</button>
    </div>
    <p className="text-xs font-normal text-muted-foreground">Choose one or more colors for your skirting motif.</p>
  </div>

  const isFoodDessertEvent = eventType === "Food trays & Dessert"
  const foodSelected = details.foodTraysSelected === "true"
  const dessertSelected = details.dessertSelected === "true"
  const minimumEventDate = new Date()
  minimumEventDate.setDate(minimumEventDate.getDate() + 5)
  const minimumEventDateValue = `${minimumEventDate.getFullYear()}-${String(minimumEventDate.getMonth() + 1).padStart(2, "0")}-${String(minimumEventDate.getDate()).padStart(2, "0")}`

  return (
    <>
      <CardHeader>
          <CardTitle>Tell us about your {eventType.toLowerCase()}</CardTitle>
        <CardDescription>These details help us prepare the right setup and recommendations for your event.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        {!isFoodDessertEvent && <><DateField label="Event date" value={eventDate} minimumDate={eventType === "Birthday" || eventType === "Wedding" || eventType === "Baptism" ? minimumEventDateValue : undefined} onChange={onDateChange} /><label className="grid gap-2 text-sm font-medium"><RequiredText text="Mobile Number" /><Input type="tel" value={mobileNumber} onChange={(event) => onMobileNumberChange(event.target.value)} placeholder="09XX XXX XXXX" required /></label><TimeField label="Event Started" value={details.eventStarted ?? ""} onChange={(value) => onDetailsChange("eventStarted", value)} /><label className="grid gap-2 text-sm font-medium"><RequiredText text="Event location" /><Input placeholder="Venue or delivery address" value={location} onChange={(event) => onLocationChange(event.target.value)} required /></label></>}
        <div className="sm:col-span-2">
          <div className="mb-3 border-t pt-5"><p className="font-medium">{eventType} details</p><p className="mt-1 text-sm text-muted-foreground">Tell us what matters most for this event.</p></div>
          {eventType === "Birthday" && <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium"><RequiredText text="Celebrant name" />{field("celebrantName", "Name of the birthday celebrant")}</label>
            <label className="grid gap-2 text-sm font-medium"><RequiredText text="Age of celebrant" />{field("ageOfCelebrant", "For example, 18")}</label>
            <label className="grid gap-2 text-sm font-medium"><RequiredText text="Birthday theme" />{field("birthdayTheme", "For example, princess or minimal")}</label>
            {motifColorField}
          </div>}
          {eventType === "Wedding" && <div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Couple names{field("coupleNames", "Names to appear on the setup")}</label><label className="grid gap-2 text-sm font-medium">Ceremony or reception venue{field("weddingVenue", "Venue name")}</label><label className="grid gap-2 text-sm font-medium sm:col-span-2">Wedding theme{field("weddingTheme", "For example, garden or coastal")}</label></div>}
          {eventType === "Baptism" && <div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Child&apos;s name{field("childName", "Name of the child")}</label><label className="grid gap-2 text-sm font-medium">Church or venue{field("baptismVenue", "Church or reception venue")}</label><label className="grid gap-2 text-sm font-medium sm:col-span-2">Preferred theme{field("baptismTheme", "For example, white and blue")}</label></div>}
          {isFoodDessertEvent && <div className="grid gap-5 sm:grid-cols-2"><div className="grid gap-3 sm:col-span-2"><p className="font-medium">What would you like to add?</p><p className="text-sm text-muted-foreground">If you add Food trays only, select Food trays. If you add Desserts only, select Desserts. If you add both, select both.</p><label className="flex items-center gap-3 rounded-lg border p-3 text-sm font-medium"><input type="checkbox" checked={foodSelected} onChange={(event) => onDetailsChange("foodTraysSelected", String(event.target.checked))} />Food trays</label><label className="flex items-center gap-3 rounded-lg border p-3 text-sm font-medium"><input type="checkbox" checked={dessertSelected} onChange={(event) => onDetailsChange("dessertSelected", String(event.target.checked))} />Desserts</label></div>{foodSelected && !dessertSelected && <div className="grid gap-5 rounded-lg border p-4 sm:col-span-2 sm:grid-cols-2"><h3 className="font-medium sm:col-span-2">Food trays details</h3><label className="grid gap-2 text-sm font-medium">Pick up Date<Input type="date" value={details.foodPickupDate ?? ""} onChange={(event) => onDetailsChange("foodPickupDate", event.target.value)} required /></label><label className="grid gap-2 text-sm font-medium">Pick up time<Input type="time" value={details.foodPickupTime ?? ""} onChange={(event) => onDetailsChange("foodPickupTime", event.target.value)} required /></label><label className="grid gap-2 text-sm font-medium sm:col-span-2">Mobile Number<Input type="tel" value={mobileNumber} onChange={(event) => onMobileNumberChange(event.target.value)} placeholder="09XX XXX XXXX" required /></label></div>}{dessertSelected && <div className="grid gap-5 rounded-lg border p-4 sm:col-span-2 sm:grid-cols-2"><h3 className="font-medium sm:col-span-2">{foodSelected ? "Food Trays & Desserts" : "Desserts details"}</h3><label className="grid gap-2 text-sm font-medium">Delivery Date<Input type="date" value={details.dessertDeliveryDate ?? ""} onChange={(event) => onDetailsChange("dessertDeliveryDate", event.target.value)} required /></label><label className="grid gap-2 text-sm font-medium">Delivery time<Input type="time" value={details.dessertDeliveryTime ?? ""} onChange={(event) => onDetailsChange("dessertDeliveryTime", event.target.value)} required /></label><label className="grid gap-2 text-sm font-medium">Mobile Number<Input type="tel" value={mobileNumber} onChange={(event) => onMobileNumberChange(event.target.value)} placeholder="09XX XXX XXXX" required /></label><label className="grid gap-2 text-sm font-medium">Location<Input placeholder="Venue or delivery address" value={location} onChange={(event) => onLocationChange(event.target.value)} required /></label><label className="grid gap-2 text-sm font-medium sm:col-span-2">Cake theme{field("cakeTheme", "For example, minimalist or floral")}</label>{motifColorField}</div>}</div>}
          {eventType === "Other event" && <div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Event name{field("otherEventName", "Name of your event")}</label><label className="grid gap-2 text-sm font-medium">Setup needed{field("setupNeeded", "Food, cake, decorations, or other")}</label><label className="grid gap-2 text-sm font-medium sm:col-span-2">Tell us about your event<Textarea value={details.otherEventDescription ?? ""} onChange={(event) => onDetailsChange("otherEventDescription", event.target.value)} placeholder="Share the details we should know" required /></label></div>}
        </div>
      </CardContent>
    </>
  )
}

function MenuStep({ packages, loading, cart, onAddToCart, onToggleCart, onChange, onCustomize }: { packages: ReservationPackage[]; loading: boolean; cart: string[]; onAddToCart: (id: string) => void; onToggleCart: (id: string) => void; onChange: (value: string) => void; onCustomize: (id: string, title: string, details: string, quantity: number) => void }) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const query = search.trim().toLowerCase()
  const categoryNames = Array.from(new Set(packages.map((item) => item.category).filter(Boolean))).sort()
  const categories = ["All", "Food", "Occasions", ...categoryNames]
  const filteredPackages = packages.filter((item) => {
    const itemCategories = item.categories ?? [item.category]
    const matchesQuery = !query || `${item.title} ${itemCategories.join(" ")} ${item.description}`.toLowerCase().includes(query)
    const matchesCategory =
      selectedCategory === "All" ||
      (selectedCategory === "Food" && item.kind === "food") ||
      (selectedCategory === "Occasions" && item.kind === "occasion") ||
      itemCategories.includes(selectedCategory)
    return matchesQuery && matchesCategory
  })
  const visiblePackages = filteredPackages.slice(0, visibleCount)
  const hasMore = visibleCount < filteredPackages.length

  return <><CardHeader className="relative flex flex-col gap-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><CardTitle>Select your menu</CardTitle><CardDescription>Select one or more food menus or occasion decorations, then customize any item before continuing.</CardDescription></div><Badge variant="secondary" className="w-fit shrink-0 self-end sm:absolute sm:top-6 sm:right-6"><ShoppingCartIcon /> {cart.length} selected</Badge></div><div className="flex flex-col gap-3 xl:flex-row xl:items-center"><div className="relative w-full max-w-xs xl:w-[220px] xl:flex-none"><SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setVisibleCount(PAGE_SIZE) }} placeholder="Search menus or categories..." aria-label="Search reservation menus" className="h-9 pl-9" /></div><div className="flex min-w-0 flex-1 justify-end overflow-x-auto pb-1"><div className="flex min-w-max items-center gap-2">{categories.map((category) => <button key={category} type="button" onClick={() => { setSelectedCategory(category); setVisibleCount(PAGE_SIZE) }} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium leading-none transition-colors ${selectedCategory === category ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-muted"}`} aria-pressed={selectedCategory === category}>{category}</button>)}</div></div></div></CardHeader><CardContent><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visiblePackages.map((item) => <MenuChoice key={item.id} item={item} selected={cart.includes(item.id)} inCart={cart.includes(item.id)} onSelect={() => { onChange(item.title); onToggleCart(item.id) }} onAddToCart={() => onAddToCart(item.id)} onCustomize={(details, quantity) => onCustomize(item.id, item.title, details, quantity)} />)}{!loading && filteredPackages.length === 0 && <div className="rounded-xl border border-dashed p-8 text-center sm:col-span-2 lg:col-span-3"><p className="font-medium">No menus found</p><p className="mt-1 text-sm text-muted-foreground">Try another menu or category, or add items in the admin menu and occasions pages.</p></div>}{loading && <div className="rounded-xl border border-dashed p-8 text-center sm:col-span-2 lg:col-span-3"><p className="text-sm text-muted-foreground">Loading menus...</p></div>}</div>{filteredPackages.length > PAGE_SIZE && <div className="mt-6 flex justify-center"><Button variant="outline" onPress={() => setVisibleCount((current) => hasMore ? current + PAGE_SIZE : PAGE_SIZE)}>{hasMore ? `See more (${filteredPackages.length - visibleCount} left)` : "Show less"}</Button></div>}</CardContent></>
}

function MenuChoice({ item, selected, inCart, onSelect, onAddToCart, onCustomize }: { item: ReservationPackage; selected: boolean; inCart: boolean; onSelect: () => void; onAddToCart: () => void; onCustomize: (details: string, quantity: number) => void }) {
  const [imageIndex, setImageIndex] = useState(0)
  const [showInclusion, setShowInclusion] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const [showPanorama, setShowPanorama] = useState(false)
  const [customDetails, setCustomDetails] = useState("")
  const [quantity, setQuantity] = useState("1")
  const isDecoration = item.kind === "occasion"
  const previousImage = () => setImageIndex((current) => (current - 1 + item.images.length) % item.images.length)
  const nextImage = () => setImageIndex((current) => (current + 1) % item.images.length)
  const handleCardClick = (event: React.MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button")) return
    onSelect()
  }
  const saveCustomization = () => {
    const count = Math.max(1, Number(quantity) || 1)
    const details = `Quantity: ${count}; Total: ${formatCurrency(getPackagePrice(item.price) * count)}${customDetails ? `; ${customDetails}` : ""}`
    onCustomize(details, count)
    setShowCustomize(false)
  }

  return <article onClick={handleCardClick} className={`group cursor-pointer overflow-hidden rounded-xl border [transform-style:preserve-3d] transition-all duration-300 hover:[transform:perspective(1000px)_rotateX(2deg)_rotateY(-2deg)] ${selected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "bg-background hover:-translate-y-0.5 hover:bg-muted"}`}><div className="relative h-40 overflow-hidden bg-cover bg-center transition-transform duration-500 group-hover:[transform:translateZ(18px)_scale(1.03)]" style={{ backgroundImage: `url('${item.images[imageIndex]}')` }} role="img" aria-label={`${item.title}, image ${imageIndex + 1} of ${item.images.length}`}><div className="absolute inset-0 bg-black/15" /><button type="button" onClick={previousImage} className="absolute top-1/2 left-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75" aria-label={`Previous ${item.title} image`}><ArrowLeftIcon className="size-4" /></button><button type="button" onClick={nextImage} className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75" aria-label={`Next ${item.title} image`}><ArrowRightIcon className="size-4" /></button>{isDecoration && <button type="button" onClick={(event) => { event.stopPropagation(); setShowPanorama(true) }} className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1.5 text-primary-foreground shadow-sm transition hover:bg-primary/90" aria-label={`View 360 view for ${item.title}`}><EyeIcon className="size-3.5" /><span className="text-[10px] font-semibold uppercase tracking-[0.12em]">360 view</span></button>}{selected && <span className="absolute top-3 left-3 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground"><CheckCircle2Icon className="size-4" /></span>}<span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white">{imageIndex + 1}/{item.images.length}</span></div><button type="button" onClick={() => onSelect()} className="block w-full p-4 text-left" aria-pressed={selected}><span className="block font-medium">{item.title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.description}</span><span className="mt-3 block text-sm font-semibold text-primary">{item.price}</span></button><div className="flex gap-2 border-t p-3"><Button type="button" variant={inCart ? "default" : "outline"} className="min-w-0 flex-1" onPress={() => onAddToCart()}>{inCart ? "Added to cart" : "Add to cart"}<ShoppingCartIcon /></Button><Button type="button" variant="outline" className="min-w-0 flex-1" onPress={() => setShowInclusion((current) => !current)}>{showInclusion ? "Hide Inclusion" : "View Inclusion"}<ChevronDownIcon className={`transition-transform ${showInclusion ? "rotate-180" : ""}`} /></Button></div><div className="flex gap-2 border-t px-3 pb-3"><Button type="button" variant={selected ? "default" : "outline"} className="w-full" onPress={() => setShowCustomize(true)}>{selected ? "Customize" : "Customize this"}<ArrowRightIcon /></Button></div>{showInclusion && <div className="border-t bg-muted/30 px-4 py-3"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Included</p><ul className="mt-2 grid gap-1 text-sm">{item.includes.map((inclusion) => <li key={inclusion} className="flex gap-2"><CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-primary" />{inclusion}</li>)}</ul></div>}{showCustomize && <CustomizeModal itemTitle={item.title} itemPrice={item.price} quantity={quantity} onQuantityChange={setQuantity} details={customDetails} onDetailsChange={setCustomDetails} onClose={() => setShowCustomize(false)} onSave={saveCustomization} />}{showPanorama && <PanoramaModal item={item} imageIndex={imageIndex} onPrevious={previousImage} onNext={nextImage} onClose={() => setShowPanorama(false)} onSelectImage={setImageIndex} />}</article>
}

function PanoramaModal({ item, imageIndex, onPrevious, onNext, onClose, onSelectImage }: { item: ReservationPackage; imageIndex: number; onPrevious: () => void; onNext: () => void; onClose: () => void; onSelectImage: (index: number) => void }) {
  return createPortal(<div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-3" role="presentation" onClick={onClose}><section role="dialog" aria-modal="true" aria-labelledby="panorama-title" className="w-full max-w-5xl overflow-hidden rounded-3xl border bg-background shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between gap-4 border-b p-4"><div><p className="text-sm text-muted-foreground">Panorama capture</p><h2 id="panorama-title" className="mt-1 text-xl font-semibold">{item.title}</h2></div><Button variant="ghost" size="icon" aria-label="Close panorama view" onPress={onClose}><XIcon /></Button></div><div className="relative h-[55vh] min-h-[320px] w-full"><ReactPhotoSphereViewer src={item.images[imageIndex]} height="100%" width="100%" navbar={["zoom", "move", "fullscreen"]} /><div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/20" /><button type="button" onClick={(event) => { event.stopPropagation(); onPrevious() }} className="absolute top-1/2 left-4 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75" aria-label="Previous panorama image"><ArrowLeftIcon className="size-5" /></button><button type="button" onClick={(event) => { event.stopPropagation(); onNext() }} className="absolute top-1/2 right-4 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75" aria-label="Next panorama image"><ArrowRightIcon className="size-5" /></button><div className="absolute right-4 bottom-4 z-10 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white">360° panoramic view</div></div><div className="flex items-center justify-between gap-3 border-t p-4"><p className="text-sm text-muted-foreground">Wide, sweeping perspective of the event setup and atmosphere.</p><div className="flex items-center gap-2">{item.images.map((image, index) => <button key={`${item.title}-${index}`} type="button" onClick={() => onSelectImage(index)} className={`h-2.5 w-2.5 rounded-full ${imageIndex === index ? "bg-primary" : "bg-muted-foreground/40"}`} aria-label={`View panorama image ${index + 1}`} />)}</div></div></section></div>, document.body)
}

function CartModal({ packages, items, quantities, onQuantityChange, onRemove, onClose }: { packages: ReservationPackage[]; items: string[]; quantities: Record<string, number>; onQuantityChange: (id: string, quantity: number) => void; onRemove: (id: string) => void; onClose: () => void }) {
  const cartPackages = packages.filter((item) => items.includes(item.id))
  const subtotal = cartPackages.reduce((sum, item) => sum + getPackagePrice(item.price) * (quantities[item.id] ?? 1), 0)
  const total = subtotal
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onClick={onClose}><section role="dialog" aria-modal="true" aria-labelledby="cart-title" className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border bg-background p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-muted-foreground">Your selected menus</p><h2 id="cart-title" className="mt-1 text-xl font-semibold">Cart ({cartPackages.length})</h2></div><Button variant="ghost" size="icon" aria-label="Close cart" onPress={onClose}><XIcon /></Button></div>{cartPackages.length === 0 ? <div className="py-10 text-center"><ShoppingCartIcon className="mx-auto size-10 text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">Your cart is empty.</p></div> : <div className="mt-6 grid max-h-[min(55vh,28rem)] gap-3 overflow-y-auto pr-1">{cartPackages.map((item) => { const quantity = quantities[item.id] ?? 1; return <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3"><div className="size-14 shrink-0 rounded-md bg-cover bg-center" style={{ backgroundImage: `url('${item.images[0]}')` }} aria-label={item.title} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{item.price} · {item.kind === "occasion" ? "Occasion" : "Food"}</p><div className="mt-2 flex items-center gap-2"><Button type="button" variant="outline" size="icon-sm" onPress={() => onQuantityChange(item.id, quantity - 1)} aria-label={`Decrease ${item.title} quantity`}>-</Button><span className="w-6 text-center text-sm font-medium">{quantity}</span><Button type="button" variant="outline" size="icon-sm" onPress={() => onQuantityChange(item.id, quantity + 1)} aria-label={`Increase ${item.title} quantity`}>+</Button></div></div><Button type="button" variant="ghost" size="icon-sm" onPress={() => onRemove(item.id)} aria-label={`Remove ${item.title}`}><Trash2Icon /></Button></div>})}</div>}<div className="mt-6 grid gap-2 border-t pt-4 text-sm"><div className="flex items-center justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div><div className="flex items-center justify-between border-t pt-2 font-semibold"><span>Total</span><span className="text-primary">{formatCurrency(total)}</span></div></div><div className="mt-6 flex justify-end"><Button onPress={onClose}>Continue browsing</Button></div></section></div>
}

function CustomizeModal({ itemTitle, itemPrice, quantity, onQuantityChange, details, onDetailsChange, onClose, onSave }: { itemTitle: string; itemPrice: string; quantity: string; onQuantityChange: (value: string) => void; details: string; onDetailsChange: (value: string) => void; onClose: () => void; onSave: () => void }) {
  const count = Math.max(1, Number(quantity) || 1)
  const total = getPackagePrice(itemPrice) * count

  return createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="presentation" onClick={onClose}><section role="dialog" aria-modal="true" aria-labelledby="customize-title" className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border bg-background p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-muted-foreground">Customize your selection</p><h2 id="customize-title" className="mt-1 text-xl font-semibold">{itemTitle}</h2><p className="mt-1 text-sm text-muted-foreground">Unit price: {itemPrice}</p></div><Button variant="ghost" size="icon" aria-label="Close customization" onPress={onClose}><XIcon /></Button></div><div className="mt-5 rounded-xl border bg-muted/20 p-4"><div className="flex items-center justify-between gap-4"><span className="text-sm font-medium">How many?</span><div className="flex items-center gap-2"><Button type="button" variant="outline" size="icon-sm" onPress={() => onQuantityChange(String(Math.max(1, count - 1)))} aria-label="Decrease quantity">-</Button><span className="w-8 text-center font-semibold">{count}</span><Button type="button" variant="outline" size="icon-sm" onPress={() => onQuantityChange(String(count + 1))} aria-label="Increase quantity">+</Button></div></div><div className="mt-4 flex items-center justify-between border-t pt-3"><span className="text-sm text-muted-foreground">Total</span><span className="text-lg font-semibold text-primary">{formatCurrency(total)}</span></div></div><label className="mt-5 grid gap-2 text-sm font-medium">Additional customization<Textarea value={details} onChange={(event) => onDetailsChange(event.target.value)} placeholder="Colors, message, dietary needs, or design ideas" /></label><div className="mt-6 flex justify-end gap-2"><Button variant="outline" onPress={onClose}>Cancel</Button><Button onPress={onSave}>Add to cart <ShoppingCartIcon /></Button></div></section></div>, document.body)
}

function PaymentNotice() {
  const [qrModal, setQrModal] = useState<"gcash" | "maya" | null>(null)

  return <>
    <div className="mb-4 grid gap-3 rounded-lg border bg-background p-4 text-sm sm:grid-cols-2"><div><p className="font-medium">GCash account name: Edsel Granaderos</p><p className="mt-1 text-muted-foreground">GCash number: 09616203914</p></div><div><p className="font-medium">Maya account name: Edsel Granaderos</p><p className="mt-1 text-muted-foreground">Maya number: 09616203914</p></div></div>
    <section className="border-b bg-primary/5 p-5" aria-labelledby="payment-notice-title"><div><Badge variant="secondary">Important payment notice</Badge><h2 id="payment-notice-title" className="mt-2 text-lg font-semibold">Pay 50% to confirm your reservation</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">A 50% deposit of the total cart price is required before we can confirm your reservation. The remaining balance is due according to the final agreement with our team.</p></div><div className="mt-4 rounded-lg border bg-background p-4 text-sm"><div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><p className="font-medium">Payment information</p><p className="mt-1 text-muted-foreground">GCash account name: Edsel Granaderos</p><p className="text-muted-foreground">GCash number: 09616203914</p></div><div className="flex flex-col items-center gap-2 border-t pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6"><p className="font-semibold">GCash</p><div className="relative"><Image src="/gcash.png" alt="GCash QR code for payment" width={180} height={180} className="size-40 rounded-md object-contain" /><Button type="button" variant="secondary" size="icon-sm" className="absolute top-2 right-2 shadow-sm" aria-label="View GCash QR code full screen" onPress={() => setQrModal("gcash")}><Maximize2Icon /></Button></div></div><div className="flex flex-col items-center gap-2 border-t pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6"><p className="font-semibold">Maya</p><p className="text-xs text-muted-foreground">Maya account name: Edsel Granaderos</p><p className="text-xs text-muted-foreground">Maya number: 09616203914</p><div className="relative"><Image src="/maya.png" alt="Maya QR code for payment" width={180} height={180} className="size-40 rounded-md object-contain" /><Button type="button" variant="secondary" size="icon-sm" className="absolute top-2 right-2 shadow-sm" aria-label="View Maya QR code full screen" onPress={() => setQrModal("maya")}><Maximize2Icon /></Button></div></div></div><div className="mt-4 border-t pt-4"><p className="font-medium">Before submitting</p><p className="mt-1 text-muted-foreground">Send the deposit receipt and reference number using the selected payment method.</p></div></div></section>
    {qrModal && createPortal(<div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4" role="presentation" onClick={() => setQrModal(null)}><section role="dialog" aria-modal="true" aria-labelledby="payment-qr-modal-title" className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col items-center gap-4 rounded-2xl bg-background p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex w-full items-center justify-between gap-4"><h2 id="payment-qr-modal-title" className="font-semibold">{qrModal === "gcash" ? "GCash" : "Maya"} QR code</h2><Button type="button" variant="ghost" size="icon" aria-label="Close payment QR code" onPress={() => setQrModal(null)}><XIcon /></Button></div><Image src={qrModal === "gcash" ? "/gcash.png" : "/maya.png"} alt={`${qrModal === "gcash" ? "GCash" : "Maya"} QR code for payment`} width={700} height={700} className="max-h-[calc(100vh-10rem)] w-auto max-w-full object-contain" /></section></div>, document.body)}
  </>
}

function UnavailablePaymentMethods() {
  return <section className="border-t px-6 py-5" aria-labelledby="unavailable-payment-title"><div className="flex items-center justify-between gap-3"><div><p id="unavailable-payment-title" className="text-sm font-medium">Other payment methods</p><p className="mt-1 text-xs text-muted-foreground">These options are temporarily unavailable.</p></div><Badge variant="outline">Not available for now</Badge></div><div className="mt-3 grid gap-3 sm:grid-cols-2"><button type="button" disabled className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-dashed p-4 text-left opacity-55"><CreditCardIcon className="size-4" /><span><span className="block text-sm font-medium">Bank transfer</span><span className="block text-xs text-muted-foreground">Not available for now</span></span></button><button type="button" disabled className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-dashed p-4 text-left opacity-55"><CreditCardIcon className="size-4" /><span><span className="block text-sm font-medium">Credit or debit card</span><span className="block text-xs text-muted-foreground">Not available for now</span></span></button></div></section>
}

function ReceiptPreview({ file, active, method, accountName, phoneNumber, reference }: { file: File | null; active: boolean; method: string; accountName: string; phoneNumber: string; reference: string }) {
  const [previewUrl] = useState(() => file && active ? URL.createObjectURL(file) : "")

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  if (!previewUrl) return null

  return <section className="border-t px-6 py-5" aria-labelledby="receipt-preview-title"><div className="mx-auto max-w-md rounded-xl border bg-background shadow-sm"><div className="border-b border-dashed p-4 text-center"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Receipt preview</p><h2 id="receipt-preview-title" className="mt-1 text-lg font-semibold">{method} payment receipt</h2><Badge variant="secondary" className="mt-3">Image uploaded</Badge></div><div className="border-b p-4"><div className="flex justify-center overflow-hidden rounded-lg border bg-muted/20 p-2"><Image src={previewUrl} alt={`Uploaded ${method} payment receipt`} width={480} height={320} unoptimized className="max-h-48 w-auto max-w-xs rounded-lg object-contain" /></div></div><dl className="grid gap-3 p-4 text-sm"><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Account name</dt><dd className="max-w-[60%] truncate text-right font-medium">{accountName || "Not provided"}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Mobile number</dt><dd className="max-w-[60%] truncate text-right font-medium">{phoneNumber || "Not provided"}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Reference number</dt><dd className="max-w-[60%] truncate text-right font-medium">{reference || "Not provided"}</dd></div><div className="flex justify-between gap-4 border-t border-dashed pt-3"><dt className="font-medium">Status</dt><dd className="font-medium text-amber-600">Pending verification</dd></div></dl></div></section>
}

function PaymentStep({ method, reference, gcashAccountName, gcashNumber, gcashReceipt, onMethodChange, onReferenceChange, onGcashAccountNameChange, onGcashNumberChange, onGcashReceiptChange }: { method: string; reference: string; gcashAccountName: string; gcashNumber: string; gcashReceipt: File | null; onMethodChange: (value: string) => void; onReferenceChange: (value: string) => void; onGcashAccountNameChange: (value: string) => void; onGcashNumberChange: (value: string) => void; onGcashReceiptChange: (file: File | null) => void }) {
  const paymentMethods = ["Cash", "GCash", "Maya"]
  if (method === "Maya") return <><CardHeader><CardTitle>Choose your payment</CardTitle><CardDescription>Select a payment method for your reservation. Our team will confirm the final amount and availability.</CardDescription></CardHeader><CardContent className="grid gap-5"><div className="grid gap-3 sm:grid-cols-2">{paymentMethods.map((paymentOption) => <button key={paymentOption} type="button" onClick={() => onMethodChange(paymentOption)} className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${method === paymentOption ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "hover:bg-muted"}`} aria-pressed={method === paymentOption}><span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${method === paymentOption ? "bg-primary text-primary-foreground" : "bg-muted text-primary"}`}><CreditCardIcon className="size-4" /></span><span><span className="block text-sm font-medium">{paymentOption}</span><span className="mt-1 block text-xs text-muted-foreground">{paymentOption === "Cash" ? "Pay after the reservation is confirmed" : "Provide payment details after confirmation"}</span></span></button>)}</div><MayaPaymentForm reference={reference} accountName={gcashAccountName} accountNumber={gcashNumber} receipt={gcashReceipt} onReferenceChange={onReferenceChange} onAccountNameChange={onGcashAccountNameChange} onAccountNumberChange={onGcashNumberChange} onReceiptChange={onGcashReceiptChange} /></CardContent></>
  return <><CardHeader><CardTitle>Choose your payment</CardTitle><CardDescription>Select a payment method for your reservation. Our team will confirm the final amount and availability.</CardDescription></CardHeader><CardContent className="grid gap-5"><div className="grid gap-3 sm:grid-cols-2">{paymentMethods.map((paymentOption) => <button key={paymentOption} type="button" onClick={() => onMethodChange(paymentOption)} className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${method === paymentOption ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "hover:bg-muted"}`} aria-pressed={method === paymentOption}><span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${method === paymentOption ? "bg-primary text-primary-foreground" : "bg-muted text-primary"}`}><CreditCardIcon className="size-4" /></span><span><span className="block text-sm font-medium">{paymentOption}</span><span className="mt-1 block text-xs text-muted-foreground">{paymentOption === "Cash" ? "Pay after the reservation is confirmed" : "Provide payment details after confirmation"}</span></span></button>)}</div>{method === "GCash" && <div className="grid gap-5 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2"><div className="sm:col-span-2"><p className="font-medium">GCash payment information</p><p className="mt-1 text-sm text-muted-foreground">Enter the account used for payment and upload your receipt screenshot.</p></div><label className="grid gap-2 text-sm font-medium">GCash account name<Input value={gcashAccountName} onChange={(event) => onGcashAccountNameChange(event.target.value)} placeholder="Name on the GCash account" required /></label><label className="grid gap-2 text-sm font-medium">GCash mobile number<Input type="tel" value={gcashNumber} onChange={(event) => onGcashNumberChange(event.target.value)} placeholder="09XXXXXXXXX" required /></label><label className="grid gap-2 text-sm font-medium sm:col-span-2">Upload GCash receipt screenshot<Input type="file" accept="image/*" onChange={(event) => onGcashReceiptChange(event.target.files?.[0] ?? null)} required /></label>{gcashReceipt && <p className="text-xs text-muted-foreground sm:col-span-2">Selected receipt: {gcashReceipt.name}</p>}<label className="grid gap-2 text-sm font-medium sm:col-span-2">Payment reference number<Input value={reference} onChange={(event) => onReferenceChange(event.target.value)} placeholder="Enter your GCash reference number" required /></label></div>}{method !== "Cash" && method !== "GCash" && <label className="grid gap-2 text-sm font-medium">Payment reference or account detail<Input value={reference} onChange={(event) => onReferenceChange(event.target.value)} placeholder="Reference number or account name" required /></label>}</CardContent></>
}

function MayaPaymentForm({ reference, accountName, accountNumber, receipt, onReferenceChange, onAccountNameChange, onAccountNumberChange, onReceiptChange }: { reference: string; accountName: string; accountNumber: string; receipt: File | null; onReferenceChange: (value: string) => void; onAccountNameChange: (value: string) => void; onAccountNumberChange: (value: string) => void; onReceiptChange: (file: File | null) => void }) {
  return <div className="grid gap-5 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2"><div className="sm:col-span-2"><p className="font-medium">Maya payment information</p><p className="mt-1 text-sm text-muted-foreground">Enter the account used for payment and upload your receipt screenshot.</p></div><label className="grid gap-2 text-sm font-medium">Maya account name<Input value={accountName} onChange={(event) => onAccountNameChange(event.target.value)} placeholder="Name on the Maya account" required /></label><label className="grid gap-2 text-sm font-medium">Maya mobile number<Input type="tel" value={accountNumber} onChange={(event) => onAccountNumberChange(event.target.value)} placeholder="09XXXXXXXXX" required /></label><label className="grid gap-2 text-sm font-medium sm:col-span-2">Upload Maya receipt screenshot<Input type="file" accept="image/*" onChange={(event) => onReceiptChange(event.target.files?.[0] ?? null)} required /></label>{receipt && <p className="text-xs text-muted-foreground sm:col-span-2">Selected receipt: {receipt.name}</p>}<label className="grid gap-2 text-sm font-medium sm:col-span-2">Maya payment reference number<Input value={reference} onChange={(event) => onReferenceChange(event.target.value)} placeholder="Enter your Maya reference number" required /></label></div>
}

function getPackagePrice(price: string) {
  return Number(price.replace(/[^0-9.]/g, "")) || 0
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value)
}

function ReviewStep({ packages, cart, quantities, eventType, eventDate, guests, location, eventDetails }: { packages: ReservationPackage[]; cart: string[]; quantities: Record<string, number>; eventType: string; eventDate: string; guests: string; location: string; eventDetails: Record<string, string> }) {
  const detailEntries = Object.entries(eventDetails).filter(([, value]) => value)
  const cartItems = packages.filter((item) => cart.includes(item.id))
  const total = cartItems.reduce((sum, item) => sum + getPackagePrice(item.price) * (quantities[item.id] ?? 1), 0)

  return <><CardHeader><CardTitle>Review your request</CardTitle><CardDescription>Check the details below before sending your reservation request.</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><Summary label="Occasion" value={eventType} /><Summary label="Event date" value={eventDate || "To be scheduled"} /><Summary label="Mobile Number" value={guests || "Not provided"} /><Summary label="Location" value={location || "To be confirmed"} /><section className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:col-span-2" aria-labelledby="event-details-title"><div><p className="text-xs text-muted-foreground">Event details</p><h2 id="event-details-title" className="mt-1 text-lg font-semibold">What you entered</h2></div>{detailEntries.length === 0 ? <p className="text-sm text-muted-foreground">No event-specific details.</p> : <div className="grid gap-3 sm:grid-cols-2">{detailEntries.map(([key, value]) => <Summary key={key} label={formatDetailLabel(key)} value={key === "motifColors" ? <div className="flex flex-wrap gap-2" aria-label="Selected motif colors">{value.split(",").map((color, index) => <span key={`${color}-${index}`} className="size-7 rounded-full border border-border shadow-sm" style={{ backgroundColor: color }} aria-label={color} title={color} />)}</div> : key === "foodTraysSelected" || key === "dessertSelected" ? "Selected" : value} />)}</div>}</section><section className="rounded-xl border bg-muted/20 p-4 sm:col-span-2" aria-labelledby="invoice-title"><div className="flex items-start justify-between gap-4 border-b pb-3"><div><p className="text-sm text-muted-foreground">Invoice</p><h2 id="invoice-title" className="mt-1 text-lg font-semibold">Added to cart</h2></div><Badge variant="secondary">{cartItems.length} item{cartItems.length === 1 ? "" : "s"}</Badge></div>{cartItems.length === 0 ? <p className="py-6 text-sm text-muted-foreground">No items have been added to the cart yet.</p> : <div className="grid gap-3 py-4">{cartItems.map((item) => { const quantity = quantities[item.id] ?? 1; return <div key={item.id} className="flex items-center justify-between gap-4 text-sm"><span className="min-w-0 truncate">{item.title}{quantity > 1 ? ` × ${quantity}` : ""}</span><span className="shrink-0 font-medium">{formatCurrency(getPackagePrice(item.price) * quantity)}</span></div> })}</div>}<div className="flex items-center justify-between border-t pt-3 text-sm"><span className="text-muted-foreground">Total</span><span className="text-lg font-semibold text-primary">{formatCurrency(total)}</span></div></section></CardContent></>
}

function formatDetailLabel(key: string) {
  const labels: Record<string, string> = {
    eventStarted: "Event Started",
    motifColors: "Motif Color",
    ageOfCelebrant: "Age of celebrant",
    birthdayTheme: "Birthday theme",
    foodTraysSelected: "Food trays",
    dessertSelected: "Desserts",
    foodPickupDate: "Pick up Date",
    foodPickupTime: "Pick up time",
    dessertDeliveryDate: "Delivery Date",
    dessertDeliveryTime: "Delivery time",
    cakeTheme: "Cake theme",
  }
  return labels[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())
}

function Summary({ label, value }: { label: string; value: ReactNode }) {
  return <div className="rounded-lg border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>
}

function SuccessState({ eventType, eventDate }: { eventType: string; eventDate: string }) {
  return <main className="flex flex-1 items-center justify-center bg-muted/20 p-4 md:p-8"><Card className="w-full max-w-xl bg-background text-center"><CardContent className="flex flex-col items-center gap-4 p-8 md:p-12"><span className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><CheckCircle2Icon className="size-8" /></span><Badge variant="secondary">Request sent</Badge><h1 className="text-2xl font-semibold tracking-tight">We&apos;ll take it from here.</h1><p className="max-w-md text-sm leading-6 text-muted-foreground">Your {eventType.toLowerCase()} request{eventDate ? ` for ${eventDate}` : ""} has been sent to Edsel&apos;s team. We&apos;ll message you soon to confirm availability and final details.</p><Button onPress={() => window.location.reload()}>Make another request</Button></CardContent></Card></main>
}
