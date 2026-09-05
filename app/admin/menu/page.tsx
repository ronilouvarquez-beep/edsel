"use client"

import { useEffect, useState } from "react"
import { ArrowLeftIcon, ArrowRightIcon, BarChart3Icon, CheckCircle2Icon, Edit3Icon, MoreHorizontalIcon, PlusIcon, SearchIcon, UtensilsIcon, UsersRoundIcon, XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const categories = ["Catering Buffet", "Food", "Desserts"]
const PAGE_SIZE = 10
const initialFoodMenus = [
  { name: "Fiesta food tray", category: "Food", description: "A generous spread of savory favorites for sharing.", price: "From ₱1,450", status: "Available", serves: "10-15 guests", includes: ["Choice of savory dishes", "Serving trays", "Portions based on guest count"], images: ["https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=85"] },
  { name: "Pasta and chicken tray", category: "Food", description: "Creamy pasta paired with tender roasted chicken.", price: "From ₱1,250", status: "Available", serves: "8-12 guests", includes: ["Creamy pasta", "Roasted chicken", "Serving trays"], images: ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=85", "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=85"] },
  { name: "Wedding catering buffet", category: "Catering Buffet", description: "Elegant food service prepared for a special celebration.", price: "From ₱8,500", status: "Available", serves: "25-50 guests", includes: ["Main dishes", "Dessert selection", "Basic buffet setup"], images: ["https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85", "https://images.unsplash.com/photo-1519225421980-715cb0215AED?auto=format&fit=crop&w=1000&q=85"] },
  { name: "Lumpiang shanghai platter", category: "Food", description: "Crispy spring rolls with a sweet-savory dip.", price: "From ₱850", status: "Available", serves: "15-20 guests", includes: ["Lumpiang shanghai", "Sweet chili dip", "Garnish"], images: ["https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=85"] },
  { name: "Lechon kawali tray", category: "Food", description: "Crispy pork belly with rice and atchara.", price: "From ₱1,650", status: "Available", serves: "10-14 guests", includes: ["Lechon kawali", "Steamed rice", "Atchara"], images: ["https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=1000&q=85", "https://images.unsplash.com/photo-1544025162-d7664031593f?auto=format&fit=crop&w=1000&q=85"] },
  { name: "Seafood platter", category: "Food", description: "Grilled and steamed seafood for a generous table.", price: "From ₱2,100", status: "Available", serves: "8-12 guests", includes: ["Grilled fish", "Shrimp", "Calamansi dip"], images: ["https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=85"] },
  { name: "Ube cake slices", category: "Desserts", description: "Soft ube cake cut for sharing after the meal.", price: "From ₱980", status: "Available", serves: "12-16 guests", includes: ["Ube cake", "Buttercream", "Boxed slices"], images: ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=85"] },
  { name: "Mango graham cups", category: "Desserts", description: "Chilled mango graham served in individual cups.", price: "From ₱720", status: "Available", serves: "20 cups", includes: ["Mango", "Graham", "Cream"], images: ["https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1000&q=85"] },
  { name: "Chocolate fountain dessert", category: "Desserts", description: "A dessert station with dippers and chocolate.", price: "From ₱2,450", status: "Available", serves: "20-30 guests", includes: ["Chocolate fountain", "Fruit dippers", "Marshmallows"], images: ["https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=1000&q=85"] },
  { name: "Baptism merienda set", category: "Catering Buffet", description: "A calm merienda spread after the ceremony.", price: "From ₱4,200", status: "Available", serves: "20-30 guests", includes: ["Sandwich tray", "Juice", "Small cakes"], images: ["https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=85"] },
  { name: "Office lunch boxes", category: "Food", description: "Packed meals ready for meetings and gatherings.", price: "From ₱185 each", status: "Available", serves: "10+ boxes", includes: ["Rice", "Main dish", "Side and drink"], images: ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85"] },
  { name: "Halo-halo dessert bar", category: "Desserts", description: "A build-your-own halo-halo station for parties.", price: "From ₱1,800", status: "Available", serves: "15-25 guests", includes: ["Shaved ice", "Toppings", "Leche flan"], images: ["https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1000&q=85"] },
  { name: "Birthday party buffet", category: "Catering Buffet", description: "A colorful buffet built for birthdays and play tables.", price: "From ₱5,800", status: "Available", serves: "20-40 guests", includes: ["Savory trays", "Dessert table", "Drinks"], images: ["https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1000&q=85"] },
]

type FoodMenu = (typeof initialFoodMenus)[number]

export default function MenuPage() {
  const [foodMenus, setFoodMenus] = useState(initialFoodMenus)
  const [search, setSearch] = useState("")
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const query = search.trim().toLowerCase()
  const filteredMenus = foodMenus.filter((item) => `${item.name} ${item.category} ${item.description} ${item.serves} ${item.includes.join(" ")}`.toLowerCase().includes(query))
  const visibleMenus = filteredMenus.slice(0, visibleCount)
  const hasMore = visibleCount < filteredMenus.length

  function addFoodMenu(menu: Omit<FoodMenu, "status">) {
    setFoodMenus((current) => [...current, { ...menu, status: "Available" }])
    setShowAddMenu(false)
  }

  return <main className="flex min-h-screen flex-1 flex-col bg-muted/20 p-4 md:p-6 lg:p-8"><div className="mx-auto flex w-full max-w-7xl flex-col gap-6"><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-primary">Admin menu</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Food menu</h1><p className="mt-2 text-muted-foreground">Manage every food tray and catering buffet offered to customers.</p></div><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="relative w-full sm:w-64"><SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setVisibleCount(PAGE_SIZE) }} placeholder="Search food menu..." aria-label="Search food menu" className="h-9 pl-9" /></div><Button onPress={() => setShowAddMenu(true)}><PlusIcon /> Add food menu</Button></div></header><section className="grid gap-4 sm:grid-cols-3"><Summary icon={<UtensilsIcon />} label="Food menus" value={`${foodMenus.length}`} detail="Active menu cards" /><Summary icon={<CheckCircle2Icon />} label="Available" value={`${foodMenus.filter((item) => item.status === "Available").length}`} detail="Ready for reservations" /><Summary icon={<UsersRoundIcon />} label="Guest coverage" value="8-50" detail="Guests per package" /></section><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{visibleMenus.map((item) => <FoodMenuCard key={item.name} item={item} />)}</div>{filteredMenus.length > PAGE_SIZE && <div className="flex justify-center"><Button variant="outline" onPress={() => setVisibleCount((current) => hasMore ? current + PAGE_SIZE : PAGE_SIZE)}>{hasMore ? `See more (${filteredMenus.length - visibleCount} left)` : "Show less"}</Button></div>}</div>{showAddMenu && <AddMenuModal onClose={() => setShowAddMenu(false)} onAdd={addFoodMenu} />}</main>
}

function FoodMenuCard({ item }: { item: FoodMenu }) {
  const [imageIndex, setImageIndex] = useState(0)
  return <Card className="group overflow-hidden bg-background"><div className="relative h-48 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url('${item.images[imageIndex]}')` }} role="img" aria-label={`${item.name}, image ${imageIndex + 1} of ${item.images.length}`}><button type="button" onClick={() => setImageIndex((current) => (current - 1 + item.images.length) % item.images.length)} className="absolute top-1/2 left-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white" aria-label={`Previous ${item.name} image`}><ArrowLeftIcon className="size-4" /></button><button type="button" onClick={() => setImageIndex((current) => (current + 1) % item.images.length)} className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white" aria-label={`Next ${item.name} image`}><ArrowRightIcon className="size-4" /></button><Badge className="absolute top-3 left-3 border-emerald-200 bg-emerald-100 text-emerald-700"><CheckCircle2Icon /> {item.status}</Badge></div><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle className="text-lg">{item.name}</CardTitle><Badge variant="outline" className="mt-2">{item.category}</Badge></div><button type="button" className="flex size-8 items-center justify-center rounded-lg hover:bg-muted" aria-label={`More actions for ${item.name}`}><MoreHorizontalIcon className="size-4" /></button></div><CardDescription>{item.description}</CardDescription></CardHeader><CardContent className="grid gap-4"><div className="flex justify-between border-b pb-3"><span className="font-semibold text-primary">{item.price}</span><span className="text-xs text-muted-foreground">{item.serves}</span></div><ul className="grid gap-1 text-sm">{item.includes.map((include) => <li key={include} className="flex gap-2"><CheckCircle2Icon className="size-3.5 text-primary" />{include}</li>)}</ul><Button variant="outline" className="w-full"><Edit3Icon /> Edit food menu</Button></CardContent></Card>
}

function AddMenuModal({ onClose, onAdd }: { onClose: () => void; onAdd: (menu: Omit<FoodMenu, "status">) => void }) {
  const [category, setCategory] = useState(categories[0])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [serves, setServes] = useState("")
  const [includedItems, setIncludedItems] = useState([""])
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview)), [previews])

  function addImages(files: File[]) {
    setImages((current) => [...current, ...files])
    setPreviews((current) => [...current, ...files.map((file) => URL.createObjectURL(file))])
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onAdd({ category, name, description, price: `From ₱${price}`, serves, includes: includedItems.filter(Boolean), images: images.length ? images.map((file) => URL.createObjectURL(file)) : ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=85"] })
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onClick={onClose}><section role="dialog" aria-modal="true" aria-labelledby="add-food-menu-title" className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border bg-background p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><h2 id="add-food-menu-title" className="text-2xl font-bold text-primary">Add food menu</h2><p className="mt-1 text-xs text-muted-foreground">Food menu management</p></div><button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-lg hover:bg-muted" aria-label="Close add food menu form"><XIcon className="size-4" /></button></div><form className="mt-6 grid gap-4" onSubmit={handleSubmit}><label className="grid gap-2 text-sm font-medium">Category<select value={category} onChange={(event) => setCategory(event.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm">{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Menu name<Input value={name} onChange={(event) => setName(event.target.value)} placeholder="For example, Seafood tray" required /></label><label className="grid gap-2 text-sm font-medium">Description<Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the food menu" required /></label><div className="grid gap-2"><label className="text-sm font-medium">Upload images</label><p className="text-xs text-muted-foreground">Upload one or more menu images. Choose more files to add more images.</p><Input type="file" accept="image/*" multiple onChange={(event) => addImages(Array.from(event.target.files ?? []))} />{images.length > 0 && <div className="grid grid-cols-3 gap-2">{previews.map((preview, index) => <div key={`${images[index].name}-${images[index].lastModified}`} className="overflow-hidden rounded-md border bg-muted"><div className="h-20 bg-cover bg-center" style={{ backgroundImage: `url('${preview}')` }} role="img" aria-label={`Uploaded menu image ${index + 1}`} /><p className="truncate px-2 py-1 text-[10px] text-muted-foreground">{images[index].name}</p></div>)}</div>}</div><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Starting price<Input type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="1500" required /></label><label className="grid gap-2 text-sm font-medium">Guest coverage<Input value={serves} onChange={(event) => setServes(event.target.value)} placeholder="10-15 guests" required /></label></div><div className="grid gap-2"><div className="flex items-center justify-between"><label className="text-sm font-medium">Included items</label><Button type="button" variant="outline" size="sm" onPress={() => setIncludedItems((current) => [...current, ""])}><PlusIcon /> Add item</Button></div>{includedItems.map((item, index) => <div key={`included-${index}`} className="flex gap-2"><Input value={item} onChange={(event) => setIncludedItems((current) => current.map((value, itemIndex) => itemIndex === index ? event.target.value : value))} placeholder={`Included item ${index + 1}`} required />{includedItems.length > 1 && <Button type="button" variant="ghost" size="icon" aria-label={`Remove included item ${index + 1}`} onPress={() => setIncludedItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}><XIcon /></Button>}</div>)}</div><div className="mt-2 flex justify-end gap-2"><Button type="button" variant="outline" onPress={onClose}>Cancel</Button><Button type="submit"><PlusIcon /> Add food menu</Button></div></form></section></div>
}

function Summary({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <Card><CardContent className="flex items-center gap-3 p-4"><span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span><div><p className="text-xl font-semibold leading-none">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label} · {detail}</p></div><BarChart3Icon className="ml-auto size-4 text-muted-foreground" /></CardContent></Card>
}
