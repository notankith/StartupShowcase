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
          /* not used */
        },
      },
    })

    const userRes = await supabase.auth.getUser()
    const user = userRes?.data?.user
    if (userRes?.error) {
      const msg = userRes.error?.message ?? String(userRes.error)
      return NextResponse.json({ error: `Auth error: ${msg}` }, { status: 401 })
    }
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profileError) {
      return NextResponse.json({ error: `Profile lookup error: ${profileError.message ?? String(profileError)}` }, { status: 500 })
    }
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_URL) {
      return NextResponse.json({ error: "Server misconfiguration: missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL" }, { status: 500 })
    }

    const admin = createAdminClient()
    try {
      const { data: profiles, error } = await admin.from('profiles').select('id, email, full_name, role, created_at').order('created_at', { ascending: false })

      if (error) {
        const msg = error?.message ?? (typeof error === 'string' ? error : JSON.stringify(error, Object.getOwnPropertyNames(error)))
        return NextResponse.json({ error: msg, debug: { userId: user?.id } }, { status: 500 })
      }

      // Fetch idea rows to compute per-user idea counts in a single query.
      const { data: ideas, error: ideasError } = await admin.from('ideas').select('id, user_id')
      if (ideasError) {
        const msg = ideasError?.message ?? (typeof ideasError === 'string' ? ideasError : JSON.stringify(ideasError))
        return NextResponse.json({ error: `Failed to fetch ideas: ${msg}` }, { status: 500 })
      }

      const counts: Record<string, number> = {}
      ;(ideas || []).forEach((r: any) => {
        const uid = r.user_id
        if (!uid) return
        counts[uid] = (counts[uid] || 0) + 1
      })

      const mapped = (profiles || []).map((p: any) => ({
        ...p,
        // Keep previous shape expected by frontend: user.ideas?.[0]?.count
        ideas: [{ count: counts[p.id] || 0 }],
      }))

      return NextResponse.json({ users: mapped })
    } catch (err: any) {
      return NextResponse.json({ error: err?.message ?? String(err), debug: { userId: user?.id } }, { status: 500 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
