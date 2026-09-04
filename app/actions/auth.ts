"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function getUserRole(userId: string) {
  const { data, error } = await createAdminClient()
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle()

  return {
    role: data?.role ?? null,
    error: error?.message ?? null,
  }
}