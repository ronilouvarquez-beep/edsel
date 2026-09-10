"use server"

import { listCategories } from "@/app/actions/categories"
import { listFoodMenus } from "@/app/actions/food-menu"
import { listOccasions } from "@/app/actions/occasions"
import { sendMessage } from "@/app/actions/messages"
import { createAdminClient } from "@/lib/supabase/admin"

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

function normalizeSemaphoreNumber(value: string) {
  const digits = value.replace(/\D/g, "")
  if (digits.startsWith("09") && digits.length === 11) return `63${digits.slice(1)}`
  if (digits.startsWith("63")) return digits
  return digits
}

async function sendSemaphoreSms(number: string, message: string) {
  const apiKey = process.env.SEMAPHORE_API_KEY
  const senderName = process.env.SEMAPHORE_SENDER_NAME
  if (!apiKey || !senderName || !number) return

  const body = new URLSearchParams({
    apikey: apiKey,
    number: normalizeSemaphoreNumber(number),
    message,
    sendername: senderName,
  })

  try {
    const response = await fetch("https://api.semaphore.co/api/v4/messages", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })
    if (!response.ok) console.error("Semaphore SMS failed", response.status)
  } catch (error) {
    console.error("Semaphore SMS request failed", error)
  }
}

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

export type CreateReservationInput = {
  customerId: string
  customerEmail: string | null
  eventType: string
  eventDate: string
  mobileNumber: string
  location: string
  eventDetails: Record<string, string>
  cart: string[]
  quantities: Record<string, number>
  packages: Array<Pick<CustomerMenuItem, "id" | "kind" | "name" | "price">>
  totalAmount: number
  paymentMethod: "Cash" | "GCash" | "Maya"
  paymentReference: string
  paymentAccountName: string
  paymentAccountNumber: string
  paymentReceipt: File | null
}

