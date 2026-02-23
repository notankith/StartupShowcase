"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminNavbar } from "@/components/admin-navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AdminEventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      try {
        // Ensure admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return router.push('/auth/login')

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role !== 'admin') return router.push('/dashboard')

        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: true })
        if (error) throw error
        setEvents(data || [])
      } catch (e: any) {
        setError(e.message || 'Failed to load events')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  return (
    <main className="min-h-screen bg-background">
      <AdminNavbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Manage Events</h1>
          <Button asChild>
            <Link href="/admin/events/new">New Event</Link>
          </Button>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : error ? (
          <div className="text-sm text-error">{error}</div>
        ) : events.length === 0 ? (
          <div className="text-sm text-muted-foreground">No events yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((e) => (
              <Card key={e.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{e.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="text-muted-foreground mb-2">{new Date(e.event_date).toLocaleString()}</div>
                  <div className="mb-3 truncate">{e.description}</div>
                  <div className="flex gap-2">
                    <Button asChild size="sm"><Link href={`/admin/events/${e.id}/edit`}>Edit</Link></Button>
                    {e.status === 'published' ? (
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">Published</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700">Draft</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
