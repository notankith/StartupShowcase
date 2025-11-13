import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const admin = createAdminClient()

    // fetch approved ideas for stats and recent list
    const { data: allIdeas, error: allError } = await admin
      .from("ideas")
      .select("id, category, status, created_at, is_featured, user_id, title")
      .eq("status", "approved")

    if (allError) throw allError

    const ideas = allIdeas || []

    const categoryMap = new Map<string, number>()
    const statusMap = new Map<string, number>()
    ideas.forEach((idea: any) => {
      categoryMap.set(idea.category, (categoryMap.get(idea.category) || 0) + 1)
      statusMap.set(idea.status, (statusMap.get(idea.status) || 0) + 1)
    })

    const ideasByCategory = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)

    const ideasByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }))

    const topCategories = ideasByCategory.slice(0, 5).map((i) => i.category)

    // recent approved ideas
    const { data: recent, error: recentError } = await admin
      .from("ideas")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(5)

    if (recentError) throw recentError

    const recentList = recent || []
    const userIds = Array.from(new Set(recentList.map((r: any) => r.user_id).filter(Boolean)))

    let profilesById: Record<string, any> = {}
    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await admin
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds)

      if (profilesError) throw profilesError
      profilesById = (profiles || []).reduce((acc: any, p: any) => ({ ...acc, [p.id]: p }), {})
    }

    const mergedRecent = recentList.map((it: any) => ({ ...it, profiles: profilesById[it.user_id] || null }))

    return NextResponse.json({ ideasByCategory, ideasByStatus, recentIdeas: mergedRecent, topCategories })
  } catch (err: any) {
    const msg = err?.message ?? String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
