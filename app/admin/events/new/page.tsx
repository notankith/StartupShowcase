"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { AdminNavbar } from "@/components/admin-navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function NewEventPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    registration_link: "",
    status: "draft",
    is_featured: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const onSubmit = async (e: any) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/auth/login')
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') return router.push('/dashboard')

      // Convert datetime-local to ISO if provided
      const isoDate = form.event_date ? new Date(form.event_date).toISOString() : null
      const { error } = await supabase.from('events').insert({
        title: form.title,
        description: form.description || null,
        event_date: isoDate,
        location: form.location || null,
        registration_link: form.registration_link || null,
        status: form.status,
        is_featured: form.is_featured,
      })
      if (error) throw error
      router.push('/admin/events')
    } catch (e: any) {
      setError(e.message || 'Failed to create event')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <AdminNavbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Create Event</CardTitle>
            <CardDescription>Add a new event</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" value={form.title} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-border rounded-lg" />
              </div>
              <div>
                <Label htmlFor="event_date">Date *</Label>
                <Input id="event_date" name="event_date" type="date" value={form.event_date} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" value={form.location} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="registration_link">Registration Link</Label>
                <Input id="registration_link" name="registration_link" type="url" value={form.registration_link} onChange={handleChange} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select id="status" name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 mt-6">
                  <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} />
                  <span className="text-sm">Featured</span>
                </label>
              </div>

              {error && <p className="text-sm text-error">{error}</p>}

              <div className="flex gap-3">
                <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Create Event'}</Button>
                <Button type="button" variant="outline" onClick={() => router.push('/admin/events')}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
