import * as mongoAdapter from "@/lib/mongo/adapter"
import * as r2 from "@/lib/storage/r2"
import { getDb } from "@/lib/mongo/client"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"

// Compatibility shim that exposes a minimal subset of the Supabase admin client
export function createAdminClient() {
  return {
    from(collectionName: string) {
      // Return our QueryBuilder instance
      return (mongoAdapter as any).from(collectionName)
    },
    auth: {
      admin: {
        async createUser(opts: { email: string; password: string; email_confirm?: boolean; user_metadata?: any }) {
          try {
            const db = await getDb()
            const profiles = db.collection("profiles")
            const existing = await profiles.findOne({ email: opts.email })
            if (existing) return { data: null, error: new Error("User already exists") }

            const hashed = await bcrypt.hash(opts.password || Math.random().toString(36), 10)
            const now = new Date()
            const normEmail = String(opts.email).trim().toLowerCase()
            const doc: any = {
              email: normEmail,
              full_name: opts.user_metadata?.full_name ?? null,
              password_hash: hashed,
              role: "student",
              created_at: now,
              updated_at: now,
            }
            const r = await profiles.insertOne(doc)
            const user = { id: String(r.insertedId), email: normEmail, full_name: doc.full_name, role: doc.role }
            return { data: { user }, error: null }
          } catch (err: any) {
            return { data: null, error: err }
          }
        },
      },
    },
    storage: {
      from(bucketName: string) {
        return {
          async upload(path: string, body: any, opts?: { contentType?: string }) {
            const key = `${path}`
            await r2.uploadToR2(key, body, opts?.contentType)
            return { error: null }
          },
          getPublicUrl(path: string) {
            const url = r2.getPublicUrl(path)
            return { data: { publicUrl: url } }
          },
          async createSignedUrl(path: string, expires: number) {
            const url = await r2.createSignedUrlR2(path, expires)
            return { data: { signedUrl: url }, error: null }
          },
        }
      },
    },
  }
}