export async function createReservation(input: CreateReservationInput) {
  const admin = createAdminClient()
  const { data: idProfile } = await admin.from("users").select("id, first_name, last_name, email").eq("id", input.customerId).maybeSingle()
  const { data: emailProfile } = idProfile || !input.customerEmail
    ? { data: null }
    : await admin.from("users").select("id").eq("email", input.customerEmail).maybeSingle()
  const databaseCustomerId = idProfile?.id ?? emailProfile?.id

  if (!databaseCustomerId) {
    return { data: null, error: "Your account profile was not found. Please contact an administrator before creating a reservation." }
  }

  const selectedPackages = input.packages.filter((item) => input.cart.includes(item.id))
  const cartItems = selectedPackages.map((item) => ({
    id: item.id,
    kind: item.kind,
    name: item.name,
    quantity: input.quantities[item.id] ?? 1,
    price: Number(item.price.replace(/[^0-9.]/g, "")) || 0,
  }))

  const { data: cart, error: cartError } = await admin
    .from("cart")
    .upsert({ user_id: databaseCustomerId }, { onConflict: "user_id" })
    .select("id")
    .single()

  if (cartError || !cart) return { data: null, error: cartError?.message ?? "Unable to create cart." }

  const foodItems = selectedPackages.filter((item) => item.kind === "food")
  const { error: clearItemsError } = await admin.from("cart_items").delete().eq("cart_id", cart.id)
  if (clearItemsError) return { data: null, error: clearItemsError.message }

  if (foodItems.length) {
    const { error: itemError } = await admin.from("cart_items").insert(foodItems.map((item) => ({
      cart_id: cart.id,
      food_menu_id: item.id.replace(/^food-/, ""),
      quantity: input.quantities[item.id] ?? 1,
      price: Number(item.price.replace(/[^0-9.]/g, "")) || 0,
    })))
    if (itemError) return { data: null, error: itemError.message }
  }

  let paymentReceiptUrl: string | null = null
  if (input.paymentReceipt) {
    const bucketName = "reservation-receipts"
    const { data: bucket } = await admin.storage.getBucket(bucketName)
    if (!bucket) {
      const { error: bucketError } = await admin.storage.createBucket(bucketName, { public: true })
      if (bucketError && !bucketError.message.toLowerCase().includes("already exists")) {
        return { data: null, error: bucketError.message }
      }
    }

    const extension = input.paymentReceipt.name.split(".").pop()?.toLowerCase() || "jpg"
    const receiptPath = `${input.customerId}/${crypto.randomUUID()}.${extension}`
    const { error: uploadError } = await admin.storage
      .from(bucketName)
      .upload(receiptPath, Buffer.from(await input.paymentReceipt.arrayBuffer()), {
        contentType: input.paymentReceipt.type || "image/jpeg",
        upsert: false,
      })
    if (uploadError) return { data: null, error: uploadError.message }
    paymentReceiptUrl = admin.storage.from(bucketName).getPublicUrl(receiptPath).data.publicUrl
  }

  const { data: reservation, error: reservationError } = await admin
    .from("reservation")
    .insert({
      customer_id: databaseCustomerId,
      cart_id: cart.id,
      event_type: input.eventType,
      event_date: input.eventDate || null,
      mobile_number: input.mobileNumber,
      location: input.location || null,
      event_details: input.eventDetails,
      cart_items: cartItems,
      total_amount: input.totalAmount,
      payment_method: input.paymentMethod,
      payment_reference: input.paymentReference || null,
      payment_account_name: input.paymentAccountName || null,
      payment_account_number: input.paymentAccountNumber || null,
      payment_receipt_url: paymentReceiptUrl,
    })
    .select("id")
    .single()

  if (!reservationError && reservation) {
    const { data: sender } = await admin
      .from("users")
      .select("id")
      .in("role", ["admin", "staff"])
      .limit(1)
      .maybeSingle()

    if (sender) {
      const itemSummary = cartItems.map((item) => `${item.name} x${item.quantity}`).join(", ") || "your selected menu items"
      const eventDate = input.eventDate || "To be scheduled"
      const reservationDetails = [
        `Reservation received: ${input.eventType}`,
        `Event date: ${eventDate}`,
        `Items: ${itemSummary}`,
        `Total: ${input.totalAmount.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}`,
        `Payment method: ${input.paymentMethod}`,
        `Reservation ID: ${reservation.id}`,
      ].join("\n")
      await sendMessage(sender.id, databaseCustomerId, reservationDetails)
      await sendMessage(sender.id, databaseCustomerId, "Please reply to this message to confirm that the reservation details are correct.")
    }

    const customerName = [idProfile?.first_name, idProfile?.last_name].filter(Boolean).join(" ").trim() || idProfile?.email || "Customer"
    const smsDetails = [
      `Hello, ${customerName},`,
      "Your reservation request at Edsel's Catering Services has been received and is currently pending staff confirmation.",
      "",
      `Date: ${input.eventDate || "To be scheduled"}`,
      `Items: ${cartItems.map((item) => `${item.name} x${item.quantity}`).join(", ") || "Selected menu items"}`,
      `Total: ${input.totalAmount.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}`,
      `Event: ${input.eventType}`,
      `Location: ${input.location || "To be confirmed"}`,
      "",
      "You will receive another text once your reservation has been confirmed.",
      "",
      "-Edsel's Catering Services",
    ].join("\n")
    await sendSemaphoreSms(input.mobileNumber, smsDetails)
  }

  return { data: reservation, error: reservationError?.message ?? null }
}

export type CustomerReservation = {
  id: string
  order: string
  event: string
  date: string
  mobileNumber: string
  status: "Pending" | "Confirmed" | "Preparing" | "Completed" | "Declined"
}

