import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const { fileUrl, bucket } = await req.json().catch(() => ({}))
    if (!fileUrl) return NextResponse.json({ error: 'Missing fileUrl' }, { status: 400 })

    // If URL already points to an external/non-storage URL, return as-is
    const r2Endpoint = process.env.R2_ENDPOINT
    const storageBucket = bucket || process.env.R2_BUCKET

    if (!r2Endpoint || !storageBucket) return NextResponse.json({ url: fileUrl })

    // If the URL matches our R2 public URL pattern, extract the key
    const prefix = `${r2Endpoint}/${storageBucket}/`
    if (!fileUrl.startsWith(prefix)) return NextResponse.json({ url: fileUrl })

    const path = decodeURIComponent(fileUrl.slice(prefix.length))

    const admin = createAdminClient()
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
