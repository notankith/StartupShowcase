import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongo/client"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
  try {
    const { email, password, fullName } = await req.json()
    if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    const db = await getDb()
    const profiles = db.collection("profiles")

    const normEmail = String(email).trim().toLowerCase()
    const existing = await profiles.findOne({ email: normEmail })
    if (existing) return NextResponse.json({ error: "Account already exists" }, { status: 400 })

    const hashed = await bcrypt.hash(password, 10)
    const now = new Date()
    const profile = {
      email: normEmail,
      full_name: fullName || null,
      password_hash: hashed,
      role: "user",
      created_at: now,
      updated_at: now,
    }
    const r = await profiles.insertOne(profile)
    const user = { id: String(r.insertedId), email, full_name: profile.full_name, role: profile.role }

    const secret = process.env.JWT_SECRET || "change-me"
    const token = jwt.sign({ user }, secret, { expiresIn: "7d" })

    const res = NextResponse.json({ user })
    res.cookies.set("session", token, { httpOnly: true, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" })
    return res
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
