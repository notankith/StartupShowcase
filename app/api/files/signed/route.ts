import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const { fileUrl, key, bucket } = await req.json().catch(() => ({}))

    const r2Endpoint = process.env.R2_ENDPOINT
    const storageBucket = bucket || process.env.R2_BUCKET

    if (!r2Endpoint || !storageBucket) {
      return NextResponse.json({ url: fileUrl || '' })
    }

    let path: string | undefined

    // Option 1: caller provided a direct R2 key
    if (key) {
      path = key
    }
    // Option 2: caller provided a full R2 public URL
    else if (fileUrl) {
      const prefix = `${r2Endpoint}/${storageBucket}/`
      if (fileUrl.startsWith(prefix)) {
        path = decodeURIComponent(fileUrl.slice(prefix.length))
      } else {
        // Not an R2 URL — return as-is
        return NextResponse.json({ url: fileUrl })
      }
    }

    if (!path) {
      return NextResponse.json({ error: 'Missing fileUrl or key' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin.storage.from(storageBucket).createSignedUrl(path, 300)
    if (error) {
      console.error('createSignedUrl error:', error)
      return NextResponse.json({ error: error.message || 'Failed to create signed URL' }, { status: 500 })
    }

    return NextResponse.json({ url: data?.signedUrl || fileUrl || '' })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
