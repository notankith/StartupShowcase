import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { FileText, User, Calendar, Tag } from "lucide-react"
import { FileOpener } from "@/components/file-opener"

export default async function IdeaDetailPage({ params }: { params: any }) {
  // `params` may be a Promise in Next 16+. Resolve it before accessing properties.
  const resolvedParams = typeof params?.then === "function" ? await params : params
  const id = resolvedParams?.id
  const supabase = await createClient()

  // Fetch the idea (don't restrict by status here so owners/admins can view drafts)
  const { data: idea, error: ideaError } = await supabase.from("ideas").select("*").eq("id", id).single()

  if (ideaError || !idea) {
    // Log detailed server-side info to help diagnose why the idea isn't returned
    console.error("Error fetching idea:", ideaError?.message ?? ideaError, { idea, params: resolvedParams })
    redirect("/browse")
  }

  // If idea is not approved, only allow the author or admins to view it
  if (idea.status !== "approved") {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // Log that no user session was available while trying to view non-approved idea
      console.error("Non-approved idea view attempted without authenticated user", { ideaId: idea.id })
    }

    let allowView = false
    if (user) {
      if (user.id === idea.user_id) {
        allowView = true
      } else {
        const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).single()
        if (profileError) {
          console.error("Error fetching viewer profile:", profileError)
        }
        if (profile?.role === "admin") {
          allowView = true
        }
      }
    }

    if (!allowView) {
      redirect("/browse")
    }
  }

  // Fetch the author
  const { data: author } = await supabase.from("profiles").select("full_name, email").eq("id", idea.user_id).single()

  // Fetch attached files
  const { data: files } = await supabase.from("idea_files").select("*").eq("idea_id", idea.id)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <Link href="/browse" className="text-primary hover:underline text-sm mb-6 inline-block">
            ← Back to Browse
          </Link>

          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
                  {idea.category}
                </span>
                <h1 className="text-4xl font-bold text-foreground mb-4">{idea.title}</h1>
              </div>
              {idea.is_featured && (
                <div className="flex items-center gap-2 bg-accent text-white text-sm font-semibold px-4 py-2 rounded-lg">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Featured
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
              {author && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{author.full_name || author.email || "Anonymous"}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(idea.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Tags */}
            {idea.tags && idea.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {idea.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs bg-muted text-foreground px-3 py-1 rounded-full flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* Problem Statement */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">The Problem</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{idea.problem_statement}</p>
                </CardContent>
              </Card>

              {/* Solution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">The Solution</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{idea.solution}</p>
                </CardContent>
              </Card>

              {/* Market Opportunity */}
              {idea.market_opportunity && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Market Opportunity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{idea.market_opportunity}</p>
                  </CardContent>
                </Card>
              )}

              {/* Team */}
              {idea.team_description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Team</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{idea.team_description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Files */}
              {files && files.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Supporting Materials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {files.map((file: any) => {
                        const isImage = file.file_type?.startsWith?.("image/")
                        const isPdf = (file.file_type === "application/pdf") || file.file_name?.toLowerCase?.().endsWith?.(".pdf")

                        return (
                          <div key={file.id} className="rounded-lg border border-border p-3">
                            <div className="flex items-start gap-4">
                              <div className="flex-1">
                                <p className="font-medium text-foreground mb-1 break-words">{file.file_name}</p>
                                <p className="text-xs text-muted-foreground mb-2">{(file.file_size / 1024).toFixed(2)} KB</p>

                                {isImage ? (
                                  <img src={file.file_url} alt={file.file_name} className="max-w-full max-h-40 md:max-h-64 rounded" />
                                ) : isPdf ? (
                                  <div className="w-full h-40 md:h-64">
                                    <iframe src={file.file_url} className="w-full h-full" title={file.file_name} />
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted-foreground">No preview available for this file type.</div>
                                )}
                                </div>
                              </div>

                              <div className="mt-3 flex justify-end">
                                <FileOpener url={file.file_url} name={file.file_name} />
                              </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              <Card className="md:sticky md:top-20">
                <CardHeader>
                  <CardTitle className="text-lg">Interested?</CardTitle>
                  <CardDescription>Connect with the founder to learn more</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">Contact Information</p>
                    {author && <p className="text-sm text-muted-foreground break-all">{author.email}</p>}
                  </div>
                  <Button className="w-full">
                    <Link href={`/contact/${idea.id}`}>Express Interest</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
