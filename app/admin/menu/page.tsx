"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ArrowLeftIcon, ArrowRightIcon, BarChart3Icon, CheckCircle2Icon, Edit3Icon, MoreHorizontalIcon, PlusIcon, SearchIcon, UtensilsIcon, UsersRoundIcon, XIcon } from "lucide-react"

import { createFoodMenu, listCategories, listFoodMenus, type CategoryOption, type FoodMenuRecord } from "@/app/actions/food-menu"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const PAGE_SIZE = 10

export default function MenuPage() {
  const [foodMenus, setFoodMenus] = useState<FoodMenuRecord[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [search, setSearch] = useState("")
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const query = search.trim().toLowerCase()
  const filteredMenus = foodMenus.filter((item) => `${item.name} ${item.category} ${item.description} ${item.serves} ${item.includes.join(" ")}`.toLowerCase().includes(query))
  const visibleMenus = filteredMenus.slice(0, visibleCount)
  const hasMore = visibleCount < filteredMenus.length

  useEffect(() => {
    Promise.all([listFoodMenus(), listCategories()]).then(([menus, categoryList]) => {
      if (menus.error) toast.error("Failed to load food menus.", { description: menus.error })
      if (categoryList.error) toast.error("Failed to load categories.", { description: categoryList.error })
      setFoodMenus(menus.data)
      setCategories(categoryList.data)
      setLoading(false)
    })
  }, [])

  async function addFoodMenu(formData: FormData) {
    const toastId = toast.loading("Adding food menu…")
    const { data, error } = await createFoodMenu(formData)

    if (error || !data) {
      toast.error("Failed to add food menu.", { id: toastId, description: error ?? undefined })
      return false
    }

    setFoodMenus((current) => [data, ...current])
    setVisibleCount(PAGE_SIZE)
    setShowAddMenu(false)
    toast.success(`${data.name} added.`, { id: toastId })
    return true
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-muted/20 p-4 md:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Admin menu</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Food menu</h1>
            <p className="mt-2 text-muted-foreground">Manage every food tray and catering buffet offered to customers.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => { setSearch(event.target.value); setVisibleCount(PAGE_SIZE) }} placeholder="Search food menu..." aria-label="Search food menu" className="h-9 pl-9" />
            </div>
            <Button onPress={() => setShowAddMenu(true)}><PlusIcon /> Add food menu</Button>
          </div>
        </header>
        <section className="grid gap-4 sm:grid-cols-3">
          <Summary icon={<UtensilsIcon />} label="Food menus" value={`${foodMenus.length}`} detail="Active menu cards" />
          <Summary icon={<CheckCircle2Icon />} label="Available" value={`${foodMenus.length}`} detail="Ready for reservations" />
          <Summary icon={<UsersRoundIcon />} label="Guest coverage" value={foodMenus.length ? `${Math.min(...foodMenus.map((item) => item.guest_coverage))}-${Math.max(...foodMenus.map((item) => item.guest_coverage))}` : "—"} detail="Guests per package" />
        </section>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleMenus.map((item) => <FoodMenuCard key={item.id} item={item} />)}
          {!loading && filteredMenus.length === 0 && (
            <div className="rounded-xl border border-dashed bg-background p-10 text-center md:col-span-2 xl:col-span-3">
              <p className="font-medium">No food menus yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Add a menu to save it to your food_menu table.</p>
            </div>
          )}
        </div>
        {filteredMenus.length > PAGE_SIZE && (
          <div className="flex justify-center">
            <Button variant="outline" onPress={() => setVisibleCount((current) => hasMore ? current + PAGE_SIZE : PAGE_SIZE)}>
              {hasMore ? `See more (${filteredMenus.length - visibleCount} left)` : "Show less"}
            </Button>
          </div>
        )}
      </div>
      {showAddMenu && <AddMenuModal categories={categories} onClose={() => setShowAddMenu(false)} onAdd={addFoodMenu} />}
    </main>
  )
}

function FoodMenuCard({ item }: { item: FoodMenuRecord }) {
  const [imageIndex, setImageIndex] = useState(0)
  return (
    <Card className="group overflow-hidden bg-background">
      <div className="relative h-48 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url('${item.images[imageIndex]}')` }} role="img" aria-label={`${item.name}, image ${imageIndex + 1} of ${item.images.length}`}>
        <button type="button" onClick={() => setImageIndex((current) => (current - 1 + item.images.length) % item.images.length)} className="absolute top-1/2 left-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white" aria-label={`Previous ${item.name} image`}><ArrowLeftIcon className="size-4" /></button>
        <button type="button" onClick={() => setImageIndex((current) => (current + 1) % item.images.length)} className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white" aria-label={`Next ${item.name} image`}><ArrowRightIcon className="size-4" /></button>
        <Badge className="absolute top-3 left-3 border-emerald-200 bg-emerald-100 text-emerald-700"><CheckCircle2Icon /> {item.status}</Badge>
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{item.name}</CardTitle>
            <Badge variant="outline" className="mt-2">{item.category}</Badge>
          </div>
          <button type="button" className="flex size-8 items-center justify-center rounded-lg hover:bg-muted" aria-label={`More actions for ${item.name}`}><MoreHorizontalIcon className="size-4" /></button>
        </div>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex justify-between border-b pb-3">
          <span className="font-semibold text-primary">{item.price}</span>
          <span className="text-xs text-muted-foreground">{item.serves}</span>
        </div>
        <ul className="grid gap-1 text-sm">
          {item.includes.map((include) => <li key={include} className="flex gap-2"><CheckCircle2Icon className="size-3.5 text-primary" />{include}</li>)}
        </ul>
        <Button variant="outline" className="w-full"><Edit3Icon /> Edit food menu</Button>
      </CardContent>
    </Card>
  )
}

