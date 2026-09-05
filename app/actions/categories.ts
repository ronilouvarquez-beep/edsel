"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export type CategoryRecord = {
  id: string
  name: string
  description: string
  color: string
  colors: string[]
  category_type: string | null
  created_at: string
}

function parseCategoryColors(value: string | null | undefined) {
  const raw = value?.trim()
  if (!raw) return []

  if (raw.startsWith("[")) {
    try {
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean)
      }
    } catch {
      return []
    }
  }

  return raw.split(",").map((item) => item.trim()).filter(Boolean)
}

type CategoryRow = {
  id: string
  category_name: string
  description: string | null
  color: string | null
  category_type: string | null
  created_at: string
}

function serializeCategoryColors(colors: string[]) {
  return colors.map((color) => color.trim()).filter(Boolean).join(",")
}

function toCategory(row: CategoryRow): CategoryRecord {
  const colors = parseCategoryColors(row.color)
  return {
    id: row.id,
    name: row.category_name,
    description: row.description ?? "",
    color: colors[0] || row.color || "#000000",
    colors,
    category_type: row.category_type,
    created_at: row.created_at,
  }
}

export async function listCategories() {
  const { data, error } = await createAdminClient()
    .from("categories")
    .select("id, category_name, description, color, category_type, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    return { data: [] as CategoryRecord[], error: error.message }
  }

  return { data: (data ?? []).map((row) => toCategory(row as CategoryRow)), error: null }
}

export async function createCategory(input: {
  category_name: string
  description?: string
  color?: string
  colors?: string[]
  category_type?: string | null
}) {
  const categoryName = input.category_name.trim()
  const description = input.description?.trim() || null
  const colors = (input.colors ?? (input.color ? [input.color] : []))
    .map((color) => color.trim())
    .filter(Boolean)
  const color = serializeCategoryColors(colors) || ""
  const categoryType = input.category_type?.trim() || null

  if (!categoryName) {
    return { data: null, error: "Category name is required." }
  }

  const { data, error } = await createAdminClient()
    .from("categories")
    .insert({
      category_name: categoryName,
      description,
      ...(color ? { color } : {}),
      category_type: categoryType,
    })
    .select("id, category_name, description, color, category_type, created_at")
    .single()

  if (error || !data) {
    if (error?.message.toLowerCase().includes("duplicate") || error?.code === "23505") {
      return { data: null, error: "That category name already exists." }
    }
    return { data: null, error: error?.message ?? "Failed to add the category." }
  }

  return { data: toCategory(data as CategoryRow), error: null }
}
