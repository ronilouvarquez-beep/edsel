"use server"

import { createAdminClient } from "@/lib/supabase/admin"

const IMAGE_BUCKET = "occasions"

export type OccasionRecord = {
  id: string
  category_id: string
  category: string
  name: string
  description: string
  price: string
  priceValue: number
  images: string[]
  includes: string[]
  status: "Available" | "Not available"
  clothesColors: string[]
}

type CategoryEmbed = {
  id?: string
  category_name?: string
  name?: string
} | null

type OccasionRow = {
  id: string
  category_id: string
  decoration_name: string
  description: string | null
  images: unknown
  price: number | string
  included_items: unknown
  status: string
  clothes_color: string | null
  categories?: CategoryEmbed | CategoryEmbed[]
}

function asStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean)
      }
    } catch {
      return value.split(",").map((item) => item.trim()).filter(Boolean)
    }
  }
  return []
}

function categoryLabel(row: CategoryEmbed | CategoryEmbed[] | undefined) {
  const category = Array.isArray(row) ? row[0] : row
  return String(category?.category_name ?? category?.name ?? "Uncategorized")
}

function formatPrice(value: number) {
  return `From ₱${Number(value).toLocaleString("en-PH", { maximumFractionDigits: 2 })}`
}

function toStatus(value: string) {
  return value === "not available" ? "Not available" : "Available"
}

function toOccasion(row: OccasionRow): OccasionRecord {
  const priceValue = Number(row.price ?? 0)
  return {
    id: row.id,
    category_id: row.category_id,
    category: categoryLabel(row.categories),
    name: row.decoration_name,
    description: row.description ?? "",
    price: formatPrice(priceValue),
    priceValue,
    images: asStringArray(row.images),
    includes: asStringArray(row.included_items),
    status: toStatus(row.status),
    clothesColors: asStringArray(row.clothes_color),
  }
}

const OCCASION_SELECT = `
  id,
  category_id,
  decoration_name,
  description,
  images,
  price,
  included_items,
  status,
  clothes_color,
  created_at
`

export async function listOccasions() {
  const admin = createAdminClient()
  const withCategories = await admin
    .from("occasions")
    .select(`${OCCASION_SELECT}, categories ( id, category_name )`)
    .order("created_at", { ascending: false })

  const result = withCategories.error
    ? await admin.from("occasions").select(OCCASION_SELECT).order("created_at", { ascending: false })
    : withCategories

  if (result.error) {
    return { data: [] as OccasionRecord[], error: result.error.message }
  }

  return {
    data: (result.data ?? []).map((row) => toOccasion(row as OccasionRow)),
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

async function uploadOccasionImages(
  admin: ReturnType<typeof createAdminClient>,
  occasionId: string,
  files: File[],
) {
  if (!files.length) return []

  await ensureImageBucket(admin)
  const urls: string[] = []

  for (const [index, file] of files.entries()) {
    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
    const path = `${occasionId}/${index}-${crypto.randomUUID()}.${extension}`
    const body = Buffer.from(await file.arrayBuffer())
    const { error } = await admin.storage.from(IMAGE_BUCKET).upload(path, body, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    })

    if (error) throw new Error(error.message)

    const { data } = admin.storage.from(IMAGE_BUCKET).getPublicUrl(path)
    urls.push(data.publicUrl)
  }

  return urls
}

export async function createOccasion(formData: FormData) {
  const categoryId = String(formData.get("category_id") ?? "").trim()
  const decorationName = String(formData.get("decoration_name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const price = Number(formData.get("price"))
  const statusValue = String(formData.get("status") ?? "available").trim().toLowerCase()
  const status = statusValue === "not available" ? "not available" : "available"
  const clothesColor = String(formData.get("clothes_color") ?? "")
    .split(",")
    .map((color) => color.trim())
    .filter(Boolean)
    .join(",") || null
  const createdBy = String(formData.get("created_by") ?? "").trim() || null
  const includedItems = String(formData.get("included_items") ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0)

  if (!categoryId) return { data: null, error: "Select a category." }
  if (!decorationName) return { data: null, error: "Decoration name is required." }
  if (!Number.isFinite(price) || price < 0) {
    return { data: null, error: "Price must be 0 or greater." }
  }
  if (!includedItems.length) return { data: null, error: "Add at least one included item." }

  const admin = createAdminClient()
  const { data: occasion, error: insertError } = await admin
    .from("occasions")
    .insert({
      category_id: categoryId,
      decoration_name: decorationName,
      description: description || null,
      price,
      included_items: includedItems,
      status,
      clothes_color: clothesColor,
      created_by: createdBy,
      images: [],
    })
    .select(OCCASION_SELECT)
    .single()

  if (insertError || !occasion) {
    return { data: null, error: insertError?.message ?? "Failed to add the decoration." }
  }

  try {
    const images = await uploadOccasionImages(admin, occasion.id, files)
    if (images.length) {
      const { error: imageError } = await admin
        .from("occasions")
        .update({ images })
        .eq("id", occasion.id)
      if (imageError) throw new Error(imageError.message)
    }
  } catch (error) {
    await admin.from("occasions").delete().eq("id", occasion.id)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to upload decoration images.",
    }
  }

  const loaded = await admin
    .from("occasions")
    .select(`${OCCASION_SELECT}, categories ( id, category_name )`)
    .eq("id", occasion.id)
    .single()

  if (loaded.error || !loaded.data) {
    return { data: toOccasion(occasion as OccasionRow), error: null }
  }

  return { data: toOccasion(loaded.data as OccasionRow), error: null }
}
