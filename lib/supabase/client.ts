// Browser-safe client used by client components. It exposes the minimal
// `auth.getUser()` surface the app expects by calling server API routes.
// Simple in-memory cache to avoid spamming `/api/auth/user` from client
let __lastUserCache: { user: any } | null = null
let __lastUserTime = 0
const __USER_CACHE_TTL = 1000 // ms

export function createClient() {
  async function remoteExec(collection: string, state: any, action = "select") {
    try {
      const res = await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ collection, action, state }),
      })
      if (!res.ok) {
        const text = await res.text()
        return { data: null, error: new Error(`Remote exec failed: ${res.status} ${text}`) }
      }
      const json = await res.json()
      return json
    } catch (err: any) {
      return { data: null, error: err }
    }
  }

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

    from(collection: string) {
      const state: any = { select: null, filters: [], order: null, single: false, data: null, action: 'select' }

      const api: any = {
        select(sel?: any, opts?: any) {
          state.select = sel
          if (opts && opts.count === 'exact') state.count = true
          return api
        },
        eq(field: string, value: any) {
          state.filters.push({ type: 'eq', field, value })
          return api
        },
        in(field: string, values: any[]) {
          state.filters.push({ type: 'in', field, value: values })
          return api
        },
        order(field: string, opts?: { ascending?: boolean }) {
          state.order = { field, ascending: opts?.ascending }
          return api
        },
        limit(n: number) {
          state.limit = n
          return api
        },
        async single() {
          state.single = true
          const r = await remoteExec(collection, state, state.action)
          // Server's single() already returns { data: singleDoc }, don't index again
          return { data: r?.data ?? null, error: r?.error ?? null }
        },
        insert(doc: any) {
          state.data = doc
          state.action = 'insert'
          return api
        },
        update(doc: any) {
          state.data = doc
          state.action = 'update'
          return api
        },
        delete() {
          state.action = 'delete'
          return api
        },
        // Make thenable so `await supabase.from(...).select()` and
        // `await supabase.from(...).update(...).eq(...)` both work
        then(resolve: any, reject: any) {
          remoteExec(collection, state, state.action).then((res) => {
            resolve(res)
          }, reject)
        },
      }

      return api
    },
  }
}
