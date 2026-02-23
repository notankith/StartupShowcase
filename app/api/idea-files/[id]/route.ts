import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongo/client"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

function toObjectId(val: string) {
  try { return new ObjectId(val) } catch { return val as any }
}

export async function DELETE(req: Request, ctx: any) {
  try {
    const params = await ctx.params
    const fileId = params.id
    const cookie = req.headers.get("cookie") || ""
    const match = cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith("session="))
    const token = match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const secret = process.env.JWT_SECRET || "change-me"
    const decoded: any = jwt.verify(token, secret)
    const user = decoded.user

    const db = await getDb()
    const files = db.collection("idea_files")
    const oid = toObjectId(fileId)
    const file = await files.findOne({ _id: oid })
    if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Optionally verify ownership here if needed
    await files.deleteOne({ _id: oid })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
