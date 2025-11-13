"use client"

import { useEffect, useState } from "react"
import { AdminNavbar } from "@/components/admin-navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Trash2 } from "lucide-react"

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    ideasByCategory: [] as Array<{ category: string; count: number }>,
    ideasByStatus: [] as Array<{ status: string; count: number }>,
    recentIdeas: [] as any[],
    topCategories: [] as string[],
  })
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/analytics')
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Failed to load analytics')

        setAnalytics({
          ideasByCategory: json.ideasByCategory || [],
          ideasByStatus: json.ideasByStatus || [],
          recentIdeas: json.recentIdeas || [],
          topCategories: json.topCategories || [],
        })
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <AdminNavbar />

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">Platform insights and trends</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ideas by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Ideas by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.ideasByCategory.map((item) => (
                      <div key={item.category}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">{item.category}</span>
                          <span className="text-sm text-muted-foreground">{item.count}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${Math.min((item.count / Math.max(...analytics.ideasByCategory.map((i) => i.count), 1)) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ideas by Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Ideas by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.ideasByStatus.map((item) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{item.status}</span>
                        <span className="text-2xl font-bold text-primary">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Approved Ideas */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recently Approved Ideas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.recentIdeas.map((idea) => (
                          <div key={idea.id} className="p-3 bg-muted rounded-lg flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground">{idea.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {idea.profiles ? (idea.profiles.email || idea.profiles.full_name) : 'Unknown'} • {new Date(idea.created_at).toLocaleDateString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Feature / Unfeature - only relevant for approved ideas shown here */}
                              <Button
                                onClick={async () => {
                                  try {
                                    const res = await fetch('/api/admin/ideas/feature', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ id: idea.id, is_featured: !idea.is_featured }),
                                    })
                                    const json = await res.json()
                                    if (!res.ok) throw new Error(json?.error || 'Failed')
                                    setAnalytics((prev) => ({ ...prev, recentIdeas: prev.recentIdeas.map((i) => (i.id === idea.id ? { ...i, is_featured: !i.is_featured } : i)) }))
                                  } catch (e) {
                                    alert('Error toggling featured')
                                  }
                                }}
                                variant={idea.is_featured ? undefined : 'outline'}
                                className="flex items-center gap-2"
                              >
                                <Star className={`w-4 h-4 ${idea.is_featured ? 'text-accent' : ''}`} />
                              </Button>

                              {/* Delete idea */}
                              <Button
                                onClick={async () => {
                                  if (!confirm('Delete this idea permanently?')) return
                                  try {
                                    const res = await fetch('/api/admin/ideas/delete', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ id: idea.id }),
                                    })
                                    const json = await res.json()
                                    if (!res.ok) throw new Error(json?.error || 'Failed')
                                    setAnalytics((prev) => ({ ...prev, recentIdeas: prev.recentIdeas.filter((i) => i.id !== idea.id) }))
                                  } catch (e) {
                                    alert('Error deleting idea')
                                  }
                                }}
                                variant="destructive"
                                className="flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
