import { createServerClient } from "@supabase/ssr"
import { headers } from "next/headers"

export async function createClient() {
  // Build cookies list from request headers (safer across runtimes)
  const hdrs = await headers()
  const cookieHeader = hdrs.get('cookie') || ''
  const cookieList = cookieHeader
    .split(';')
    .map((c: string) => c.trim())
    .filter(Boolean)
    .map((pair: string) => {
      const idx = pair.indexOf('=')
      if (idx === -1) return { name: pair, value: '' }
      return { name: pair.slice(0, idx), value: decodeURIComponent(pair.slice(idx + 1)) }
    })

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieList
      },
      setAll() {
        // Server components won't typically set cookies here. If needed,
        // the application should set cookies via a Route Handler or middleware.
      },
    },
  })
}