export async function listCustomerReservations(customerId: string, customerEmail: string | null) {
  const admin = createAdminClient()
  const { data: idProfile } = await admin.from("users").select("id").eq("id", customerId).maybeSingle()
  const { data: emailProfile } = idProfile || !customerEmail
    ? { data: null }
    : await admin.from("users").select("id").eq("email", customerEmail).maybeSingle()
  const databaseCustomerId = idProfile?.id ?? emailProfile?.id

  if (!databaseCustomerId) return { data: [] as CustomerReservation[], error: "Your account profile was not found." }

  const { data, error } = await admin
    .from("reservation")
    .select("id, event_type, event_date, mobile_number, cart_items, status, created_at")
    .eq("customer_id", databaseCustomerId)
    .order("created_at", { ascending: false })

  if (error) return { data: [] as CustomerReservation[], error: error.message }

  return {
    data: (data ?? []).map((reservation) => {
      const items = Array.isArray(reservation.cart_items) ? reservation.cart_items : []
      const order = items.map((item) => typeof item === "object" && item && "name" in item ? String(item.name) : "Reservation item").join(", ") || "Reservation request"
      return {
        id: reservation.id,
        order,
        event: reservation.event_type,
        date: reservation.event_date
          ? new Intl.DateTimeFormat("en-PH", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(`${reservation.event_date}T00:00:00`))
          : "To be scheduled",
        mobileNumber: reservation.mobile_number,
        status: reservation.status as CustomerReservation["status"],
      }
    }),
    error: null,
  }
}

export type CustomerOrderTracker = {
  id: string
  order: string
  date: string
  guests: number
  status: "Pending" | "Confirmed" | "Preparing" | "Completed"
  step: "Confirm" | "Preparing" | "Ready" | "Completed" | null
}

export async function listCustomerOrderTrackers(customerId: string, customerEmail: string | null) {
  const admin = createAdminClient()
  const { data: idProfile } = await admin.from("users").select("id").eq("id", customerId).maybeSingle()
  const { data: emailProfile } = idProfile || !customerEmail
    ? { data: null }
    : await admin.from("users").select("id").eq("email", customerEmail).maybeSingle()
  const databaseCustomerId = idProfile?.id ?? emailProfile?.id
  if (!databaseCustomerId) return { data: [] as CustomerOrderTracker[], error: "Your account profile was not found." }

  const { data, error } = await admin.from("reservation").select("id, event_date, event_details, cart_items, status, created_at").eq("customer_id", databaseCustomerId).order("created_at", { ascending: false })
  if (error) return { data: [] as CustomerOrderTracker[], error: error.message }

  return {
    data: (data ?? []).map((reservation) => {
      const details = reservation.event_details && typeof reservation.event_details === "object" ? reservation.event_details as Record<string, unknown> : {}
      const items = Array.isArray(reservation.cart_items) ? reservation.cart_items : []
      const order = items.map((item) => typeof item === "object" && item && "name" in item ? String(item.name) : "Reservation item").join(", ") || "Reservation request"
      const guestValue = Number(details.guests ?? details.guestCount ?? 0)
      const status = reservation.status === "Declined" ? "Pending" : reservation.status as CustomerOrderTracker["status"]
      const step: CustomerOrderTracker["step"] = status === "Pending" ? null : status === "Confirmed" ? "Confirm" : status
      return { id: reservation.id, order, date: reservation.event_date ? new Intl.DateTimeFormat("en-PH", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(`${reservation.event_date}T00:00:00`)) : "To be scheduled", guests: Number.isFinite(guestValue) ? guestValue : 0, status, step }
    }),
    error: null,
  }
}

export type StaffReservation = {
  id: string
  customer: string
  email: string
  order: string
  date: string
  mobileNumber: string
  status: "Pending" | "Confirmed" | "Preparing" | "Completed" | "Declined"
}

