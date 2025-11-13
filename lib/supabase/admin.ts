import { createClient } from "@supabase/supabase-js"

// Server-only admin client using the service role key. Do NOT expose this in client bundles.
export function createAdminClient() {
  const url = process.env.SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}
