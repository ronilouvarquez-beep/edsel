"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import dynamic from "next/dynamic"
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
  EyeIcon,
  HeartIcon,
  MapPinIcon,
  PartyPopperIcon,
  SearchIcon,
  ShoppingCartIcon,
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
]

const eventTypes = [
  { title: "Birthday", description: "Cakes and party treats", icon: CakeSliceIcon },
  { title: "Wedding", description: "Catering for your special day", icon: HeartIcon },
  { title: "Food trays", description: "Sharing food for any gathering", icon: ChefHatIcon },
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
  const [packageChoice, setPackageChoice] = useState("Birthday cake")
  const [cart, setCart] = useState<string[]>([])
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
  }

  function toggleCart(title: string) {
    setCart((current) => current.includes(title) ? current.filter((item) => item !== title) : [...current, title])
  }

  function removeFromCart(title: string) {
    setCart((current) => current.filter((item) => item !== title))
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

        <nav aria-label="Reservation progress" className="grid grid-cols-4 gap-2">
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
          {step === 2 && <DetailsStep eventDate={eventDate} guests={guests} location={location} onDateChange={setEventDate} onGuestsChange={setGuests} onLocationChange={setLocation} />}
          {step === 3 && <ReviewStep eventType={eventType} eventDate={eventDate} guests={guests} location={location} packageChoice={packageChoice} notes={notes} />}
          <CardContent className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between"><Button variant="ghost" onPress={() => setStep((current) => Math.max(0, current - 1))} isDisabled={step === 0}><ArrowLeftIcon /> Back</Button><div className="flex items-center gap-3"><span className="text-xs text-muted-foreground">Step {step + 1} of {steps.length}</span><Button onPress={nextStep}>{step === steps.length - 1 ? "Send reservation request" : "Continue"}{step === steps.length - 1 ? <CheckCircle2Icon /> : <ArrowRightIcon />}</Button></div></CardContent>
        </Card>
        {step === 0 && <div className="sticky bottom-4 z-20 flex justify-end pointer-events-none"><Button size="icon-lg" className="pointer-events-auto relative rounded-full shadow-xl" onPress={() => setShowCart(true)} aria-label={`View cart with ${cart.length} item${cart.length === 1 ? "" : "s"}`}><ShoppingCartIcon />{cart.length > 0 && <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">{cart.length}</span>}</Button></div>}
        {showCart && <CartModal items={cart} onRemove={removeFromCart} onClose={() => setShowCart(false)} />}
      </div>
    </main>
  )
}

function EventStep({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <><CardHeader><CardTitle>What are you celebrating?</CardTitle><CardDescription>Choose the occasion so we can recommend the right menu and setup.</CardDescription></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{eventTypes.map(({ title, description, icon: Icon }) => <button key={title} type="button" onClick={() => onChange(title)} className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${value === title ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "hover:bg-muted"}`} aria-pressed={value === title}><span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${value === title ? "bg-primary text-primary-foreground" : "bg-muted text-primary"}`}><Icon className="size-5" /></span><span><span className="block font-medium">{title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span></span></button>)}</CardContent></>
}

function DetailsStep({ eventDate, guests, location, onDateChange, onGuestsChange, onLocationChange }: { eventDate: string; guests: string; location: string; onDateChange: (value: string) => void; onGuestsChange: (value: string) => void; onLocationChange: (value: string) => void }) {
  return <><CardHeader><CardTitle>Tell us about the event</CardTitle><CardDescription>These details help us check availability and plan the right quantity.</CardDescription></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Event date<Input type="date" value={eventDate} onChange={(event) => onDateChange(event.target.value)} required /></label><label className="grid gap-2 text-sm font-medium">Number of guests<Input type="number" min="1" value={guests} onChange={(event) => onGuestsChange(event.target.value)} required /></label><label className="grid gap-2 text-sm font-medium sm:col-span-2">Event location<div className="relative"><MapPinIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Venue or delivery address" value={location} onChange={(event) => onLocationChange(event.target.value)} required /></div></label></CardContent></>
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
  const [flavor, setFlavor] = useState("Signature flavor")
  const [size, setSize] = useState("Standard size")
  const [customDetails, setCustomDetails] = useState("")
  const isDecoration = item.category === "Decorations" || item.categories?.includes("Decorations")
  const previousImage = () => setImageIndex((current) => (current - 1 + item.images.length) % item.images.length)
  const nextImage = () => setImageIndex((current) => (current + 1) % item.images.length)
  const handleCardClick = (event: React.MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button")) return
    onSelect(item.title)
  }
  const saveCustomization = () => {
    const details = `Flavor: ${flavor}; Size: ${size}${customDetails ? `; ${customDetails}` : ""}`
    onCustomize(item.title, details)
    setShowCustomize(false)
  }

  return <article onClick={handleCardClick} className={`group cursor-pointer overflow-hidden rounded-xl border [transform-style:preserve-3d] transition-all duration-300 hover:[transform:perspective(1000px)_rotateX(2deg)_rotateY(-2deg)] ${selected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "bg-background hover:-translate-y-0.5 hover:bg-muted"}`}><div className="relative h-40 overflow-hidden bg-cover bg-center transition-transform duration-500 group-hover:[transform:translateZ(18px)_scale(1.03)]" style={{ backgroundImage: `url('${item.images[imageIndex]}')` }} role="img" aria-label={`${item.title}, image ${imageIndex + 1} of ${item.images.length}`}><div className="absolute inset-0 bg-black/15" /><button type="button" onClick={previousImage} className="absolute top-1/2 left-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75" aria-label={`Previous ${item.title} image`}><ArrowLeftIcon className="size-4" /></button><button type="button" onClick={nextImage} className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75" aria-label={`Next ${item.title} image`}><ArrowRightIcon className="size-4" /></button>{isDecoration && <button type="button" onClick={(event) => { event.stopPropagation(); setShowPanorama(true) }} className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1.5 text-primary-foreground shadow-sm transition hover:bg-primary/90" aria-label={`View 360 view for ${item.title}`}><EyeIcon className="size-3.5" /><span className="text-[10px] font-semibold uppercase tracking-[0.12em]">360 view</span></button>}{selected && <span className="absolute top-3 left-3 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground"><CheckCircle2Icon className="size-4" /></span>}<span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white">{imageIndex + 1}/{item.images.length}</span></div><button type="button" onClick={() => onSelect(item.title)} className="block w-full p-4 text-left" aria-pressed={selected}><span className="block font-medium">{item.title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.description}</span><span className="mt-3 block text-sm font-semibold text-primary">{item.price}</span></button><div className="flex gap-2 border-t p-3"><Button type="button" variant={inCart ? "default" : "outline"} className="min-w-0 flex-1" onPress={() => onAddToCart(item.title)}>{inCart ? "Added to cart" : "Add to cart"}<ShoppingCartIcon /></Button><Button type="button" variant="outline" className="min-w-0 flex-1" onPress={() => setShowInclusion((current) => !current)}>{showInclusion ? "Hide Inclusion" : "View Inclusion"}<ChevronDownIcon className={`transition-transform ${showInclusion ? "rotate-180" : ""}`} /></Button></div><div className="flex gap-2 border-t px-3 pb-3"><Button type="button" variant={selected ? "default" : "outline"} className="w-full" onPress={() => setShowCustomize(true)}>{selected ? "Customize" : "Customize this"}<ArrowRightIcon /></Button></div>{showInclusion && <div className="border-t bg-muted/30 px-4 py-3"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Included</p><ul className="mt-2 grid gap-1 text-sm">{item.includes.map((inclusion) => <li key={inclusion} className="flex gap-2"><CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-primary" />{inclusion}</li>)}</ul></div>}{showCustomize && <CustomizeModal itemTitle={item.title} flavor={flavor} size={size} details={customDetails} onFlavorChange={setFlavor} onSizeChange={setSize} onDetailsChange={setCustomDetails} onClose={() => setShowCustomize(false)} onSave={saveCustomization} />}{showPanorama && <PanoramaModal item={item} imageIndex={imageIndex} onPrevious={previousImage} onNext={nextImage} onClose={() => setShowPanorama(false)} onSelectImage={setImageIndex} />}</article>
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

