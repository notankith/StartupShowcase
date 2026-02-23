import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongo/client"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

async function parseBody(req: Request) {
  const ct = req.headers.get("content-type") || ""
  if (ct.includes("application/json")) return req.json()
  try {
    const fd = await req.formData()
    const out: Record<string, any> = {}
    for (const [k, v] of fd.entries()) out[k] = String(v)
    return out
  } catch (e) {
    return {}
  }
}

export async function POST(req: Request) {
  try {
    const body: any = await parseBody(req)
    const email = String(body.email || "").trim().toLowerCase()
    const password = String(body.password || "")
    const redirectTo = String(body.redirectTo || "/")

    if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    const db = await getDb()
    const profiles = db.collection("profiles")
    const user = await profiles.findOne({ email })
    console.log('[auth/sign-in] email=', email, 'found=', !!user, 'hasPasswordHash=', !!(user && user.password_hash))
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    let ok = false
    if (user.password_hash) {
      ok = await bcrypt.compare(password, user.password_hash)
    } else if (user.password) {
      ok = password === user.password
      if (ok) {
        const hashed = await bcrypt.hash(password, 10)
        await profiles.updateOne({ _id: user._id }, { $set: { password_hash: hashed }, $unset: { password: "" } })
      }
    }
    console.log('[auth/sign-in] bcrypt/legacy result=', ok)
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    const payloadUser = { id: String(user._id), email: user.email, full_name: user.full_name, role: user.role }
    const secret = process.env.JWT_SECRET || "change-me"
    const maxAge = 60 * 60 * 24 * 7 // 7 days in seconds
    const token = jwt.sign({ user: payloadUser }, secret, { expiresIn: maxAge })

    const secure = process.env.NODE_ENV === "production"

    // If the request came as JSON (from fetch), return a JSON response with
    // Set-Cookie so the browser can follow up with a client-side redirect.
    const ct = req.headers.get("content-type") || ""
    const isJsonRequest = ct.includes("application/json")

    const res = isJsonRequest
      ? NextResponse.json({ ok: true, redirectTo })
      : NextResponse.redirect(new URL(redirectTo, req.url))

    // Set httpOnly cookie so server-rendered pages can read session on next request
    res.cookies.set("session", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure,
      maxAge,
    })
    // Development-only: also set a non-httpOnly debug cookie
    if (process.env.NODE_ENV !== "production") {
      try {
        res.cookies.set("session_debug", token, {
          httpOnly: false,
          path: "/",
          sameSite: "lax",
          secure: false,
          maxAge,
        })
      } catch (e) {}
    }
    return res
  } catch (err: any) {
    console.error('[auth/sign-in] error', err)
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
