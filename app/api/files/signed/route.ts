import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const { fileUrl, bucket } = await req.json().catch(() => ({}))
    if (!fileUrl) return NextResponse.json({ error: 'Missing fileUrl' }, { status: 400 })

    // Parse storage path from a typical Supabase public URL:
    // https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const match = fileUrl.match(/\/storage\/v1\/object\/public\/(?:[^\/]+)\/(.*)$/)
    if (!match) {
      // If URL isn't a storage public URL, just return it as-is
      return NextResponse.json({ url: fileUrl })
    }

    const path = decodeURIComponent(match[1])

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_URL) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    const admin = createAdminClient()
    const storageBucket = bucket || process.env.SUPABASE_STORAGE_BUCKET || 'idea-files'

    // Create a short-lived signed URL (60 seconds)
    const { data, error } = await admin.storage.from(storageBucket).createSignedUrl(path, 60)
    if (error) {
      console.error('createSignedUrl error:', error)
      return NextResponse.json({ error: error.message || 'Failed to create signed URL' }, { status: 500 })
    }

    return NextResponse.json({ url: data?.signedUrl || fileUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