function CartModal({ items, onRemove, onClose }: { items: string[]; onRemove: (title: string) => void; onClose: () => void }) {
  const cartPackages = packages.filter((item) => items.includes(item.title))
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onClick={onClose}><section role="dialog" aria-modal="true" aria-labelledby="cart-title" className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border bg-background p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-muted-foreground">Your selected menus</p><h2 id="cart-title" className="mt-1 text-xl font-semibold">Cart ({cartPackages.length})</h2></div><Button variant="ghost" size="icon" aria-label="Close cart" onPress={onClose}><XIcon /></Button></div>{cartPackages.length === 0 ? <div className="py-10 text-center"><ShoppingCartIcon className="mx-auto size-10 text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">Your cart is empty.</p></div> : <div className="mt-6 grid max-h-[min(55vh,28rem)] gap-3 overflow-y-auto pr-1">{cartPackages.map((item) => <div key={item.title} className="flex items-center gap-3 rounded-lg border p-3"><div className="size-14 shrink-0 rounded-md bg-cover bg-center" style={{ backgroundImage: `url('${item.images[0]}')` }} aria-label={item.title} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{item.price}</p></div><Button variant="ghost" size="sm" onPress={() => onRemove(item.title)}>Remove</Button></div>)}</div>}<div className="mt-6 flex justify-end"><Button onPress={onClose}>Continue browsing</Button></div></section></div>
}

