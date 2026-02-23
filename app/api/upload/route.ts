import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { type NextRequest, NextResponse } from "next/server"

// Allow configuring max file size via env (in MB). Defaults to 50MB.
const MAX_FILE_SIZE = (parseInt(process.env.SUPABASE_MAX_FILE_SIZE_MB || "50", 10) || 50) * 1024 * 1024
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Common video types
  "video/mp4",
  "video/quicktime",
  "video/webm",
]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const ideaId = formData.get("ideaId") as string

    if (!file || !ideaId) {
      return NextResponse.json({ error: "Missing file or ideaId" }, { status: 400 })
    }

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 50MB limit" }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 })
    }

    // Verify ownership of idea
    const { data: idea, error: ideaError } = await supabase.from("ideas").select("user_id").eq("id", ideaId).single()

    if (ideaError || !idea || idea.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized to upload to this idea" }, { status: 403 })
    }

    // Create a unique filename and upload to Supabase Storage bucket
    const timestamp = Date.now()
    const filename = `${ideaId}/${timestamp}-${file.name}`

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "idea-files"

    // Prefer uploading the File/Blob directly (works in browser and many server runtimes).
    // Fallback to Buffer conversion for environments where the client library requires it.
    const contentType = file.type || "application/octet-stream"
    let uploadError: any = null

    // Use admin client for storage upload to avoid permission issues
    // Ensure R2 is configured
    if (!process.env.R2_ENDPOINT || !process.env.R2_BUCKET || !process.env.R2_ACCESS_KEY || !process.env.R2_SECRET_KEY) {
      return NextResponse.json({ error: "Server misconfiguration: missing R2 configuration" }, { status: 500 })
    }

    const admin = createAdminClient()

    try {
      const { error } = await admin.storage.from(bucket).upload(filename, file as any, {
        contentType,
      })
      uploadError = error
    } catch (e) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const fileBuffer = Buffer.from(arrayBuffer)
        const { error } = await admin.storage.from(bucket).upload(filename, fileBuffer, {
          contentType,
        })
        uploadError = error
      } catch (err) {
        uploadError = err
      }
    }

    if (uploadError) {
      // Log and return the underlying storage error to help debugging (no secrets)
      console.error("Storage upload error:", uploadError)
      let message = "Failed to upload file to storage"
      try {
        if (uploadError?.message) message = String(uploadError.message)
        else if (typeof uploadError === "string") message = uploadError
        else message = JSON.stringify(uploadError)
      } catch (e) {
        // ignore
      }

      return NextResponse.json({ error: message }, { status: 500 })
    }

    // Get public URL (Supabase storage public settings apply)
    const pub = admin.storage.from(bucket).getPublicUrl(filename)
    const fileUrl = (pub?.data?.publicUrl) || (typeof pub === 'string' ? pub : await pub)

    // Safety: ensure we never persist data: (base64) URLs. If storage client
    // unexpectedly returns a data: URL (shouldn't for Supabase Storage public
    // buckets), abort and ask the user to re-upload. This prevents re-introducing
    // base64 URLs into the DB.
    if (fileUrl && String(fileUrl).startsWith("data:")) {
      console.error("Upload produced data: URL — refusing to persist base64 URL", { fileUrl, filename })
      return NextResponse.json({ error: "Storage returned a data URL; aborting to avoid persisting base64. Please re-upload the file." }, { status: 500 })
    }

    // Save file metadata to database using the admin client to bypass RLS
    // Our admin client returns a { data, error } shape (Mongo adapter), not a chainable
    const insertResult = await admin.from("idea_files").insert({
      idea_id: ideaId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_url: fileUrl,
    })

    const fileRecord = insertResult?.data ?? insertResult
    const insertError = insertResult?.error || null

    if (insertError) {
      console.error('Insert error details:', insertError)
      let msg = 'Failed to save file metadata'
      try {
        msg = insertError?.message || JSON.stringify(insertError)
      } catch (e) {}
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      file: fileRecord,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
