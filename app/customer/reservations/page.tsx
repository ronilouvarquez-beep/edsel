"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import dynamic from "next/dynamic"
import Image from "next/image"
import { createRoot } from "react-dom/client"
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
  MapPinIcon,
  PartyPopperIcon,
  SearchIcon,
  ShoppingCartIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const ReactPhotoSphereViewer = dynamic(
  () => import("react-photo-sphere-viewer").then((module) => module.ReactPhotoSphereViewer),
  { ssr: false },
)

const steps = [
  { title: "Select Menu", description: "Choose what you need", icon: ChefHatIcon },
  { title: "Event", description: "Choose the occasion", icon: PartyPopperIcon },
  { title: "Details", description: "Set date and guests", icon: CalendarDaysIcon },
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

const packages = [
  { title: "Wedding catering", category: "Catering Buffet", categories: ["Catering Buffet"], description: "Elegant food and dessert service for your special day", price: "From ₱8,500", includes: ["Main dishes for your guest count", "Dessert selection", "Basic buffet setup"], images: ["https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1519225421980-715cb0215AED?auto=format&fit=crop&w=900&q=85"] },
  { title: "Birthday cake", category: "Catering Buffet", categories: ["Catering Buffet"], description: "A custom celebration cake with matching sweets", price: "From ₱850", includes: ["Custom cake flavor", "Personalized cake message", "Matching dessert treats"], images: ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=85"] },
  { title: "Baptism package", category: "Catering Buffet", categories: ["Catering Buffet"], description: "A thoughtful cake and food spread for family", price: "From ₱3,500", includes: ["Celebration cake", "Family food tray", "Simple table accents"], images: ["https://images.unsplash.com/photo-1519225421980-715cb0215AED?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=85"] },
  { title: "Food trays", category: "Food", categories: ["Food"], description: "Savory dishes prepared for sharing", price: "From ₱1,250", includes: ["Choice of savory dishes", "Serving trays", "Portions based on guest count"], images: ["https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85"] },
  { title: "Dessert table", category: "Desserts", categories: ["Desserts"], description: "Cakes, pastries, stands, and sweet table styling", price: "From ₱2,500", includes: ["Assorted cakes and pastries", "Display stands", "Styled dessert table"], images: ["https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=85"] },
  { title: "Birthday decorations", category: "Decorations", categories: ["Decorations"], description: "A cheerful backdrop and cake table setup", price: "From ₱1,800", includes: ["Cake table styling", "Birthday backdrop", "Color theme accents"], images: ["https://images.unsplash.com/photo-1530103862676-de8c9deaffa1?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=85"] },
  { title: "Wedding venue styling", category: "Decorations", categories: ["Decorations"], description: "A panoramic view of an elegant wedding venue setup", price: "From ₱12,000", includes: ["Ceremony backdrop", "Floral aisle styling", "Reception table setup"], images: ["/panorama.png", "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1200&q=85"] },
  { title: "Beach venue styling", category: "Decorations", categories: ["Decorations"], description: "A panoramic sunset beach venue for an unforgettable celebration", price: "From ₱15,000", includes: ["Beach ceremony setup", "Sunset reception styling", "Coastal table accents"], images: ["/beach.png"] },
]

export default function CustomerReservationsPage() {
  const [step, setStep] = useState(0)
  const [eventType, setEventType] = useState("Birthday")
  const [eventDate, setEventDate] = useState("")
  const [guests, setGuests] = useState("10")
  const [location, setLocation] = useState("")
  const [eventDetails, setEventDetails] = useState<Record<string, string>>({})
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [paymentReference, setPaymentReference] = useState("")
  const [gcashAccountName, setGcashAccountName] = useState("")
  const [gcashNumber, setGcashNumber] = useState("")
  const [gcashReceipt, setGcashReceipt] = useState<File | null>(null)
  const [packageChoice, setPackageChoice] = useState("Birthday cake")
  const [cart, setCart] = useState<string[]>([])
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({})
  const [showCart, setShowCart] = useState(false)
  const [notes, setNotes] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function nextStep() {
    if (step === steps.length - 1) {
      setSubmitted(true)
      return
    }
    setStep((current) => current + 1)
  }

  function addToCart(title: string) {
    setCart((current) => current.includes(title) ? current : [...current, title])
    setCartQuantities((current) => ({ ...current, [title]: current[title] ?? 1 }))
  }

  function toggleCart(title: string) {
    setCart((current) => current.includes(title) ? current.filter((item) => item !== title) : [...current, title])
    setCartQuantities((current) => { const next = { ...current }; if (next[title]) delete next[title]; else next[title] = 1; return next })
  }

  function removeFromCart(title: string) {
    setCart((current) => current.filter((item) => item !== title))
    setCartQuantities((current) => { const next = { ...current }; delete next[title]; return next })
  }

  function changeCartQuantity(title: string, quantity: number) {
    setCartQuantities((current) => ({ ...current, [title]: Math.max(1, quantity) }))
  }

  if (submitted) {
    return <SuccessState eventType={eventType} eventDate={eventDate} />
  }

  return (
    <main className="flex flex-1 flex-col bg-muted/20">
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
          {step === 0 && <MenuStep cart={cart} onAddToCart={addToCart} onToggleCart={toggleCart} onChange={setPackageChoice} onCustomize={(title, details) => { setPackageChoice(title); setNotes(details); addToCart(title) }} />}
          {step === 1 && <EventStep value={eventType} onChange={setEventType} />}
          {step === 2 && <DetailsStep eventType={eventType} eventDate={eventDate} guests={guests} location={location} details={eventDetails} onDateChange={setEventDate} onGuestsChange={setGuests} onLocationChange={setLocation} onDetailsChange={(key, value) => setEventDetails((current) => ({ ...current, [key]: value }))} />}
          {step === 3 && <ReviewStep cart={cart} eventType={eventType} eventDate={eventDate} guests={guests} location={location} packageChoice={packageChoice} notes={notes} eventDetails={eventDetails} />}
          {step === 4 && <><PaymentNotice /><PaymentStep method={paymentMethod} reference={paymentReference} gcashAccountName={gcashAccountName} gcashNumber={gcashNumber} gcashReceipt={gcashReceipt} onMethodChange={setPaymentMethod} onReferenceChange={setPaymentReference} onGcashAccountNameChange={setGcashAccountName} onGcashNumberChange={setGcashNumber} onGcashReceiptChange={setGcashReceipt} /><ReceiptPreview key={`${paymentMethod}-${gcashReceipt?.name ?? "none"}-${gcashReceipt?.lastModified ?? 0}`} file={gcashReceipt} active={paymentMethod === "GCash"} accountName={gcashAccountName} phoneNumber={gcashNumber} reference={paymentReference} /><UnavailablePaymentMethods /></>}
          <CardContent className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between"><Button variant="ghost" onPress={() => setStep((current) => Math.max(0, current - 1))} isDisabled={step === 0}><ArrowLeftIcon /> Back</Button><div className="flex items-center gap-3"><span className="text-xs text-muted-foreground">Step {step + 1} of {steps.length}</span><Button onPress={nextStep}>{step === steps.length - 1 ? "Confirm reservation" : "Continue"}{step === steps.length - 1 ? <CheckCircle2Icon /> : <ArrowRightIcon />}</Button></div></CardContent>
        </Card>
        {step === 0 && <div className="sticky bottom-4 z-20 flex justify-end pointer-events-none"><Button size="icon-lg" className="pointer-events-auto relative rounded-full shadow-xl" onPress={() => setShowCart(true)} aria-label={`View cart with ${cart.length} item${cart.length === 1 ? "" : "s"}`}><ShoppingCartIcon />{cart.length > 0 && <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">{cart.length}</span>}</Button></div>}
        {showCart && <CartModal items={cart} quantities={cartQuantities} onQuantityChange={changeCartQuantity} onRemove={removeFromCart} onClose={() => setShowCart(false)} />}
      </div>
    </main>
  )
}

function EventStep({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <><CardHeader><CardTitle>What would you like to add?</CardTitle><CardDescription>Choose the items or services you would like to include in your reservation.</CardDescription></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{eventTypes.map(({ title, description, icon: Icon }) => <button key={title} type="button" onClick={() => onChange(title)} className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${value === title ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "hover:bg-muted"}`} aria-pressed={value === title}><span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${value === title ? "bg-primary text-primary-foreground" : "bg-muted text-primary"}`}><Icon className="size-5" /></span><span><span className="block font-medium">{title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span></span></button>)}</CardContent></>
}

function DetailsStep({ eventType, eventDate, guests, location, details, onDateChange, onGuestsChange, onLocationChange, onDetailsChange }: { eventType: string; eventDate: string; guests: string; location: string; details: Record<string, string>; onDateChange: (value: string) => void; onGuestsChange: (value: string) => void; onLocationChange: (value: string) => void; onDetailsChange: (key: string, value: string) => void }) {
  const field = (key: string, value: string) => <Input value={details[key] ?? ""} onChange={(event) => onDetailsChange(key, event.target.value)} placeholder={value} required />

  return <><CardHeader><CardTitle>Tell us about your {eventType.toLowerCase()}</CardTitle><CardDescription>These details help us prepare the right setup and recommendations for your event.</CardDescription></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Event date<Input type="date" value={eventDate} onChange={(event) => onDateChange(event.target.value)} required /></label><label className="grid gap-2 text-sm font-medium">Number of guests<Input type="number" min="1" value={guests} onChange={(event) => onGuestsChange(event.target.value)} required /></label><label className="grid gap-2 text-sm font-medium sm:col-span-2">Event location<div className="relative"><MapPinIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Venue or delivery address" value={location} onChange={(event) => onLocationChange(event.target.value)} required /></div></label><div className="sm:col-span-2"><div className="mb-3 border-t pt-5"><p className="font-medium">{eventType} details</p><p className="mt-1 text-sm text-muted-foreground">Tell us what matters most for this event.</p></div>{eventType === "Birthday" && <div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Celebrant name{field("celebrantName", "Name of the birthday celebrant")}</label><label className="grid gap-2 text-sm font-medium">Age or milestone{field("milestone", "For example, 18th birthday")}</label><label className="grid gap-2 text-sm font-medium sm:col-span-2">Theme or color palette{field("birthdayTheme", "For example, pink and gold")}</label></div>}{eventType === "Wedding" && <div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Couple names{field("coupleNames", "Names to appear on the setup")}</label><label className="grid gap-2 text-sm font-medium">Ceremony or reception venue{field("weddingVenue", "Venue name")}</label><label className="grid gap-2 text-sm font-medium sm:col-span-2">Wedding theme{field("weddingTheme", "For example, garden or coastal")}</label></div>}{eventType === "Baptism" && <div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Child&apos;s name{field("childName", "Name of the child")}</label><label className="grid gap-2 text-sm font-medium">Church or venue{field("baptismVenue", "Church or reception venue")}</label><label className="grid gap-2 text-sm font-medium sm:col-span-2">Preferred theme{field("baptismTheme", "For example, white and blue")}</label></div>}{eventType === "Food trays" && <div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Food preference{field("foodPreference", "Dish or menu preference")}</label><label className="grid gap-2 text-sm font-medium">Needed by{field("neededBy", "Preferred delivery or pickup time")}</label><label className="grid gap-2 text-sm font-medium sm:col-span-2">Dietary requirements{field("dietaryRequirements", "Allergies or dietary requests")}</label></div>}{eventType === "Other event" && <div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Event name{field("otherEventName", "Name of your event")}</label><label className="grid gap-2 text-sm font-medium">Setup needed{field("setupNeeded", "Food, cake, decorations, or other")}</label><label className="grid gap-2 text-sm font-medium sm:col-span-2">Tell us about your event<Textarea value={details.otherEventDescription ?? ""} onChange={(event) => onDetailsChange("otherEventDescription", event.target.value)} placeholder="Share the details we should know" required /></label></div>}</div></CardContent></>
}

function MenuStep({ cart, onAddToCart, onToggleCart, onChange, onCustomize }: { cart: string[]; onAddToCart: (title: string) => void; onToggleCart: (title: string) => void; onChange: (value: string) => void; onCustomize: (title: string, details: string) => void }) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const query = search.trim().toLowerCase()
  const categories = ["All", "Decorations", "Catering Buffet", "Food", "Desserts"]
  const visiblePackages = packages.filter((item) => {
    const itemCategories = item.categories ?? [item.category]
    const matchesQuery = !query || `${item.title} ${itemCategories.join(" ")} ${item.description}`.toLowerCase().includes(query)
    const matchesCategory = selectedCategory === "All" || itemCategories.includes(selectedCategory)
    return matchesQuery && matchesCategory
  })

  return <><CardHeader className="relative flex flex-col gap-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><CardTitle>Select your menu</CardTitle><CardDescription>Select one or more menus, then customize any item before continuing.</CardDescription></div><Badge variant="secondary" className="w-fit shrink-0 self-end sm:absolute sm:top-6 sm:right-6"><ShoppingCartIcon /> {cart.length} selected</Badge></div><div className="flex flex-col gap-3 xl:flex-row xl:items-center"><div className="relative w-full max-w-xs xl:w-[220px] xl:flex-none"><SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search menus or categories..." aria-label="Search reservation menus" className="h-9 pl-9" /></div><div className="flex min-w-0 flex-1 justify-end overflow-x-auto pb-1"><div className="flex min-w-max items-center gap-2">{categories.map((category) => <button key={category} type="button" onClick={() => setSelectedCategory(category)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium leading-none transition-colors ${selectedCategory === category ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-muted"}`} aria-pressed={selectedCategory === category}>{category}</button>)}</div></div></div></CardHeader><CardContent><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visiblePackages.map((item) => <MenuChoice key={item.title} item={item} selected={cart.includes(item.title)} inCart={cart.includes(item.title)} onSelect={(title) => { onChange(title); onToggleCart(title) }} onAddToCart={onAddToCart} onCustomize={onCustomize} />)}{visiblePackages.length === 0 && <div className="rounded-xl border border-dashed p-8 text-center sm:col-span-2 lg:col-span-3"><p className="font-medium">No menus found</p><p className="mt-1 text-sm text-muted-foreground">Try another menu or category.</p></div>}</div></CardContent></>
}

function MenuChoice({ item, selected, inCart, onSelect, onAddToCart, onCustomize }: { item: (typeof packages)[number]; selected: boolean; inCart: boolean; onSelect: (title: string) => void; onAddToCart: (title: string) => void; onCustomize: (title: string, details: string) => void }) {
  const [imageIndex, setImageIndex] = useState(0)
  const [showInclusion, setShowInclusion] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const [showPanorama, setShowPanorama] = useState(false)
  const [customDetails, setCustomDetails] = useState("")
  const [quantity, setQuantity] = useState("1")
  const isDecoration = item.category === "Decorations" || item.categories?.includes("Decorations")
  const previousImage = () => setImageIndex((current) => (current - 1 + item.images.length) % item.images.length)
  const nextImage = () => setImageIndex((current) => (current + 1) % item.images.length)
  const handleCardClick = (event: React.MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button")) return
    onSelect(item.title)
  }
  const saveCustomization = () => {
    const count = Math.max(1, Number(quantity) || 1)
    const details = `Quantity: ${count}; Total: ${formatCurrency(getPackagePrice(item.price) * count)}${customDetails ? `; ${customDetails}` : ""}`
    onCustomize(item.title, details)
    setShowCustomize(false)
  }

  return <article onClick={handleCardClick} className={`group cursor-pointer overflow-hidden rounded-xl border [transform-style:preserve-3d] transition-all duration-300 hover:[transform:perspective(1000px)_rotateX(2deg)_rotateY(-2deg)] ${selected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "bg-background hover:-translate-y-0.5 hover:bg-muted"}`}><div className="relative h-40 overflow-hidden bg-cover bg-center transition-transform duration-500 group-hover:[transform:translateZ(18px)_scale(1.03)]" style={{ backgroundImage: `url('${item.images[imageIndex]}')` }} role="img" aria-label={`${item.title}, image ${imageIndex + 1} of ${item.images.length}`}><div className="absolute inset-0 bg-black/15" /><button type="button" onClick={previousImage} className="absolute top-1/2 left-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75" aria-label={`Previous ${item.title} image`}><ArrowLeftIcon className="size-4" /></button><button type="button" onClick={nextImage} className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75" aria-label={`Next ${item.title} image`}><ArrowRightIcon className="size-4" /></button>{isDecoration && <button type="button" onClick={(event) => { event.stopPropagation(); setShowPanorama(true) }} className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1.5 text-primary-foreground shadow-sm transition hover:bg-primary/90" aria-label={`View 360 view for ${item.title}`}><EyeIcon className="size-3.5" /><span className="text-[10px] font-semibold uppercase tracking-[0.12em]">360 view</span></button>}{selected && <span className="absolute top-3 left-3 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground"><CheckCircle2Icon className="size-4" /></span>}<span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white">{imageIndex + 1}/{item.images.length}</span></div><button type="button" onClick={() => onSelect(item.title)} className="block w-full p-4 text-left" aria-pressed={selected}><span className="block font-medium">{item.title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.description}</span><span className="mt-3 block text-sm font-semibold text-primary">{item.price}</span></button><div className="flex gap-2 border-t p-3"><Button type="button" variant={inCart ? "default" : "outline"} className="min-w-0 flex-1" onPress={() => onAddToCart(item.title)}>{inCart ? "Added to cart" : "Add to cart"}<ShoppingCartIcon /></Button><Button type="button" variant="outline" className="min-w-0 flex-1" onPress={() => setShowInclusion((current) => !current)}>{showInclusion ? "Hide Inclusion" : "View Inclusion"}<ChevronDownIcon className={`transition-transform ${showInclusion ? "rotate-180" : ""}`} /></Button></div><div className="flex gap-2 border-t px-3 pb-3"><Button type="button" variant={selected ? "default" : "outline"} className="w-full" onPress={() => setShowCustomize(true)}>{selected ? "Customize" : "Customize this"}<ArrowRightIcon /></Button></div>{showInclusion && <div className="border-t bg-muted/30 px-4 py-3"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Included</p><ul className="mt-2 grid gap-1 text-sm">{item.includes.map((inclusion) => <li key={inclusion} className="flex gap-2"><CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-primary" />{inclusion}</li>)}</ul></div>}{showCustomize && <CustomizeModal itemTitle={item.title} itemPrice={item.price} quantity={quantity} onQuantityChange={setQuantity} details={customDetails} onDetailsChange={setCustomDetails} onClose={() => setShowCustomize(false)} onSave={saveCustomization} />}{showPanorama && <PanoramaModal item={item} imageIndex={imageIndex} onPrevious={previousImage} onNext={nextImage} onClose={() => setShowPanorama(false)} onSelectImage={setImageIndex} />}</article>
}

function PanoramaModal({ item, imageIndex, onPrevious, onNext, onClose, onSelectImage }: { item: (typeof packages)[number]; imageIndex: number; onPrevious: () => void; onNext: () => void; onClose: () => void; onSelectImage: (index: number) => void }) {
  useEffect(() => {
    const preview = Array.from(document.querySelectorAll<HTMLElement>("[aria-label]"))
      .find((element) => element.getAttribute("aria-label") === `${item.title} panorama preview`)

    if (!preview) return

    const overlay = preview.nextElementSibling as HTMLElement | null
    const previousOverlayPointerEvents = overlay?.style.pointerEvents ?? ""
    const viewerRoot = createRoot(preview)
    if (overlay) overlay.style.pointerEvents = "none"
    viewerRoot.render(<ReactPhotoSphereViewer src={item.images[imageIndex]} height="100%" width="100%" navbar={["zoom", "move", "fullscreen"]} />)

    return () => {
      viewerRoot.unmount()
      if (overlay) overlay.style.pointerEvents = previousOverlayPointerEvents
    }
  }, [item.images, item.title, imageIndex])

  return createPortal(<div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-3" role="presentation" onClick={onClose}><section role="dialog" aria-modal="true" aria-labelledby="panorama-title" className="w-full max-w-5xl overflow-hidden rounded-3xl border bg-background shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between gap-4 border-b p-4"><div><p className="text-sm text-muted-foreground">Panorama capture</p><h2 id="panorama-title" className="mt-1 text-xl font-semibold">{item.title}</h2></div><Button variant="ghost" size="icon" aria-label="Close panorama view" onPress={onClose}><XIcon /></Button></div><div className="relative"><div className="relative h-[55vh] min-h-[320px] w-full bg-cover bg-center" style={{ backgroundImage: `url('${item.images[imageIndex]}')` }} aria-label={`${item.title} panorama preview`} /><div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/20" /><button type="button" onClick={(event) => { event.stopPropagation(); onPrevious() }} className="absolute top-1/2 left-4 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75" aria-label="Previous panorama image"><ArrowLeftIcon className="size-5" /></button><button type="button" onClick={(event) => { event.stopPropagation(); onNext() }} className="absolute top-1/2 right-4 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75" aria-label="Next panorama image"><ArrowRightIcon className="size-5" /></button><div className="absolute right-4 bottom-4 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white">360° panoramic view</div></div><div className="flex items-center justify-between gap-3 border-t p-4"><p className="text-sm text-muted-foreground">Wide, sweeping perspective of the event setup and atmosphere.</p><div className="flex items-center gap-2">{item.images.map((image, index) => <button key={`${item.title}-${index}`} type="button" onClick={() => onSelectImage(index)} className={`h-2.5 w-2.5 rounded-full ${imageIndex === index ? "bg-primary" : "bg-muted-foreground/40"}`} aria-label={`View panorama image ${index + 1}`} />)}</div></div></section></div>, document.body)
}

function CartModal({ items, quantities, onQuantityChange, onRemove, onClose }: { items: string[]; quantities: Record<string, number>; onQuantityChange: (title: string, quantity: number) => void; onRemove: (title: string) => void; onClose: () => void }) {
  const cartPackages = packages.filter((item) => items.includes(item.title))
  const subtotal = cartPackages.reduce((sum, item) => sum + getPackagePrice(item.price) * (quantities[item.title] ?? 1), 0)
  const total = subtotal
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onClick={onClose}><section role="dialog" aria-modal="true" aria-labelledby="cart-title" className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border bg-background p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-muted-foreground">Your selected menus</p><h2 id="cart-title" className="mt-1 text-xl font-semibold">Cart ({cartPackages.length})</h2></div><Button variant="ghost" size="icon" aria-label="Close cart" onPress={onClose}><XIcon /></Button></div>{cartPackages.length === 0 ? <div className="py-10 text-center"><ShoppingCartIcon className="mx-auto size-10 text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">Your cart is empty.</p></div> : <div className="mt-6 grid max-h-[min(55vh,28rem)] gap-3 overflow-y-auto pr-1">{cartPackages.map((item) => { const quantity = quantities[item.title] ?? 1; return <div key={item.title} className="flex items-center gap-3 rounded-lg border p-3"><div className="size-14 shrink-0 rounded-md bg-cover bg-center" style={{ backgroundImage: `url('${item.images[0]}')` }} aria-label={item.title} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{item.price}</p><div className="mt-2 flex items-center gap-2"><Button type="button" variant="outline" size="icon-sm" onPress={() => onQuantityChange(item.title, quantity - 1)} aria-label={`Decrease ${item.title} quantity`}>-</Button><span className="w-6 text-center text-sm font-medium">{quantity}</span><Button type="button" variant="outline" size="icon-sm" onPress={() => onQuantityChange(item.title, quantity + 1)} aria-label={`Increase ${item.title} quantity`}>+</Button></div></div><Button type="button" variant="ghost" size="icon-sm" onPress={() => onRemove(item.title)} aria-label={`Remove ${item.title}`}><Trash2Icon /></Button></div>})}</div>}<div className="mt-6 grid gap-2 border-t pt-4 text-sm"><div className="flex items-center justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div><div className="flex items-center justify-between border-t pt-2 font-semibold"><span>Total</span><span className="text-primary">{formatCurrency(total)}</span></div></div><div className="mt-6 flex justify-end"><Button onPress={onClose}>Continue browsing</Button></div></section></div>
}

function CustomizeModal({ itemTitle, itemPrice, quantity, onQuantityChange, details, onDetailsChange, onClose, onSave }: { itemTitle: string; itemPrice: string; quantity: string; onQuantityChange: (value: string) => void; details: string; onDetailsChange: (value: string) => void; onClose: () => void; onSave: () => void }) {
  const count = Math.max(1, Number(quantity) || 1)
  const total = getPackagePrice(itemPrice) * count

  return createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="presentation" onClick={onClose}><section role="dialog" aria-modal="true" aria-labelledby="customize-title" className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border bg-background p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-muted-foreground">Customize your selection</p><h2 id="customize-title" className="mt-1 text-xl font-semibold">{itemTitle}</h2><p className="mt-1 text-sm text-muted-foreground">Unit price: {itemPrice}</p></div><Button variant="ghost" size="icon" aria-label="Close customization" onPress={onClose}><XIcon /></Button></div><div className="mt-5 rounded-xl border bg-muted/20 p-4"><div className="flex items-center justify-between gap-4"><span className="text-sm font-medium">How many?</span><div className="flex items-center gap-2"><Button type="button" variant="outline" size="icon-sm" onPress={() => onQuantityChange(String(Math.max(1, count - 1)))} aria-label="Decrease quantity">-</Button><span className="w-8 text-center font-semibold">{count}</span><Button type="button" variant="outline" size="icon-sm" onPress={() => onQuantityChange(String(count + 1))} aria-label="Increase quantity">+</Button></div></div><div className="mt-4 flex items-center justify-between border-t pt-3"><span className="text-sm text-muted-foreground">Total</span><span className="text-lg font-semibold text-primary">{formatCurrency(total)}</span></div></div><label className="mt-5 grid gap-2 text-sm font-medium">Additional customization<Textarea value={details} onChange={(event) => onDetailsChange(event.target.value)} placeholder="Colors, message, dietary needs, or design ideas" /></label><div className="mt-6 flex justify-end gap-2"><Button variant="outline" onPress={onClose}>Cancel</Button><Button onPress={onSave}>Add to cart <ShoppingCartIcon /></Button></div></section></div>, document.body)
}

function PaymentNotice() {
  return <section className="border-b bg-primary/5 p-5" aria-labelledby="payment-notice-title"><div><Badge variant="secondary">Important payment notice</Badge><h2 id="payment-notice-title" className="mt-2 text-lg font-semibold">Pay 50% to confirm your reservation</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">A 50% deposit of the total cart price is required before we can confirm your reservation. The remaining balance is due according to the final agreement with our team.</p></div><div className="mt-4 grid gap-3 rounded-lg border bg-background p-4 text-sm sm:grid-cols-2"><div><p className="font-medium">Payment information</p><p className="mt-1 text-muted-foreground">GCash account name: Edsel Events</p><p className="text-muted-foreground">GCash number: Add your business number</p></div><div><p className="font-medium">Before submitting</p><p className="mt-1 text-muted-foreground">Send the deposit receipt and reference number using the selected payment method.</p></div></div></section>
}

function UnavailablePaymentMethods() {
  return <section className="border-t px-6 py-5" aria-labelledby="unavailable-payment-title"><div className="flex items-center justify-between gap-3"><div><p id="unavailable-payment-title" className="text-sm font-medium">Other payment methods</p><p className="mt-1 text-xs text-muted-foreground">These options are temporarily unavailable.</p></div><Badge variant="outline">Not available for now</Badge></div><div className="mt-3 grid gap-3 sm:grid-cols-2"><button type="button" disabled className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-dashed p-4 text-left opacity-55"><CreditCardIcon className="size-4" /><span><span className="block text-sm font-medium">Bank transfer</span><span className="block text-xs text-muted-foreground">Not available for now</span></span></button><button type="button" disabled className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-dashed p-4 text-left opacity-55"><CreditCardIcon className="size-4" /><span><span className="block text-sm font-medium">Credit or debit card</span><span className="block text-xs text-muted-foreground">Not available for now</span></span></button></div></section>
}

function ReceiptPreview({ file, active, accountName, phoneNumber, reference }: { file: File | null; active: boolean; accountName: string; phoneNumber: string; reference: string }) {
  const [previewUrl] = useState(() => file && active ? URL.createObjectURL(file) : "")

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  if (!previewUrl) return null

  return <section className="border-t px-6 py-5" aria-labelledby="receipt-preview-title"><div className="mx-auto max-w-md rounded-xl border bg-background shadow-sm"><div className="border-b border-dashed p-4 text-center"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Receipt preview</p><h2 id="receipt-preview-title" className="mt-1 text-lg font-semibold">GCash payment receipt</h2><Badge variant="secondary" className="mt-3">Image uploaded</Badge></div><div className="border-b p-4"><div className="flex justify-center overflow-hidden rounded-lg border bg-muted/20 p-2"><Image src={previewUrl} alt="Uploaded GCash payment receipt" width={480} height={320} unoptimized className="max-h-48 w-auto max-w-xs rounded-lg object-contain" /></div></div><dl className="grid gap-3 p-4 text-sm"><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Account name</dt><dd className="max-w-[60%] truncate text-right font-medium">{accountName || "Not provided"}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Mobile number</dt><dd className="max-w-[60%] truncate text-right font-medium">{phoneNumber || "Not provided"}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Reference number</dt><dd className="max-w-[60%] truncate text-right font-medium">{reference || "Not provided"}</dd></div><div className="flex justify-between gap-4 border-t border-dashed pt-3"><dt className="font-medium">Status</dt><dd className="font-medium text-amber-600">Pending verification</dd></div></dl></div></section>
}

function PaymentStep({ method, reference, gcashAccountName, gcashNumber, gcashReceipt, onMethodChange, onReferenceChange, onGcashAccountNameChange, onGcashNumberChange, onGcashReceiptChange }: { method: string; reference: string; gcashAccountName: string; gcashNumber: string; gcashReceipt: File | null; onMethodChange: (value: string) => void; onReferenceChange: (value: string) => void; onGcashAccountNameChange: (value: string) => void; onGcashNumberChange: (value: string) => void; onGcashReceiptChange: (file: File | null) => void }) {
  const paymentMethods = ["Cash", "GCash"]

  return <><CardHeader><CardTitle>Choose your payment</CardTitle><CardDescription>Select a payment method for your reservation. Our team will confirm the final amount and availability.</CardDescription></CardHeader><CardContent className="grid gap-5"><div className="grid gap-3 sm:grid-cols-2">{paymentMethods.map((paymentOption) => <button key={paymentOption} type="button" onClick={() => onMethodChange(paymentOption)} className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${method === paymentOption ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "hover:bg-muted"}`} aria-pressed={method === paymentOption}><span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${method === paymentOption ? "bg-primary text-primary-foreground" : "bg-muted text-primary"}`}><CreditCardIcon className="size-4" /></span><span><span className="block text-sm font-medium">{paymentOption}</span><span className="mt-1 block text-xs text-muted-foreground">{paymentOption === "Cash" ? "Pay after the reservation is confirmed" : "Provide payment details after confirmation"}</span></span></button>)}</div>{method === "GCash" && <div className="grid gap-5 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2"><div className="sm:col-span-2"><p className="font-medium">GCash payment information</p><p className="mt-1 text-sm text-muted-foreground">Enter the account used for payment and upload your receipt screenshot.</p></div><label className="grid gap-2 text-sm font-medium">GCash account name<Input value={gcashAccountName} onChange={(event) => onGcashAccountNameChange(event.target.value)} placeholder="Name on the GCash account" required /></label><label className="grid gap-2 text-sm font-medium">GCash mobile number<Input type="tel" value={gcashNumber} onChange={(event) => onGcashNumberChange(event.target.value)} placeholder="09XXXXXXXXX" required /></label><label className="grid gap-2 text-sm font-medium sm:col-span-2">Upload GCash receipt screenshot<Input type="file" accept="image/*" onChange={(event) => onGcashReceiptChange(event.target.files?.[0] ?? null)} required /></label>{gcashReceipt && <p className="text-xs text-muted-foreground sm:col-span-2">Selected receipt: {gcashReceipt.name}</p>}<label className="grid gap-2 text-sm font-medium sm:col-span-2">Payment reference number<Input value={reference} onChange={(event) => onReferenceChange(event.target.value)} placeholder="Enter your GCash reference number" required /></label></div>}{method !== "Cash" && method !== "GCash" && <label className="grid gap-2 text-sm font-medium">Payment reference or account detail<Input value={reference} onChange={(event) => onReferenceChange(event.target.value)} placeholder="Reference number or account name" required /></label>}</CardContent></>
}

function getPackagePrice(price: string) {
  return Number(price.replace(/[^0-9.]/g, "")) || 0
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value)
}

function ReviewStep({ cart, eventType, eventDate, guests, location, packageChoice, notes, eventDetails }: { cart: string[]; eventType: string; eventDate: string; guests: string; location: string; packageChoice: string; notes: string; eventDetails: Record<string, string> }) {
  const detailSummary = Object.entries(eventDetails).filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`).join("; ")
  const cartItems = packages.filter((item) => cart.includes(item.title))
  const total = cartItems.reduce((sum, item) => sum + getPackagePrice(item.price), 0)

  return <><CardHeader><CardTitle>Review your request</CardTitle><CardDescription>Check the details below before sending your reservation request.</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><Summary label="Occasion" value={eventType} /><Summary label="Event date" value={eventDate || "To be scheduled"} /><Summary label="Guests" value={`${guests || "0"} people`} /><Summary label="Location" value={location || "To be confirmed"} /><Summary label="Package" value={packageChoice} /><Summary label="Event details" value={detailSummary || "No event-specific details"} /><Summary label="Notes" value={notes || "No special requests"} /><section className="rounded-xl border bg-muted/20 p-4 sm:col-span-2" aria-labelledby="invoice-title"><div className="flex items-start justify-between gap-4 border-b pb-3"><div><p className="text-sm text-muted-foreground">Invoice</p><h2 id="invoice-title" className="mt-1 text-lg font-semibold">Added to cart</h2></div><Badge variant="secondary">{cartItems.length} item{cartItems.length === 1 ? "" : "s"}</Badge></div>{cartItems.length === 0 ? <p className="py-6 text-sm text-muted-foreground">No items have been added to the cart yet.</p> : <div className="grid gap-3 py-4">{cartItems.map((item) => <div key={item.title} className="flex items-center justify-between gap-4 text-sm"><span className="min-w-0 truncate">{item.title}</span><span className="shrink-0 font-medium">{item.price}</span></div>)}</div>}<div className="flex items-center justify-between border-t pt-3 text-sm"><span className="text-muted-foreground">Total</span><span className="text-lg font-semibold text-primary">{formatCurrency(total)}</span></div></section></CardContent></>
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>
}

function SuccessState({ eventType, eventDate }: { eventType: string; eventDate: string }) {
  return <main className="flex flex-1 items-center justify-center bg-muted/20 p-4 md:p-8"><Card className="w-full max-w-xl bg-background text-center"><CardContent className="flex flex-col items-center gap-4 p-8 md:p-12"><span className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><CheckCircle2Icon className="size-8" /></span><Badge variant="secondary">Request sent</Badge><h1 className="text-2xl font-semibold tracking-tight">We&apos;ll take it from here.</h1><p className="max-w-md text-sm leading-6 text-muted-foreground">Your {eventType.toLowerCase()} request{eventDate ? ` for ${eventDate}` : ""} has been sent to Edsel&apos;s team. We&apos;ll message you soon to confirm availability and final details.</p><Button onPress={() => window.location.reload()}>Make another request</Button></CardContent></Card></main>
}
