"use server"

import { createAdminClient } from "@/lib/supabase/admin"

const USER_COLUMNS = "id, first_name, middle_name, last_name, address, email, phone_number, role"

export type UserRecord = {
  first_name: string
  middle_name: string | null
  last_name: string
  address: string
  email: string
  phone_number: string
  role: "admin" | "staff" | "customer"
}

function profileFields(record: UserRecord) {
  return {
    first_name: record.first_name,
    middle_name: record.middle_name,
    last_name: record.last_name,
    address: record.address,
    email: record.email,
    phone_number: record.phone_number,
    role: record.role,
  }
}

export async function listUsers() {
  const { data, error } = await createAdminClient()
    .from("users")
    .select(USER_COLUMNS)
    .order("created_at", { ascending: false })

  return { data, error: error?.message ?? null }
}

export async function createUser(record: UserRecord & { password: string }) {
  const admin = createAdminClient()
  const fields = profileFields(record)

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: record.email,
    password: record.password,
    email_confirm: true,
    user_metadata: {
      first_name: record.first_name,
      middle_name: record.middle_name,
      last_name: record.last_name,
      full_name: [record.first_name, record.middle_name, record.last_name].filter(Boolean).join(" "),
      role: record.role,
    },
  })

  if (authError || !authData.user) {
    return { data: null, error: authError?.message ?? "Failed to create the login account." }
  }

  const { data, error } = await admin
    .from("users")
    .update(fields)
    .eq("id", authData.user.id)
    .select(USER_COLUMNS)
    .maybeSingle()

  if (error) {
    await admin.auth.admin.deleteUser(authData.user.id)
    return { data: null, error: error.message }
  }

  if (data) {
    return { data, error: null }
  }

  const inserted = await admin
    .from("users")
    .insert({ id: authData.user.id, ...fields })
    .select(USER_COLUMNS)
    .single()

  if (inserted.error) {
    await admin.auth.admin.deleteUser(authData.user.id)
    return { data: null, error: inserted.error.message }
  }

  return { data: inserted.data, error: null }
}

export async function updateUser(id: string, record: UserRecord) {
  const admin = createAdminClient()
  const fields = profileFields(record)

  const { error: authError } = await admin.auth.admin.updateUserById(id, {
    email: record.email,
    user_metadata: {
      first_name: record.first_name,
      last_name: record.last_name,
      role: record.role,
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  const { error } = await admin
    .from("users")
    .update(fields)
    .eq("id", id)

  return { error: error?.message ?? null }
}

export async function deleteUser(id: string) {
  const { error } = await createAdminClient().auth.admin.deleteUser(id)
  return { error: error?.message ?? null }
}
