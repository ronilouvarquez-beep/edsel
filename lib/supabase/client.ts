import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
)

export function createClient() {
  return supabaseClient
}

export async function signOut() {
  const { error } = await createClient().auth.signOut()
  if (error) throw error
}
