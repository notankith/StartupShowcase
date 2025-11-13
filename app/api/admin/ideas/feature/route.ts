import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, is_featured } = body || {}
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const admin = createAdminClient()
    const { error } = await admin.from('ideas').update({ is_featured }).eq('id', id)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
