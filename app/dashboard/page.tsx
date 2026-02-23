"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Plus, Edit2, Trash2, Eye } from "lucide-react"

type Idea = {
  id: string
  title: string
  problem_statement: string
  status: "draft" | "submitted" | "approved" | "rejected"
  category: string
  created_at: string
  updated_at: string
}

export default function DashboardPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      // Fetch current user via server API
      const uRes = await fetch("/api/auth/user", { credentials: "include" })
      if (!uRes.ok) {
        router.push("/auth/login")
        return
      }
      const uPayload = await uRes.json().catch(() => ({}))
      const user = uPayload.user
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)

      // Fetch user's ideas from server API
      const res = await fetch("/api/ideas", { credentials: "include" })
      if (!res.ok) {
        console.error("Error fetching ideas:", await res.text().catch(() => ""))
        setLoading(false)
        return
      }
      const payload = await res.json().catch(() => ({ data: [] }))
      setIdeas(payload.data || [])
      setLoading(false)
    }

    loadData()
  }, [router])

  const deleteIdea = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this idea?")) return

    try {
      const res = await fetch(`/api/ideas/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        alert(body?.error || "Error deleting idea")
        return
      }
      setIdeas(ideas.filter((idea) => idea.id !== id))
    } catch (e) {
      alert("Error deleting idea")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-muted text-foreground"
      case "submitted":
        return "bg-blue-100 text-blue-800"
      case "approved":
        return "bg-success/20 text-success"
      case "rejected":
        return "bg-error/20 text-error"
      default:
        return "bg-muted text-foreground"
    }
  }

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">My Dashboard</h1>
              <p className="text-foreground">Manage and track your startup ideas</p>
            </div>
            <Button asChild className="mt-4 md:mt-0" size="lg">
              <Link href="/dashboard/ideas/new">
                <Plus className="w-4 h-4 mr-2" />
                New Idea
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-emerald-600">{ideas.length}</div>
                <p className="text-sm text-muted-foreground">Total Ideas</p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-500">
                  {ideas.filter((i) => i.status === "draft").length}
                </div>
                <p className="text-sm text-muted-foreground">Drafts</p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-success">
                  {ideas.filter((i) => i.status === "approved").length}
                </div>
                <p className="text-sm text-muted-foreground">Approved</p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-orange-500">
                  {ideas.filter((i) => i.status === "submitted").length}
                </div>
                <p className="text-sm text-muted-foreground">Under Review</p>
              </CardContent>
            </Card>
          </div>

          {/* Ideas List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : ideas.length > 0 ? (
            <div className="space-y-4">
              {ideas.map((idea) => (
                <Card key={idea.id} className="card-hover">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{idea.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{idea.problem_statement}</p>
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                            {idea.category}
                          </span>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(idea.status)}`}>
                            {getStatusLabel(idea.status)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(idea.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap md:flex-nowrap">
                        {idea.status === "approved" && (
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/ideas/${idea.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                        )}
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/ideas/${idea.id}/edit`}>
                            <Edit2 className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteIdea(idea.id)}>
                          <Trash2 className="w-4 h-4 text-error" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-12 text-center pb-12">
                <svg
                  className="w-12 h-12 text-muted-foreground mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-lg font-semibold text-foreground mb-2">No ideas yet</h3>
                <p className="text-muted-foreground mb-6">Get started by creating your first startup idea</p>
                <Button asChild>
                  <Link href="/dashboard/ideas/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Idea
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
