export const CUSTOMER_CART_STORAGE_KEY = "edsel-customer-menu-cart"

export function readCustomerCart() {
  try {
    const stored = window.localStorage.getItem(CUSTOMER_CART_STORAGE_KEY)
    const items = stored ? JSON.parse(stored) : []
    return Array.isArray(items) ? items.filter((item): item is string => typeof item === "string") : []
  } catch {
    return []
  }
}

export function writeCustomerCart(items: string[]) {
  window.localStorage.setItem(CUSTOMER_CART_STORAGE_KEY, JSON.stringify(items))
}