function AddMenuModal({
  categories,
  onClose,
  onAdd,
}: {
  categories: CategoryOption[]
  onClose: () => void
  onAdd: (formData: FormData) => Promise<boolean>
}) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [guestCoverage, setGuestCoverage] = useState("10")
  const [includedItems, setIncludedItems] = useState([""])
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview)), [previews])

  function addImages(files: File[]) {
    setImages((current) => [...current, ...files])
    setPreviews((current) => [...current, ...files.map((file) => URL.createObjectURL(file))])
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!categoryId) {
      toast.error("Select a category.")
      return
    }

    setSubmitting(true)
    const formData = new FormData()
    const { data } = await createClient().auth.getUser()
    formData.set("category_id", categoryId)
    formData.set("menu_name", name.trim())
    formData.set("description", description.trim())
    formData.set("starting_price", price)
    formData.set("guest_coverage", guestCoverage)
    formData.set("items", includedItems.filter(Boolean).join("\n"))
    if (data.user?.id) formData.set("created_by", data.user.id)
    images.forEach((file) => formData.append("images", file))

    const added = await onAdd(formData)
    setSubmitting(false)
    if (!added) return
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onClick={onClose}>
      <section role="dialog" aria-modal="true" aria-labelledby="add-food-menu-title" className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border bg-background p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="add-food-menu-title" className="text-2xl font-bold text-primary">Add food menu</h2>
            <p className="mt-1 text-xs text-muted-foreground">Saved to food_menu, food_menu_items, and food_menu_images</p>
          </div>
          <button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-lg hover:bg-muted" aria-label="Close add food menu form"><XIcon className="size-4" /></button>
        </div>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium">
            Category
            <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required className="h-9 rounded-lg border border-input bg-background px-3 text-sm">
              <option value="">{categories.length ? "Select category" : "No categories found"}</option>
              {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Menu name
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="For example, Seafood tray" required />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Description
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the food menu" />
          </label>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Upload images</label>
            <p className="text-xs text-muted-foreground">Upload one or more menu images. These are stored in food_menu_images.</p>
            <Input type="file" accept="image/*" multiple onChange={(event) => addImages(Array.from(event.target.files ?? []))} />
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {previews.map((preview, index) => (
                  <div key={`${images[index].name}-${images[index].lastModified}`} className="overflow-hidden rounded-md border bg-muted">
                    <div className="h-20 bg-cover bg-center" style={{ backgroundImage: `url('${preview}')` }} role="img" aria-label={`Uploaded menu image ${index + 1}`} />
                    <p className="truncate px-2 py-1 text-[10px] text-muted-foreground">{images[index].name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Starting price
              <Input type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="1500" required />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Guest coverage
              <Input type="number" min="1" step="1" value={guestCoverage} onChange={(event) => setGuestCoverage(event.target.value)} placeholder="10" required />
            </label>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Included items</label>
              <Button type="button" variant="outline" size="sm" onPress={() => setIncludedItems((current) => [...current, ""])}><PlusIcon /> Add item</Button>
            </div>
            {includedItems.map((item, index) => (
              <div key={`included-${index}`} className="flex gap-2">
                <Input value={item} onChange={(event) => setIncludedItems((current) => current.map((value, itemIndex) => itemIndex === index ? event.target.value : value))} placeholder={`Included item ${index + 1}`} required />
                {includedItems.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" aria-label={`Remove included item ${index + 1}`} onPress={() => setIncludedItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}><XIcon /></Button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" isDisabled={submitting} onPress={onClose}>Cancel</Button>
            <Button type="submit" isDisabled={submitting || !categories.length}><PlusIcon />{submitting ? "Saving…" : "Add food menu"}</Button>
          </div>
        </form>
      </section>
    </div>
  )
}

function Summary({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <Card><CardContent className="flex items-center gap-3 p-4"><span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span><div><p className="text-xl font-semibold leading-none">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label} · {detail}</p></div><BarChart3Icon className="ml-auto size-4 text-muted-foreground" /></CardContent></Card>
}
