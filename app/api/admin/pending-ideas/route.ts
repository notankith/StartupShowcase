import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { createAdminClient } from "@/lib/supabase/admin"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    // Build a cookie list from the incoming request headers to pass to createServerClient
    const cookieHeader = request.headers.get('cookie') || ''
    const cookieList = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .filter(Boolean)
      .map((pair) => {
        const idx = pair.indexOf('=')
        if (idx === -1) return { name: pair, value: '' }
        return { name: pair.slice(0, idx), value: decodeURIComponent(pair.slice(idx + 1)) }
      })

    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll() {
          return cookieList
        },
        setAll() {
          /* not needed in this endpoint */
        },
      },
    })

    // Safely get the authenticated user from the server client
    const userRes = await supabase.auth.getUser()
    const user = userRes?.data?.user
    if (userRes?.error) {
      const msg = userRes.error?.message ?? String(userRes.error)
      return NextResponse.json({ error: `Auth error: ${msg}` }, { status: 401 })
    }
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profileError) {
      return NextResponse.json({ error: `Profile lookup error: ${profileError.message ?? String(profileError)}` }, { status: 500 })
    }
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // Use service role client to fetch full data bypassing RLS
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_URL) {
      return NextResponse.json({ error: "Server misconfiguration: missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL" }, { status: 500 })
    }

    const admin = createAdminClient()

    try {
      // First fetch ideas and their files (avoid nested select for profiles to prevent schema-cache issues)
      const { data: ideas, error: ideasError } = await admin
        .from('ideas')
        .select('*, idea_files(*)')
        .eq('status', 'submitted')
        .order('created_at', { ascending: true })

      if (ideasError) {
        const msg = ideasError?.message ?? (typeof ideasError === 'string' ? ideasError : JSON.stringify(ideasError, Object.getOwnPropertyNames(ideasError)))
        return NextResponse.json({ error: msg, debug: { userId: user?.id } }, { status: 500 })
      }

      const ideaList = ideas || []
      const userIds = Array.from(new Set(ideaList.map((i: any) => i.user_id).filter(Boolean)))

      // Fetch profiles separately and merge
      let profilesById: Record<string, any> = {}
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await admin.from('profiles').select('id, full_name, email').in('id', userIds)
        if (profilesError) {
          const msg = profilesError?.message ?? (typeof profilesError === 'string' ? profilesError : JSON.stringify(profilesError, Object.getOwnPropertyNames(profilesError)))
          return NextResponse.json({ error: msg, debug: { userId: user?.id } }, { status: 500 })
        }
        profilesById = (profiles || []).reduce((acc: any, p: any) => ({ ...acc, [p.id]: p }), {})
      }

      const merged = ideaList.map((it: any) => ({ ...it, profiles: profilesById[it.user_id] || null }))

      return NextResponse.json({ ideas: merged })
    } catch (err: any) {
      return NextResponse.json({ error: err?.message ?? String(err), debug: { userId: user?.id } }, { status: 500 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
