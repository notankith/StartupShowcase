import { NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  try {
    // Build a cookie list from the incoming request headers to pass to createServerClient
    const supabase = await createServerClient()
    const userRes = await supabase.auth.getUser()
    const user = userRes?.data?.user
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // check admin role via profiles collection
    const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profileError) return NextResponse.json({ error: `Profile lookup error: ${profileError?.message ?? String(profileError)}` }, { status: 500 })
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const admin = createAdminClient()

    try {
      const { data: ideas, error: ideasError } = await admin.from('ideas').select('*, idea_files(*)').eq('status', 'submitted').order('created_at', { ascending: true })
      if (ideasError) return NextResponse.json({ error: ideasError?.message ?? String(ideasError) }, { status: 500 })

      // Adapter already normalizes _id → id (string). Ensure user_id is also a string.
      let ideaList = (ideas || []).map((it: any) => ({ ...(it || {}), user_id: it?.user_id ? String(it.user_id) : null }))
      const userIds = Array.from(new Set(ideaList.map((i: any) => i.user_id).filter(Boolean)))

      let profilesById: Record<string, any> = {}
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await admin.from('profiles').select('id, full_name, email').in('id', userIds)
        if (profilesError) return NextResponse.json({ error: profilesError?.message ?? String(profilesError) }, { status: 500 })
        profilesById = (profiles || []).reduce((acc: any, p: any) => ({ ...acc, [p.id]: p }), {})
      }

      // Attach supporting files for each idea
      const ideaIds = ideaList.map((i: any) => i.id).filter(Boolean)
      let filesByIdea: Record<string, any[]> = {}
      if (ideaIds.length > 0) {
        const { data: files, error: filesError } = await admin.from('idea_files').select('*').in('idea_id', ideaIds)
        if (filesError) return NextResponse.json({ error: filesError?.message ?? String(filesError) }, { status: 500 })
        filesByIdea = (files || []).reduce((acc: any, f: any) => {
          const id = f.idea_id
          acc[id] = acc[id] || []
          acc[id].push(f)
          return acc
        }, {})
      }

      const merged = ideaList.map((it: any) => ({ ...it, profiles: profilesById[it.user_id] || null, files: filesByIdea[it.id] || [] }))
      return NextResponse.json({ ideas: merged })
    } catch (err: any) {
      console.error('[pending-ideas] inner error', err)
      return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
    }
  } catch (err: any) {
    console.error('[pending-ideas] outer error', err)
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
