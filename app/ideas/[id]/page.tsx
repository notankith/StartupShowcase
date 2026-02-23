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
          <Link href="/browse" className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-emerald-600 transition-colors duration-200 mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Browse
          </Link>

          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full mb-4">
                  {idea.category}
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">{idea.title}</h1>
                {/* Founder Program */}
                {idea.founder_program && (
                  <p className="text-sm text-muted-foreground mb-2">Founder Program: {idea.founder_program}</p>
                )}
                {/* Mentor Assigned */}
                {idea.mentor_assigned && (
                  <p className="text-sm text-muted-foreground mb-2">Mentor: {idea.mentor_assigned}</p>
                )}
                {/* Stage */}
                {idea.stage && (
                  <p className="text-sm text-muted-foreground mb-2">Stage: {idea.stage}</p>
                )}
              </div>
              {idea.is_featured && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
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
                    className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full flex items-center gap-1 font-medium"
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
              {/* Logo */}
              {idea.logo_url ? (
                <div className="flex justify-center">
                  <img
                    src={idea.logo_url}
                    alt={idea.title + ' logo'}
                    className="max-h-32 w-auto object-contain rounded"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="h-32 w-32 rounded bg-muted flex items-center justify-center text-xl font-semibold text-muted-foreground">
                    {idea.title.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}

              {/* Problem Statement */}
              <Card className="card-hover rounded-2xl border-border/60">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">The Problem</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{idea.problem_statement}</p>
                </CardContent>
              </Card>

              {/* Solution */}
              <Card className="card-hover rounded-2xl border-border/60">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">The Solution</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{idea.solution}</p>
                </CardContent>
              </Card>

              {/* Market Opportunity */}
              {idea.market_opportunity && (
                <Card className="card-hover rounded-2xl border-border/60">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Market Opportunity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{idea.market_opportunity}</p>
                  </CardContent>
                </Card>
              )}

              {/* Team */}
              {idea.team_description && (
                <Card className="card-hover rounded-2xl border-border/60">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Team</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{idea.team_description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Achievements / Traction */}
              {idea.achievements && (
                <Card className="card-hover rounded-2xl border-border/60">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Achievements / Traction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{idea.achievements}</p>
                  </CardContent>
                </Card>
              )}

              {/* Skills Needed */}
              {idea.skills_needed && idea.skills_needed.length > 0 && (
                <Card className="card-hover rounded-2xl border-border/60">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Skills Needed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {idea.skills_needed.map((skill: string) => (
                        <span key={skill} className="text-xs bg-emerald-50 text-emerald-700 font-medium px-3 py-1.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Call to Action */}
              {idea.call_to_action && (
                <Card className="card-hover rounded-2xl border-border/60">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Call to Action</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{idea.call_to_action}</p>
                  </CardContent>
                </Card>
              )}

              {/* Files */}
              {files && files.length > 0 && (
                <Card className="rounded-2xl border-border/60">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Supporting Materials</CardTitle>
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
              <Card className="md:sticky md:top-20 rounded-2xl border-border/60 shadow-lg shadow-black/5">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Interested?</CardTitle>
                  <CardDescription>Connect with the founder to learn more</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/60">
                    <p className="text-sm font-medium text-foreground mb-1">Contact Information</p>
                    {author && <p className="text-sm text-muted-foreground break-all">{author.email}</p>}
                  </div>
                  {idea.whatsapp_group_url && (
                    <Button className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20" asChild>
                      <a href={idea.whatsapp_group_url} target="_blank" rel="noopener noreferrer">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        Join Club
                      </a>
                    </Button>
                  )}
                  <Button className="w-full rounded-xl" variant="outline" asChild>
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
