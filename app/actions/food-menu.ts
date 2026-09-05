"use server"

import { createAdminClient } from "@/lib/supabase/admin"

const IMAGE_BUCKET = "food-menu"

export type CategoryOption = {
  id: string
  name: string
}

export type FoodMenuRecord = {
  id: string
  category_id: string
  category: string
  name: string
  description: string
  price: string
  serves: string
  includes: string[]
  images: string[]
  status: "Available"
  starting_price: number
  guest_coverage: number
}

type CategoryRow = Record<string, unknown>
type ImageRow = { image_url: string; display_order: number | null }
type ItemRow = { item_name: string }

function categoryName(row: CategoryRow | CategoryRow[] | null | undefined) {
  const category = Array.isArray(row) ? row[0] : row
  if (!category) return "Uncategorized"
  return String(category.name ?? category.category_name ?? category.title ?? "Uncategorized")
}

function formatPrice(value: number) {
  return `From ₱${Number(value).toLocaleString("en-PH", { maximumFractionDigits: 2 })}`
}

function toFoodMenu(row: {
  id: string
  category_id: string
  menu_name: string
  description: string | null
  starting_price: number | string
  guest_coverage: number
  categories?: CategoryRow | CategoryRow[] | null
  food_menu_images?: ImageRow[] | null
  food_menu_items?: ItemRow[] | null
}): FoodMenuRecord {
  const startingPrice = Number(row.starting_price ?? 0)
  const images = [...(row.food_menu_images ?? [])]
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((image) => image.image_url)
    .filter(Boolean)

  return {
    id: row.id,
    category_id: row.category_id,
    category: categoryName(row.categories),
    name: row.menu_name,
    description: row.description ?? "",
    price: formatPrice(startingPrice),
    serves: `${row.guest_coverage} guest${row.guest_coverage === 1 ? "" : "s"}`,
    includes: (row.food_menu_items ?? []).map((item) => item.item_name).filter(Boolean),
    images: images.length ? images : ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=85"],
    status: "Available",
    starting_price: startingPrice,
    guest_coverage: row.guest_coverage,
  }
}

export async function listCategories() {
  const { data, error } = await createAdminClient()
    .from("categories")
    .select("*")

  if (error) {
    return { data: [] as CategoryOption[], error: error.message }
  }

  const categories = (data ?? [])
    .map((row) => ({
      id: String(row.id ?? ""),
      name: categoryName(row),
    }))
    .filter((row) => row.id)
    .sort((a, b) => a.name.localeCompare(b.name))

  return { data: categories, error: null }
}

const FOOD_MENU_SELECT = `
  id,
  category_id,
  menu_name,
  description,
  starting_price,
  guest_coverage,
  created_at,
  food_menu_images ( image_url, display_order ),
  food_menu_items ( item_name )
`

export async function listFoodMenus() {
  const admin = createAdminClient()
  const withCategories = await admin
    .from("food_menu")
    .select(`${FOOD_MENU_SELECT}, categories (*)`)
    .order("created_at", { ascending: false })

  const result = withCategories.error
    ? await admin.from("food_menu").select(FOOD_MENU_SELECT).order("created_at", { ascending: false })
    : withCategories

  if (result.error) {
    return { data: [] as FoodMenuRecord[], error: result.error.message }
  }

  const categoryMap = new Map<string, string>()
  if (withCategories.error) {
    const { data: categories } = await admin.from("categories").select("*")
    for (const category of categories ?? []) {
      categoryMap.set(String(category.id), categoryName(category))
    }
  }

  return {
    data: (result.data ?? []).map((row) => {
      const menu = row as Parameters<typeof toFoodMenu>[0]
      return toFoodMenu({
        ...menu,
        categories: menu.categories ?? (menu.category_id ? { name: categoryMap.get(menu.category_id) } : null),
      })
    }),
    error: null,
  }
}

