import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || ""
    if (process.env.DEBUG_AUTH === 'true') console.log('[api/auth/user] cookieHeader=', cookie)
    const match = cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith("session="))
    const token = match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null
    const maskedToken = token ? `${String(token).slice(0,6)}...${String(token).slice(-6)}` : null
    if (process.env.DEBUG_AUTH === 'true') console.log('[api/auth/user] extracted token=', maskedToken)
    if (!token) return NextResponse.json({ user: null })

    try {
      const secret = process.env.JWT_SECRET || "change-me"
      const maskedSecret = process.env.JWT_SECRET ? `${String(process.env.JWT_SECRET).slice(0,4)}***` : null
      if (process.env.DEBUG_AUTH === 'true') console.log('[api/auth/user] verifying token with secretPrefix=', maskedSecret)
      const decoded: any = jwt.verify(token, secret)
      if (process.env.DEBUG_AUTH === 'true') console.log('[api/auth/user] jwt ok user.id=', decoded?.user?.id)
      return NextResponse.json({ user: decoded.user || null })
    } catch (e) {
      console.log('[api/auth/user] jwt verify failed', String(e))
      return NextResponse.json({ user: null })
    }
  } catch (err: any) {
    return NextResponse.json({ user: null })
  }
}
