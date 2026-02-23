import { NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const collection = body.collection
    const action = body.action || 'select'
    const state = body.state || {}

    if (!collection) return NextResponse.json({ error: 'Missing collection' }, { status: 400 })

    const supabase = await createServerClient()
    const q: any = (supabase as any).from(collection)

    // apply filters
    if (Array.isArray(state.filters)) {
      for (const f of state.filters) {
        if (f.type === 'eq') q.eq(f.field, f.value)
        else if (f.type === 'in') q.in(f.field, f.value)
      }
    }
    if (state.order) q.order(state.order.field, { ascending: !!state.order.ascending })
    if (state.limit) q.limit(Number(state.limit))
    if (state.select) q.select(state.select, state.count ? { count: 'exact' } : undefined)

    try {
      if (action === 'select') {
        if (state.single) {
          const r = await q.single()
          return NextResponse.json(r)
        }
        const r = await q
        return NextResponse.json(r)
      }
      if (action === 'insert') {
        q.insert(state.data)
        const r = await q
        return NextResponse.json(r)
      }
      if (action === 'update') {
        q.update(state.data)
        const r = await q
        return NextResponse.json(r)
      }
      if (action === 'delete') {
        q.delete()
        const r = await q
        return NextResponse.json(r)
      }

      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
    } catch (err: any) {
      return NextResponse.json({ data: null, error: err?.message ?? String(err) }, { status: 500 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