function CustomizeModal({ itemTitle, flavor, size, details, onFlavorChange, onSizeChange, onDetailsChange, onClose, onSave }: { itemTitle: string; flavor: string; size: string; details: string; onFlavorChange: (value: string) => void; onSizeChange: (value: string) => void; onDetailsChange: (value: string) => void; onClose: () => void; onSave: () => void }) {
  return createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="presentation" onClick={onClose}><section role="dialog" aria-modal="true" aria-labelledby="customize-title" className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border bg-background p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-muted-foreground">Customize your selection</p><h2 id="customize-title" className="mt-1 text-xl font-semibold">{itemTitle}</h2></div><Button variant="ghost" size="icon" aria-label="Close customization" onPress={onClose}><XIcon /></Button></div><div className="mt-6 grid gap-4"><label className="grid gap-2 text-sm font-medium">Flavor<select value={flavor} onChange={(event) => onFlavorChange(event.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm"><option>Signature flavor</option><option>Chocolate</option><option>Ube</option><option>Vanilla</option><option>Red velvet</option></select></label><label className="grid gap-2 text-sm font-medium">Size<select value={size} onChange={(event) => onSizeChange(event.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm"><option>Standard size</option><option>Small, up to 10 guests</option><option>Medium, up to 25 guests</option><option>Large, up to 50 guests</option></select></label><label className="grid gap-2 text-sm font-medium">Additional customization<Textarea value={details} onChange={(event) => onDetailsChange(event.target.value)} placeholder="Colors, message, dietary needs, or design ideas" /></label></div><div className="mt-6 flex justify-end gap-2"><Button variant="outline" onPress={onClose}>Cancel</Button><Button onPress={onSave}>Add to cart <ShoppingCartIcon /></Button></div></section></div>, document.body)
}

function ReviewStep({ eventType, eventDate, guests, location, packageChoice, notes }: { eventType: string; eventDate: string; guests: string; location: string; packageChoice: string; notes: string }) {
  return <><CardHeader><CardTitle>Review your request</CardTitle><CardDescription>Check the details below before sending your reservation request.</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><Summary label="Occasion" value={eventType} /><Summary label="Event date" value={eventDate || "To be scheduled"} /><Summary label="Guests" value={`${guests || "0"} people`} /><Summary label="Location" value={location || "To be confirmed"} /><Summary label="Package" value={packageChoice} /><Summary label="Notes" value={notes || "No special requests"} /></CardContent></>
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>
}

function SuccessState({ eventType, eventDate }: { eventType: string; eventDate: string }) {
  return <main className="flex flex-1 items-center justify-center bg-muted/20 p-4 md:p-8"><Card className="w-full max-w-xl bg-background text-center"><CardContent className="flex flex-col items-center gap-4 p-8 md:p-12"><span className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><CheckCircle2Icon className="size-8" /></span><Badge variant="secondary">Request sent</Badge><h1 className="text-2xl font-semibold tracking-tight">We&apos;ll take it from here.</h1><p className="max-w-md text-sm leading-6 text-muted-foreground">Your {eventType.toLowerCase()} request{eventDate ? ` for ${eventDate}` : ""} has been sent to Edsel&apos;s team. We&apos;ll message you soon to confirm availability and final details.</p><Button onPress={() => window.location.reload()}>Make another request</Button></CardContent></Card></main>
}
