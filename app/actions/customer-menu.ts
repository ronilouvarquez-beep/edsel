"use server"

import { listCategories } from "@/app/actions/categories"
import { listFoodMenus } from "@/app/actions/food-menu"
import { listOccasions } from "@/app/actions/occasions"

export type CustomerMenuKind = "food" | "occasion"

export type CustomerMenuItem = {
  id: string
  kind: CustomerMenuKind
  name: string
  description: string
  price: string
  category: string
  images: string[]
  tag?: string
  includes: string[]
}

const FALLBACK_FOOD_IMAGE = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=85"
const FALLBACK_OCCASION_IMAGE = "/panorama.png"

export async function listCustomerFoodMenus() {
  const { data, error } = await listFoodMenus()
  if (error) return { data: [] as CustomerMenuItem[], error }

  return {
    data: data.map((item): CustomerMenuItem => ({
      id: `food-${item.id}`,
      kind: "food",
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      images: item.images.length ? item.images : [FALLBACK_FOOD_IMAGE],
      tag: item.serves,
      includes: item.includes,
    })),
    error: null,
  }
}

export async function listCustomerOccasions() {
  const { data, error } = await listOccasions()
  if (error) return { data: [] as CustomerMenuItem[], error }

  return {
    data: data
      .filter((item) => item.status === "Available")
      .map((item): CustomerMenuItem => ({
        id: `occasion-${item.id}`,
        kind: "occasion",
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        images: item.images.length ? item.images : [FALLBACK_OCCASION_IMAGE],
        tag: "360 view",
        includes: item.includes,
      })),
    error: null,
  }
}

export async function listCustomerCatalog() {
  const [food, occasions, categories] = await Promise.all([
    listCustomerFoodMenus(),
    listCustomerOccasions(),
    listCategories(),
  ])

  const error = food.error || occasions.error || categories.error

  return {
    data: [...food.data, ...occasions.data],
    categories: categories.data,
    error,
  }
}