export async function listStaffReservations(staffId: string, staffEmail: string | null) {
  const admin = createAdminClient()
  const { data: staffProfile } = await admin.from("users").select("id, role").or(`id.eq.${staffId}${staffEmail ? `,email.eq.${staffEmail}` : ""}`).maybeSingle()

  if (!staffProfile || !["admin", "staff"].includes(staffProfile.role)) {
    return { data: [] as StaffReservation[], error: "You do not have permission to view all reservations." }
  }

  const { data: reservations, error } = await admin
    .from("reservation")
    .select("id, customer_id, event_type, event_date, mobile_number, cart_items, status, created_at")
    .order("created_at", { ascending: false })

  if (error) return { data: [] as StaffReservation[], error: error.message }

  const customerIds = Array.from(new Set((reservations ?? []).map((reservation) => reservation.customer_id)))
  const { data: customers } = customerIds.length
    ? await admin.from("users").select("id, first_name, last_name, email").in("id", customerIds)
    : { data: [] }
  const customerDetails = new Map((customers ?? []).map((customer) => [customer.id, {
    name: `${customer.first_name} ${customer.last_name}`.trim(),
    email: customer.email ?? "Email unavailable",
  }]))

  return {
    data: (reservations ?? []).map((reservation) => {
      const items = Array.isArray(reservation.cart_items) ? reservation.cart_items : []
      const order = items.map((item) => typeof item === "object" && item && "name" in item ? String(item.name) : "Reservation item").join(", ") || "Reservation request"
      return {
        id: reservation.id,
        customer: customerDetails.get(reservation.customer_id)?.name ?? "Unknown customer",
        email: customerDetails.get(reservation.customer_id)?.email ?? "Email unavailable",
        order,
        date: reservation.event_date
          ? new Intl.DateTimeFormat("en-PH", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(`${reservation.event_date}T00:00:00`))
          : "To be scheduled",
        mobileNumber: reservation.mobile_number,
        status: reservation.status as StaffReservation["status"],
      }
    }),
    error: null,
  }
}

export async function updateStaffReservationStatus(
  staffId: string,
  staffEmail: string | null,
  reservationId: string,
  status: StaffReservation["status"],
) {
  const admin = createAdminClient()
  const { data: staffProfile } = await admin
    .from("users")
    .select("id, role")
    .or(`id.eq.${staffId}${staffEmail ? `,email.eq.${staffEmail}` : ""}`)
    .maybeSingle()

  if (!staffProfile || !["admin", "staff"].includes(staffProfile.role)) {
    return { error: "You do not have permission to update reservations." }
  }

  const { error } = await admin
    .from("reservation")
    .update({ status })
    .eq("id", reservationId)

  if (!error && status === "Confirmed") {
    const { data: reservation } = await admin
      .from("reservation")
      .select("mobile_number, customer_id")
      .eq("id", reservationId)
      .maybeSingle()
    if (reservation?.mobile_number) {
      const { data: customer } = await admin
        .from("users")
        .select("first_name, last_name, email")
        .eq("id", reservation.customer_id)
        .maybeSingle()
      const customerName = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ").trim() || customer?.email || "Customer"
      await sendSemaphoreSms(
        reservation.mobile_number,
        `Hello, ${customerName}, your reservation at Edsel's Catering Services has been confirmed. Thank you!\n\n-Edsel's Catering Services`,
      )
    }
  }

  return { error: error?.message ?? null }
}

export type StaffScheduleReservation = {
  id: string
  date: string
  title: string
  time: string
  location: string
  type: string
  notes: string
}

function getPaymentStatus(status: string) {
  if (status === "Declined") return "Declined"
  if (status === "Pending") return "Pending"
  return "Paid"
}

