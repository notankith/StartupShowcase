import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function POST(request: Request) {
  const { event, session } = await request.json()
  const cookieStore = await cookies()
  const response = NextResponse.json({ success: true })

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  if (event === "SIGNED_IN" && session) {
    await supabase.auth.setSession(session)
  } else if (event === "SIGNED_OUT") {
    await supabase.auth.signOut()
  }

  return response
}
