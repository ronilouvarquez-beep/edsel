"use server"

import { createAdminClient } from "@/lib/supabase/admin"

const USER_COLUMNS = "id, first_name, middle_name, last_name, address, street, province, municipality, barangay, email, phone_number, role, profile_image"
const PROFILE_IMAGE_BUCKET = "profile-images"
const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024
const PROFILE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

export type UserRecord = {
  first_name: string
  middle_name: string | null
  last_name: string
  address: string
  street: string
  province: string
  municipality: string
  barangay: string
  email: string
  phone_number: string
  role: "admin" | "staff" | "customer"
}

type UserInput = UserRecord & {
  password?: string
  profileImage?: File | null
}

function profileFields(record: UserRecord) {
  return {
    first_name: record.first_name,
    middle_name: record.middle_name,
    last_name: record.last_name,
    address: record.address,
    street: record.street,
    province: record.province,
    municipality: record.municipality,
    barangay: record.barangay,
    email: record.email,
    phone_number: record.phone_number,
    role: record.role,
  }
}

async function ensureProfileImageBucket(admin: ReturnType<typeof createAdminClient>) {
  const { data } = await admin.storage.getBucket(PROFILE_IMAGE_BUCKET)
  if (data) return

  const { error } = await admin.storage.createBucket(PROFILE_IMAGE_BUCKET, { public: true })
  if (error && !error.message.toLowerCase().includes("already exists")) throw new Error(error.message)
}

async function uploadProfileImage(admin: ReturnType<typeof createAdminClient>, userId: string, file: File) {
  if (!PROFILE_IMAGE_TYPES.has(file.type)) throw new Error("Profile image must be JPG, PNG, or WebP.")
  if (file.size > MAX_PROFILE_IMAGE_SIZE) throw new Error("Profile image must be 5 MB or smaller.")

  await ensureProfileImageBucket(admin)
  const extension = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1]
  const path = `${userId}/${crypto.randomUUID()}.${extension}`
  const { error } = await admin.storage.from(PROFILE_IMAGE_BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    upsert: false,
  })

  if (error) throw new Error(error.message)
  return admin.storage.from(PROFILE_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl
}

export async function listUsers() {
  const { data, error } = await createAdminClient()
    .from("users")
    .select(USER_COLUMNS)
    .order("created_at", { ascending: false })

  return { data, error: error?.message ?? null }
}

export async function createUser(record: UserInput & { password: string }) {
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

  let profileImage: string | null = null
  try {
    if (record.profileImage) profileImage = await uploadProfileImage(admin, authData.user.id, record.profileImage)
  } catch (error) {
    await admin.auth.admin.deleteUser(authData.user.id)
    return { data: null, error: error instanceof Error ? error.message : "Failed to upload the profile image." }
  }

  const profile = { ...fields, profile_image: profileImage }
  const { data, error } = await admin
    .from("users")
    .update(profile)
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
    .insert({ id: authData.user.id, ...profile })
    .select(USER_COLUMNS)
    .single()

  if (inserted.error) {
    await admin.auth.admin.deleteUser(authData.user.id)
    return { data: null, error: inserted.error.message }
  }

  return { data: inserted.data, error: null }
}

export async function updateUser(id: string, record: UserInput) {
  const admin = createAdminClient()
  const fields = profileFields(record)

  let profileImage: string | null = null
  try {
    if (record.profileImage) profileImage = await uploadProfileImage(admin, id, record.profileImage)
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to upload the profile image." }
  }

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

  const updateFields = profileImage ? { ...fields, profile_image: profileImage } : fields
  const { data, error } = await admin
    .from("users")
    .update(updateFields)
    .eq("id", id)
    .select(USER_COLUMNS)
    .maybeSingle()

  return { data, error: error?.message ?? null }
}

export async function deleteUser(id: string) {
  const { error } = await createAdminClient().auth.admin.deleteUser(id)
  return { error: error?.message ?? null }
}