export async function listStaffScheduleReservations(staffId: string, staffEmail: string | null) {
  const admin = createAdminClient()
  const { data: staffProfile } = await admin.from("users").select("id, role").or(`id.eq.${staffId}${staffEmail ? `,email.eq.${staffEmail}` : ""}`).maybeSingle()

  if (!staffProfile || !["admin", "staff"].includes(staffProfile.role)) {
    return { data: [] as StaffScheduleReservation[], error: "You do not have permission to view the schedule." }
  }

  const { data, error } = await admin
    .from("reservation")
    .select("id, event_type, event_date, location, event_details, cart_items, status")
    .not("event_date", "is", null)
    .order("event_date", { ascending: true })

  if (error) return { data: [] as StaffScheduleReservation[], error: error.message }

  return {
    data: (data ?? []).map((reservation) => {
      const details = reservation.event_details && typeof reservation.event_details === "object" ? reservation.event_details as Record<string, unknown> : {}
      const items = Array.isArray(reservation.cart_items) ? reservation.cart_items : []
      const order = items.map((item) => typeof item === "object" && item && "name" in item ? String(item.name) : "Reservation item").join(", ") || "Reservation request"
      const timeValue = details.eventStarted ?? details.foodPickupTime ?? details.dessertDeliveryTime
      const time = typeof timeValue === "string" && timeValue ? timeValue : "Time to be confirmed"
      return {
        id: reservation.id,
        date: String(reservation.event_date),
        title: `${reservation.event_type}: ${order}`,
        time,
        location: reservation.location || "Location to be confirmed",
        type: reservation.status,
        notes: `Payment status: ${getPaymentStatus(reservation.status)}`,
      }
    }),
    error: null,
  }
}

export type StaffTaskTracker = {
  id: string
  customer: string
  email: string
  order: string
  date: string
  guests: number
  status: "Pending" | "Confirmed" | "Preparing" | "Completed"
  step: "Confirm" | "Preparing" | "Ready" | "Completed" | null
}

export async function listStaffTaskTrackers(staffId: string, staffEmail: string | null) {
  const admin = createAdminClient()
  const { data: staffProfile } = await admin.from("users").select("id, role").or(`id.eq.${staffId}${staffEmail ? `,email.eq.${staffEmail}` : ""}`).maybeSingle()
  if (!staffProfile || !["admin", "staff"].includes(staffProfile.role)) return { data: [] as StaffTaskTracker[], error: "You do not have permission to view task trackers." }
  const { data: reservations, error } = await admin.from("reservation").select("id, customer_id, event_date, event_details, cart_items, status, created_at").order("created_at", { ascending: false })
  if (error) return { data: [] as StaffTaskTracker[], error: error.message }
  const customerIds = Array.from(new Set((reservations ?? []).map((reservation) => reservation.customer_id)))
  const { data: customers } = customerIds.length ? await admin.from("users").select("id, first_name, last_name, email").in("id", customerIds) : { data: [] }
  const customerProfiles = new Map((customers ?? []).map((customer) => [customer.id, { name: `${customer.first_name} ${customer.last_name}`.trim(), email: customer.email }]))
  return {
    data: (reservations ?? []).map((reservation) => {
      const details = reservation.event_details && typeof reservation.event_details === "object" ? reservation.event_details as Record<string, unknown> : {}
      const items = Array.isArray(reservation.cart_items) ? reservation.cart_items : []
      const order = items.map((item) => typeof item === "object" && item && "name" in item ? String(item.name) : "Reservation item").join(", ") || "Reservation request"
      const guestValue = Number(details.guests ?? details.guestCount ?? 0)
      const status = reservation.status === "Declined" ? "Pending" : reservation.status as StaffTaskTracker["status"]
      const step: StaffTaskTracker["step"] = status === "Pending" ? null : status === "Confirmed" ? "Confirm" : status
      const customer = customerProfiles.get(reservation.customer_id)
      return { id: reservation.id, customer: customer?.name ?? "Unknown customer", email: customer?.email ?? "Email unavailable", order, date: reservation.event_date ? new Intl.DateTimeFormat("en-PH", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(`${reservation.event_date}T00:00:00`)) : "To be scheduled", guests: Number.isFinite(guestValue) ? guestValue : 0, status, step }
    }),
    error: null,
  }
}
