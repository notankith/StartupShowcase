import { NextResponse, type NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export async function updateSession(request: NextRequest) {
  const cookie = request.cookies.get("session")?.value || null
  try {
    if (process.env.DEBUG_AUTH === 'true') {
      const raw = request.headers.get('cookie')
      console.log('[middleware] url=', request.nextUrl.pathname, 'rawCookieHeader=', raw)
    }
  } catch (e) {
    // ignore logging failures
  }
  let user = null
  if (cookie) {
    try {
      const secret = process.env.JWT_SECRET || "change-me"
      if (process.env.DEBUG_AUTH === 'true') {
        const maskedSecret = process.env.JWT_SECRET ? `${String(process.env.JWT_SECRET).slice(0,4)}***` : null
        console.log('[middleware] attempting jwt.verify with secretPrefix=', maskedSecret)
      }
      const decoded: any = jwt.verify(cookie, secret)
      user = decoded.user || null
      if (process.env.DEBUG_AUTH === 'true') console.log('[middleware] jwt verified user.id=', user?.id)
    } catch (e) {
      if (process.env.DEBUG_AUTH === 'true') console.log('[middleware] jwt verify failed', String(e))
      user = null
    }
  }

  // Redirect to login for protected routes
  // Development-only bypass: allow access to dashboard routes while debugging
  if (process.env.NODE_ENV !== "production") {
    const path = request.nextUrl.pathname
    if (path === "/dashboard/ideas/new" || path.startsWith("/dashboard")) {
      if (process.env.DEBUG_AUTH === 'true') console.log('[middleware] development bypass enabled for path=', path)
      return NextResponse.next()
    }
  }

  if ((request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/admin")) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    console.log('[middleware] redirecting to /auth/login for path=', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