async function ensureImageBucket(admin: ReturnType<typeof createAdminClient>) {
  const { data } = await admin.storage.getBucket(IMAGE_BUCKET)
  if (data) return

  const { error } = await admin.storage.createBucket(IMAGE_BUCKET, {
    public: true,
  })

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(error.message)
  }
}

async function uploadMenuImages(
  admin: ReturnType<typeof createAdminClient>,
  menuId: string,
  files: File[],
) {
  if (!files.length) return []

  await ensureImageBucket(admin)

  const uploaded: { food_menu_id: string; image_url: string; display_order: number }[] = []

  for (const [index, file] of files.entries()) {
    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
    const path = `${menuId}/${index}-${crypto.randomUUID()}.${extension}`
    const body = Buffer.from(await file.arrayBuffer())
    const { error } = await admin.storage.from(IMAGE_BUCKET).upload(path, body, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    })

    if (error) {
      throw new Error(error.message)
    }

    const { data } = admin.storage.from(IMAGE_BUCKET).getPublicUrl(path)
    uploaded.push({
      food_menu_id: menuId,
      image_url: data.publicUrl,
      display_order: index,
    })
  }

  return uploaded
}

export async function createFoodMenu(formData: FormData) {
  const categoryId = String(formData.get("category_id") ?? "").trim()
  const menuName = String(formData.get("menu_name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const startingPrice = Number(formData.get("starting_price"))
  const guestCoverage = Number.parseInt(String(formData.get("guest_coverage") ?? ""), 10)
  const createdBy = String(formData.get("created_by") ?? "").trim() || null
  const items = String(formData.get("items") ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
  const images = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0)

  if (!categoryId) return { data: null, error: "Select a category." }
  if (!menuName) return { data: null, error: "Menu name is required." }
  if (!Number.isFinite(startingPrice) || startingPrice < 0) {
    return { data: null, error: "Starting price must be 0 or greater." }
  }
  if (!Number.isInteger(guestCoverage) || guestCoverage < 1) {
    return { data: null, error: "Guest coverage must be at least 1." }
  }
  if (!items.length) return { data: null, error: "Add at least one included item." }

  const admin = createAdminClient()
  const { data: menu, error: menuError } = await admin
    .from("food_menu")
    .insert({
      category_id: categoryId,
      menu_name: menuName,
      description: description || null,
      starting_price: startingPrice,
      guest_coverage: guestCoverage,
      created_by: createdBy,
    })
    .select("id, category_id, menu_name, description, starting_price, guest_coverage")
    .single()

  if (menuError || !menu) {
    return { data: null, error: menuError?.message ?? "Failed to add the food menu." }
  }

  const { error: itemsError } = await admin.from("food_menu_items").insert(
    items.map((item_name) => ({ food_menu_id: menu.id, item_name })),
  )

  if (itemsError) {
    await admin.from("food_menu").delete().eq("id", menu.id)
    return { data: null, error: itemsError.message }
  }

  try {
    const uploaded = await uploadMenuImages(admin, menu.id, images)
    if (uploaded.length) {
      const { error: imagesError } = await admin.from("food_menu_images").insert(uploaded)
      if (imagesError) throw new Error(imagesError.message)
    }
  } catch (error) {
    await admin.from("food_menu").delete().eq("id", menu.id)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to upload menu images.",
    }
  }

  const { data: created, error: loadError } = await admin
    .from("food_menu")
    .select(`
      id,
      category_id,
      menu_name,
      description,
      starting_price,
      guest_coverage,
      categories (*),
      food_menu_images ( image_url, display_order ),
      food_menu_items ( item_name )
    `)
    .eq("id", menu.id)
    .single()

  if (loadError || !created) {
    return { data: null, error: loadError?.message ?? "Menu was added, but it could not be loaded." }
  }

  return { data: toFoodMenu(created as Parameters<typeof toFoodMenu>[0]), error: null }
}
