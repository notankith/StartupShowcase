import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    // Safety gate: only enable when explicitly allowed in env
    if (process.env.ENABLE_SERVER_SIGNUP !== 'true') {
      return NextResponse.json({ error: 'Server signup is disabled. Set ENABLE_SERVER_SIGNUP=true to enable.' }, { status: 403 })
    }

    const body = await req.json()
    const { email, password, fullName } = body || {}
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Create the user as confirmed so no email verification is required.
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || null },
    })

    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 })
    }

    return NextResponse.json({ user: data?.user ?? data }, { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
