"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminNavbar } from "@/components/admin-navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Star, FileText } from "lucide-react"
import Link from "next/link"
import { FileOpener } from "@/components/file-opener"

export default function ModerationPage() {
  const [ideas, setIdeas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadPendingIdeas = async () => {
      try {
                const res = await fetch('/api/admin/pending-ideas')
                const text = await res.text().catch(() => '')
                let json: any = null
                try {
                  json = text ? JSON.parse(text) : null
                } catch (e) {
                  // invalid JSON in response
                }

                if (!res.ok) {
                  console.error('Error loading pending ideas (api):', { status: res.status, json, text })
                  setLoading(false)
                  return
                }

                setIdeas((json && json.ideas) || [])
      } catch (err) {
        console.error("Unexpected error loading pending ideas:", err)
      } finally {
        setLoading(false)
      }
    }

    loadPendingIdeas()
  }, [supabase])

  const approveIdea = async (id: string) => {
    const { error } = await supabase.from("ideas").update({ status: "approved" }).eq("id", id)

    if (error) {
      alert("Error approving idea")
    } else {
      setIdeas(ideas.filter((idea) => idea.id !== id))
    }
  }

  const rejectIdea = async (id: string) => {
    const { error } = await supabase.from("ideas").update({ status: "rejected" }).eq("id", id)

    if (error) {
      alert("Error rejecting idea")
    } else {
      setIdeas(ideas.filter((idea) => idea.id !== id))
    }
  }

  const featureIdea = async (id: string) => {
    const { error } = await supabase.from("ideas").update({ is_featured: true }).eq("id", id)

    if (error) {
      alert("Error featuring idea")
    } else {
      setIdeas(ideas.map((idea) => (idea.id === id ? { ...idea, is_featured: true } : idea)))
    }
  }

  const unfeatureIdea = async (id: string) => {
    const { error } = await supabase.from("ideas").update({ is_featured: false }).eq("id", id)

    if (error) {
      alert("Error unfeaturing idea")
    } else {
      setIdeas(ideas.map((idea) => (idea.id === id ? { ...idea, is_featured: false } : idea)))
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <AdminNavbar />

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground">Moderation Queue</h1>
            <p className="text-muted-foreground">Review and approve startup ideas</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : ideas.length > 0 ? (
            <div className="space-y-4">
              {ideas.map((idea: any) => {
                const isOpen = openId === idea.id
                return (
                  <Card key={idea.id} className="overflow-hidden">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-foreground mb-1">
                            <button
                              onClick={() => setOpenId(isOpen ? null : idea.id)}
                              className="text-left hover:underline text-primary"
                            >
                              {idea.title}
                            </button>
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">By: {idea.profiles?.full_name || "Unknown"}</p>
                          <div className="text-sm text-foreground">
                            <p className="line-clamp-3">{idea.problem_statement}</p>
                            <p className="mt-2 line-clamp-3 text-muted-foreground">{idea.solution}</p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <Button onClick={() => approveIdea(idea.id)} className="bg-success w-full sm:w-auto">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button onClick={() => rejectIdea(idea.id)} variant="outline" className="text-error border-error w-full sm:w-auto">
                            <XCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => (idea.is_featured ? unfeatureIdea(idea.id) : featureIdea(idea.id))}
                            variant={idea.is_featured ? undefined : 'outline'}
                            className="flex items-center gap-2 w-full sm:w-auto"
                          >
                            <Star className={`w-4 h-4 ${idea.is_featured ? 'text-accent' : ''}`} />
                          </Button>
                          <Button onClick={() => setOpenId(isOpen ? null : idea.id)} variant="ghost" className="sm:ml-2 ml-0 w-full sm:w-auto">
                            {isOpen ? 'Collapse' : 'Expand'}
                          </Button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="mt-4 space-y-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">Category</div>
                              <div className="text-foreground font-medium">{idea.category || '—'}</div>
                            </div>

                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">Tags</div>
                              <div className="text-foreground">{(idea.tags || []).length > 0 ? (idea.tags || []).join(', ') : '—'}</div>
                            </div>

                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">Submitted</div>
                              <div className="text-foreground">{idea.created_at ? new Date(idea.created_at).toLocaleString() : '—'}</div>
                            </div>

                            <div className="space-y-1 text-right">
                              <div className="text-sm text-muted-foreground">Author</div>
                              <div className="text-foreground">{idea.profiles?.full_name || idea.profiles?.email || 'Unknown'}</div>
                            </div>
                          </div>

                          <hr className="my-3 border-t border-border" />
                          <div>
                            <p className="text-foreground mb-1">
                              <span className="font-semibold">Problem:</span>
                            </p>
                            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{idea.problem_statement}</p>
                          </div>

                          <div>
                            <p className="text-foreground mb-1">
                              <span className="font-semibold">Solution:</span>
                            </p>
                            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{idea.solution}</p>
                          </div>

                          {idea.market_opportunity && (
                            <div>
                              <p className="text-foreground mb-1">
                                <span className="font-semibold">Market opportunity:</span>
                              </p>
                              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{idea.market_opportunity}</p>
                            </div>
                          )}

                          {idea.team_description && (
                            <div>
                              <p className="text-foreground mb-1">
                                <span className="font-semibold">Team:</span>
                              </p>
                              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{idea.team_description}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-4">
                            <div className="text-sm text-muted-foreground">Status</div>
                            <div className="text-foreground font-medium">{idea.status || 'pending'}</div>
                            <div className="ml-4 text-sm text-muted-foreground">Featured</div>
                            <div className="text-foreground font-medium">{idea.is_featured ? 'Yes' : 'No'}</div>
                          </div>

                          {/* Files preview */}
                          {idea.idea_files && idea.idea_files.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-foreground mb-2">Files</p>
                              <div className="space-y-4">
                                {idea.idea_files.map((file: any) => {
                                  const isImage = file.file_type?.startsWith?.("image/")
                                  const isPdf = (file.file_type === "application/pdf") || file.file_name?.toLowerCase?.().endsWith?.(".pdf")

                                  return (
                                    <div key={file.id} className="rounded-lg border border-border p-3">
                                      <div className="flex items-start gap-4">
                                        <div className="flex-1">
                                          <p className="font-medium text-foreground mb-1 break-words">{file.file_name}</p>
                                          <p className="text-xs text-muted-foreground mb-2">{(file.file_size / 1024).toFixed(2)} KB</p>

                                          {/* Inline preview for common types */}
                                          {isImage ? (
                                            <img src={file.file_url} alt={file.file_name} className="max-w-full max-h-32 md:max-h-48 rounded" />
                                          ) : isPdf ? (
                                            <div className="w-full h-32 md:h-48">
                                              <iframe src={file.file_url} className="w-full h-full" title={file.file_name} />
                                            </div>
                                          ) : (
                                            <div className="text-sm text-muted-foreground">No preview available for this file type.</div>
                                          )}
                                        </div>

                                        {/* Place opener as a sibling below to avoid nesting inside any
                                            clickable preview area which can cause duplicate navigation
                                            when parent elements also handle clicks. */}
                                      </div>

                                      <div className="mt-3 flex justify-end">
                                        <FileOpener url={file.file_url} name={file.file_name} />
                                      </div>
                                      
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-foreground mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No ideas pending review at the moment</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
