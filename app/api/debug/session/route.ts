import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || null

    // Reuse the same logic as /api/auth/user to decode session
    const match = cookieHeader ? cookieHeader.split(";").map((c) => c.trim()).find((c) => c.startsWith("session=")) : null
    const token = match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null

    let user = null
    let verifyError: string | null = null
    if (token) {
      try {
        const secret = process.env.JWT_SECRET || "change-me"
        const decoded: any = jwt.verify(token, secret)
        user = decoded.user || null
      } catch (e: any) {
        verifyError = String(e)
      }
    }

    return NextResponse.json({ cookieHeader, tokenPresent: !!token, verifyError, user })
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
