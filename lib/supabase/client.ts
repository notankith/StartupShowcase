// Browser-safe client used by client components. It exposes the minimal
// `auth.getUser()` surface the app expects by calling server API routes.
// Simple in-memory cache to avoid spamming `/api/auth/user` from client
let __lastUserCache: { user: any } | null = null
let __lastUserTime = 0
const __USER_CACHE_TTL = 1000 // ms

export function createClient() {
  return {
    auth: {
      async getUser() {
        const now = Date.now()
        if (__lastUserCache && now - __lastUserTime < __USER_CACHE_TTL) {
          return { data: { user: __lastUserCache.user } }
        }

        try {
          const res = await fetch("/api/auth/user", { credentials: "include" })
          if (!res.ok) {
            __lastUserCache = { user: null }
            __lastUserTime = now
            return { data: { user: null } }
          }
          const payload = await res.json()
          __lastUserCache = { user: payload.user || null }
          __lastUserTime = now
          return { data: { user: payload.user || null } }
        } catch (e) {
          __lastUserCache = { user: null }
          __lastUserTime = now
          return { data: { user: null } }
        }
      },
    },
  }
}
