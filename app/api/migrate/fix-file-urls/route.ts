import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongo/client"
import * as r2 from "@/lib/storage/r2"

/**
 * POST /api/migrate/fix-file-urls
 *
 * One-time migration: find all idea_files records where file_url is not a
 * valid string (e.g. stored as {} due to the old async getPublicUrl bug).
 * For each, list R2 objects under the idea_id prefix and match by file_name
 * suffix, then update the record with the correct public URL.
 */
export async function POST() {
  try {
    const db = await getDb()
    const col = db.collection("idea_files")

    // Find records where file_url is not a non-empty string
    const broken = await col
      .find({
        $or: [
          { file_url: { $type: "object" } },
          { file_url: "" },
          { file_url: null },
          { file_url: { $exists: false } },
        ],
      })
      .toArray()

    if (broken.length === 0) {
      return NextResponse.json({ message: "No broken file URLs found", fixed: 0 })
    }

    // Group by idea_id to minimise R2 list calls
    const byIdea = new Map<string, typeof broken>()
    for (const rec of broken) {
      const ideaId = String(rec.idea_id)
      if (!byIdea.has(ideaId)) byIdea.set(ideaId, [])
      byIdea.get(ideaId)!.push(rec)
    }

    let fixed = 0
    const errors: string[] = []

    for (const [ideaId, records] of byIdea) {
      try {
        // List all R2 objects under this idea's prefix
        const objects = await r2.listObjects(`${ideaId}/`)

        for (const rec of records) {
          // The original key was ${ideaId}/${timestamp}-${file_name}
          // Match by file_name suffix
          const fileName = String(rec.file_name)
          const match = objects.find((o) => o.key.endsWith(`-${fileName}`))

          if (match) {
            const publicUrl = r2.getPublicUrl(match.key)
            await col.updateOne({ _id: rec._id }, { $set: { file_url: publicUrl } })
            fixed++
          } else {
            errors.push(`No R2 match for file "${fileName}" (idea ${ideaId})`)
          }
        }
      } catch (err: any) {
        errors.push(`R2 list failed for idea ${ideaId}: ${err.message}`)
      }
    }

    return NextResponse.json({
      message: `Fixed ${fixed} of ${broken.length} broken file URLs`,
      fixed,
      total: broken.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err: any) {
    console.error("fix-file-urls migration error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
