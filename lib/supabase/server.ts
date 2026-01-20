import { headers } from "next/headers"
import { from as fromAdapter } from "@/lib/mongo/adapter"
import jwt from "jsonwebtoken"

// Server-side compatibility client. Exposes `.from()` for DB access and
// `auth.getUser()` which reads a server cookie named `session` (JWT).
export async function createClient() {
  const hdrs = await headers()
  const cookieHeader = hdrs.get("cookie") || ""
  if (process.env.DEBUG_AUTH === 'true') console.log('[supabase/server] headers.cookie=', cookieHeader)

  function parseCookie(name: string) {
    const parts = cookieHeader.split(";").map((p) => p.trim())
    for (const p of parts) {
      if (!p) continue
      const [k, ...rest] = p.split("=")
      if (k === name) return decodeURIComponent(rest.join("="))
    }
    return null
  }

  const token = parseCookie("session")

  let user = null
  if (token) {
    try {
      const secret = process.env.JWT_SECRET || "change-me"
      const decoded: any = jwt.verify(token, secret)
      user = decoded.user || null
      if (process.env.DEBUG_AUTH === 'true') console.log('[supabase/server] jwt verified user.id=', user?.id)
    } catch (e) {
      if (process.env.DEBUG_AUTH === 'true') console.log('[supabase/server] jwt verify failed', String(e))
      user = null
    }
  }

  return {
    from(collectionName: string) {
      return (fromAdapter as any)(collectionName)
    },
    auth: {
      async getUser() {
        return { data: { user } }
      },
    },
  }
}
