import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongo/client"
import jwt from "jsonwebtoken"

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
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
    const file = await files.findOne({ _id: fileId })
    if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Optionally verify ownership here if needed
    await files.deleteOne({ _id: fileId })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
