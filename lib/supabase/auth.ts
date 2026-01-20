// Lightweight client-facing auth wrapper — talks to the app's API routes
export async function signUp(email: string, password: string, fullName: string) {
  try {
    const res = await fetch("/api/auth/sign-up", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName }),
    })
    const payload = await res.json().catch(() => ({}))
    if (!res.ok) return { data: null, error: new Error(payload?.error || `Sign up failed (${res.status})`) }
    return { data: payload, error: undefined }
  } catch (err: any) {
    return { data: null, error: new Error(err?.message || "Network error during sign up") }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const res = await fetch("/api/auth/sign-in", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const payload = await res.json().catch(() => ({}))
    if (!res.ok) return { data: null, error: new Error(payload?.error || `Sign in failed (${res.status})`) }
    // After successful sign-in, poll /api/auth/user until the server-visible
    // session is available. This avoids navigation races where the next
    // request doesn't include the freshly-set httpOnly cookie yet.
    const start = Date.now()
    const timeout = 3000
    let user: any = null
    while (Date.now() - start < timeout) {
      try {
        const r = await fetch('/api/auth/user', { credentials: 'include' })
        if (r.ok) {
          const p = await r.json().catch(() => ({}))
          if (p?.user) {
            user = p.user
            break
          }
        }
      } catch (e) {
        // ignore network hiccups
      }
      // small backoff
      await new Promise((r) => setTimeout(r, 200))
    }

    return { data: payload, error: undefined, user }
  } catch (err: any) {
    return { data: null, error: new Error(err?.message || "Network error during sign in") }
  }
}

export async function signOut() {
  const res = await fetch("/api/auth/sign-out", { method: "POST", credentials: "include" })
  if (!res.ok) return { error: new Error("Sign out failed") }
  return { error: null }
}
