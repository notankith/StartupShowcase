import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDb } from '@/lib/mongo/client'

export async function POST(req: Request) {
  try {
    // Safety gate: only enable when explicitly allowed in env
    if (process.env.ENABLE_SERVER_SIGNUP !== 'true') {
      return NextResponse.json({ error: 'Server signup is disabled. Set ENABLE_SERVER_SIGNUP=true to enable.' }, { status: 403 })
    }

    const body = await req.json()
    const { email, password, fullName, role } = body || {}
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

    // If caller requested an admin role, update the profile record.
    if (role === 'admin') {
      try {
        const db = await getDb()
        const profiles = db.collection('profiles')
        const normEmail = String(email).trim().toLowerCase()
        await profiles.updateOne({ email: normEmail }, { $set: { role: 'admin', updated_at: new Date() } })
        // reflect change in returned user object if present
        if (data?.user) data.user.role = 'admin'
      } catch (updErr) {
        // don't fail the whole request if role patching fails — return user but warn
        return NextResponse.json({ user: data?.user ?? data, warning: 'Created user but failed to set admin role' }, { status: 200 })
      }
    }

    return NextResponse.json({ user: data?.user ?? data }, { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

