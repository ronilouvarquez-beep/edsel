"use client"

import { useState } from "react"
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon, CakeSliceIcon, ChefHatIcon, ChevronRightIcon, CoffeeIcon, SearchIcon, UtensilsIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { LinkButton } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"

type MenuCategory = "All" | "Cakes" | "Food trays" | "Decorations"
type MenuItem = { name: string; description: string; price: string; category: Exclude<MenuCategory, "All">; images: string[]; tag?: string }

const menuItems: MenuItem[] = [
  { name: "Signature chocolate cake", description: "Rich chocolate layers with a smooth ganache finish.", price: "From ₱850", category: "Cakes", tag: "Best seller", images: ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1588195538326-c5b1e2c8f2f1?auto=format&fit=crop&w=900&q=85"] },
  { name: "Ube celebration cake", description: "Soft ube chiffon, creamy filling, and toasted coconut.", price: "From ₱950", category: "Cakes", images: ["https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=900&q=85"] },
  { name: "Fresh fruit shortcake", description: "Light vanilla sponge topped with seasonal fruit.", price: "From ₱1,050", category: "Cakes", images: ["https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=900&q=85"] },
  { name: "Fiesta food tray", description: "A generous spread of savory favorites for sharing.", price: "From ₱1,450", category: "Food trays", tag: "Good for groups", images: ["https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85"] },
  { name: "Pasta and chicken tray", description: "Creamy pasta paired with tender roasted chicken.", price: "From ₱1,250", category: "Food trays", images: ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=85"] },
  { name: "Dessert table styling", description: "A styled sweets table with stands, labels, and accents.", price: "From ₱2,500", category: "Decorations", tag: "Customizable", images: ["https://images.unsplash.com/photo-1519225421980-715cb0215AED?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=85"] },
  { name: "Birthday cake setup", description: "A cheerful backdrop and cake table for a memorable reveal.", price: "From ₱1,800", category: "Decorations", images: ["https://images.unsplash.com/photo-1530103862676-de8c9deaffa1?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=85"] },
]

const categories: { label: MenuCategory; icon: typeof CakeSliceIcon }[] = [
  { label: "All", icon: ChefHatIcon },
  { label: "Cakes", icon: CakeSliceIcon },
  { label: "Food trays", icon: UtensilsIcon },
  { label: "Decorations", icon: CoffeeIcon },
]

export default function CustomerMenuPage() {
  const [category, setCategory] = useState<MenuCategory>("All")
  const [search, setSearch] = useState("")
  const visibleItems = menuItems.filter((item) => {
    const matchesCategory = category === "All" || item.category === category
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  })

  return (
    <main className="flex flex-1 flex-col bg-muted/20">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-4 md:p-6 lg:p-8">
        <header className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="/customer">Customer</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbItem><BreadcrumbLink href="/customer/menu">Browse Menu</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbItem><BreadcrumbPage>{category}</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <p className="mt-4 text-sm font-medium text-primary">Customer menu</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Browse cakes, food, and decorations</h1>
          </div>
          <div className="relative w-full md:max-w-xs">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the menu..." aria-label="Search menu" className="h-10 pl-9" />
          </div>
        </header>
        <section className="grid overflow-hidden rounded-2xl bg-[#251b18] text-white lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center p-7 md:p-10"><Badge className="mb-4 w-fit border-white/20 bg-white/10 text-white">Made for your table</Badge><h1 className="max-w-xl text-3xl font-semibold tracking-tight md:text-5xl">Something sweet, something shared.</h1><p className="mt-4 max-w-lg text-sm leading-6 text-white/70 md:text-base">Browse cakes, food trays, and celebration styling from Edsel&apos;s. Tell us what you&apos;re planning and we&apos;ll help bring it together.</p><LinkButton href="/customer/messages" variant="secondary" className="mt-7 w-fit">Plan with our team <ArrowUpRightIcon /></LinkButton></div>
          <div className="min-h-64 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1200&q=85')" }} aria-label="Decorated cakes and pastries" />
        </section>

        <section className="flex flex-col gap-4"><div><p className="text-sm font-medium text-primary">Explore the menu</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Choose what fits your celebration</h2></div><div className="flex flex-wrap gap-2">{categories.map(({ label, icon: Icon }) => <button key={label} type="button" onClick={() => setCategory(label)} className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${category === label ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`} aria-pressed={category === label}><Icon className="size-4" />{label}</button>)}</div></section>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleItems.map((item) => <MenuCard key={item.name} item={item} />)}{visibleItems.length === 0 && <div className="rounded-xl border border-dashed bg-background p-10 text-center sm:col-span-2 lg:col-span-3"><p className="font-medium">No menu items found</p><p className="mt-1 text-sm text-muted-foreground">Try a different search or category.</p></div>}</section>

        <section className="grid gap-4 md:grid-cols-3"><QuickLink icon={<CakeSliceIcon />} title="Custom cakes" description="Have a design in mind?" href="/customer/messages" /><QuickLink icon={<UtensilsIcon />} title="Catering requests" description="Build a spread for your guests." href="/customer/messages" /><QuickLink icon={<ChevronRightIcon />} title="My reservations" description="Review your upcoming plans." href="/customer/reservations" /></section>
      </div>
    </main>
  )
}

function MenuCard({ item }: { item: MenuItem }) {
  const [activeImage, setActiveImage] = useState(0)
  const previousImage = () => setActiveImage((current) => (current - 1 + item.images.length) % item.images.length)
  const nextImage = () => setActiveImage((current) => (current + 1) % item.images.length)

  return <Card className="group h-full overflow-hidden bg-background [transform-style:preserve-3d] transition-transform duration-300 hover:[transform:perspective(1000px)_rotateX(2deg)_rotateY(-2deg)]"><div className="relative h-52 overflow-hidden bg-cover bg-center transition-transform duration-500 group-hover:[transform:translateZ(18px)_scale(1.03)]" style={{ backgroundImage: `url('${item.images[activeImage]}')` }} role="img" aria-label={`${item.name}, image ${activeImage + 1} of ${item.images.length}`}><button type="button" onClick={previousImage} className="absolute top-1/2 left-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/75" aria-label={`Previous image of ${item.name}`}><ArrowLeftIcon className="size-4" /></button><button type="button" onClick={nextImage} className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/75" aria-label={`Next image of ${item.name}`}><ArrowRightIcon className="size-4" /></button><span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white">{activeImage + 1} / {item.images.length}</span></div><div className="flex gap-2 border-b bg-muted/20 px-4 py-3">{item.images.map((image, index) => <button key={image} type="button" onClick={() => setActiveImage(index)} className={`h-11 w-14 overflow-hidden rounded-md border-2 bg-cover bg-center transition ${activeImage === index ? "border-primary" : "border-transparent opacity-65 hover:opacity-100"}`} style={{ backgroundImage: `url('${image}')` }} aria-label={`View image ${index + 1} of ${item.name}`} aria-pressed={activeImage === index} />)}</div><CardHeader className="gap-2"><div className="flex items-start justify-between gap-3"><CardTitle className="text-lg">{item.name}</CardTitle>{item.tag && <Badge variant="secondary" className="shrink-0">{item.tag}</Badge>}</div><CardDescription className="leading-5">{item.description}</CardDescription></CardHeader><CardContent className="mt-auto flex items-center justify-between gap-3"><span className="font-semibold">{item.price}</span><LinkButton href="/customer/messages" variant="outline" size="sm">Ask about this <ArrowUpRightIcon /></LinkButton></CardContent></Card>
}

function QuickLink({ icon, title, description, href }: { icon: React.ReactNode; title: string; description: string; href: string }) {
  return <LinkButton href={href} variant="outline" className="h-auto justify-start gap-3 p-4 text-left"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">{icon}</span><span className="flex min-w-0 flex-col"><span className="font-medium">{title}</span><span className="text-xs font-normal text-muted-foreground">{description}</span></span><ArrowUpRightIcon className="ml-auto" /></LinkButton>
}