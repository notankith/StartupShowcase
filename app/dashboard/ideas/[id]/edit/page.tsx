"use client"

import React from "react"

import { useEffect, useState } from "react"
// server APIs used instead of client-side supabase
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ChevronLeft, Trash2 } from "lucide-react"
import { FileUpload } from "@/components/file-upload"

const CATEGORIES = [
  "Technology",
  "Healthcare",
  "Education",
  "Finance",
  "Sustainability",
  "E-commerce",
  "Social Impact",
  "Food & Agriculture",
  "Transportation",
  "Entertainment",
  "Real Estate",
  "Energy",
]

export default function EditIdeaPage({ params }: { params: any }) {
  // `params` may be a Promise in the app-router when this component is rendered
  // as a client component. Next.js recommends unwrapping it with React.use().
  // Use a safe fallback if React.use is not available.
  const unwrappedParams = typeof (React as any).use === "function" ? (React as any).use(params) : params
  const [formData, setFormData] = useState({
    title: "",
    problem_statement: "",
    solution: "",
    market_opportunity: "",
    team_description: "",
    category: "",
    tags: "",
    whatsapp_group_url: "",
    mentor_assigned: "",
    achievements: "",
    skills_needed: "",
    call_to_action: "",
    founder_program: "",
    logo_url: "",
    stage: "Ideation",
  })
  const [idea, setIdea] = useState<any>(null)
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadIdea = async () => {
      try {
        const res = await fetch(`/api/ideas/${unwrappedParams.id}`, { credentials: "include" })
        if (!res.ok) {
          router.push("/dashboard")
          return
        }
        const payload = await res.json()
        const data = payload.data.idea
        const filesData = payload.data.files || []

        setIdea(data)
        setFormData({
          title: data.title,
          problem_statement: data.problem_statement,
          solution: data.solution,
          market_opportunity: data.market_opportunity || "",
          team_description: data.team_description || "",
          category: data.category,
          tags: (data.tags || []).join(", "),
          whatsapp_group_url: data.whatsapp_group_url || "",
          mentor_assigned: data.mentor_assigned || "",
          achievements: data.achievements || "",
          skills_needed: (data.skills_needed || []).join(", "),
          call_to_action: data.call_to_action || "",
          founder_program: data.founder_program || "",
          logo_url: data.logo_url || "",
          stage: data.stage || "Ideation",
        })

        setFiles(filesData)
        setLoading(false)
      } catch (e) {
        router.push("/dashboard")
      }
    }

    loadIdea()
  }, [unwrappedParams.id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const skillsNeeded = formData.skills_needed
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      const res = await fetch(`/api/ideas/${unwrappedParams.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          problem_statement: formData.problem_statement,
          solution: formData.solution,
          market_opportunity: formData.market_opportunity,
          team_description: formData.team_description,
          category: formData.category,
          tags,
          status: asDraft ? "draft" : "submitted",
          updated_at: new Date().toISOString(),
          whatsapp_group_url: formData.whatsapp_group_url || null,
          mentor_assigned: formData.mentor_assigned || null,
          achievements: formData.achievements || null,
          skills_needed: skillsNeeded,
          call_to_action: formData.call_to_action || null,
          founder_program: formData.founder_program || null,
          logo_url: formData.logo_url || null,
          stage: formData.stage,
        }),
      })

      if (!res.ok) {
        const p = await res.json().catch(() => ({}))
        throw new Error(p?.error || `Update failed (${res.status})`)
      }

      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update idea")
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteFile = async (fileId: string) => {
    try {
      const res = await fetch(`/api/idea-files/${fileId}`, { method: "DELETE", credentials: "include" })
      if (!res.ok) throw new Error("Delete failed")
      setFiles(files.filter((f) => f._id !== fileId && f.id !== fileId))
    } catch (err) {
      setError("Failed to delete file")
    }
  }

  const handleFileUploaded = (newFile: any) => {
    setFiles([...files, newFile])
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:underline text-sm mb-8">
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Edit Idea</CardTitle>
              <CardDescription>
                {idea?.status === "approved"
                  ? "Your idea has been approved"
                  : idea?.status === "submitted"
                    ? "Your idea is under review"
                    : "Complete your idea and submit for review"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Idea Title *</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-border rounded-lg font-sans"
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Problem Statement */}
                <div>
                  <Label htmlFor="problem_statement">The Problem *</Label>
                  <textarea
                    id="problem_statement"
                    name="problem_statement"
                    rows={4}
                    value={formData.problem_statement}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-border rounded-lg font-sans"
                  />
                </div>

                {/* Solution */}
                <div>
                  <Label htmlFor="solution">The Solution *</Label>
                  <textarea
                    id="solution"
                    name="solution"
                    rows={4}
                    value={formData.solution}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-border rounded-lg font-sans"
                  />
                </div>

                {/* Market Opportunity */}
                <div>
                  <Label htmlFor="market_opportunity">Market Opportunity</Label>
                  <textarea
                    id="market_opportunity"
                    name="market_opportunity"
                    rows={3}
                    value={formData.market_opportunity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-lg font-sans"
                  />
                </div>

                {/* Team Description */}
                <div>
                  <Label htmlFor="team_description">Team</Label>
                  <textarea
                    id="team_description"
                    name="team_description"
                    rows={3}
                    value={formData.team_description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-lg font-sans"
                  />
                </div>

                {/* Tags */}
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="innovation, startup, tech (comma-separated)"
                    value={formData.tags}
                    onChange={handleChange}
                  />
                </div>

                {/* WhatsApp Group URL */}
                <div>
                  <Label htmlFor="whatsapp_group_url">WhatsApp Group Link (Optional)</Label>
                  <Input
                    id="whatsapp_group_url"
                    name="whatsapp_group_url"
                    type="url"
                    placeholder="https://chat.whatsapp.com/..."
                    value={formData.whatsapp_group_url}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground mt-2">Share your WhatsApp group invite link for community collaboration</p>
                </div>

                {/* Founder Year / Program */}
                <div>
                  <Label htmlFor="founder_program">Founder Year / Program</Label>
                  <Input
                    id="founder_program"
                    name="founder_program"
                    placeholder="e.g. 3rd Year B.Tech CSE"
                    value={formData.founder_program}
                    onChange={handleChange}
                  />
                </div>

                {/* Mentor Assigned */}
                <div>
                  <Label htmlFor="mentor_assigned">Mentor Assigned</Label>
                  <Input
                    id="mentor_assigned"
                    name="mentor_assigned"
                    placeholder="Mentor name (optional)"
                    value={formData.mentor_assigned}
                    onChange={handleChange}
                  />
                </div>

                {/* Achievements / Traction */}
                <div>
                  <Label htmlFor="achievements">Achievements / Traction</Label>
                  <textarea
                    id="achievements"
                    name="achievements"
                    placeholder="Milestones, users, revenue, competitions won, etc."
                    rows={3}
                    value={formData.achievements}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-lg font-sans"
                  />
                </div>

                {/* Skills Needed */}
                <div>
                  <Label htmlFor="skills_needed">Skills Needed</Label>
                  <Input
                    id="skills_needed"
                    name="skills_needed"
                    placeholder="frontend, marketing, ai (comma-separated)"
                    value={formData.skills_needed}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground mt-2">Separate skills with commas</p>
                </div>

                {/* Call to Action */}
                <div>
                  <Label htmlFor="call_to_action">Call to Action Text</Label>
                  <Input
                    id="call_to_action"
                    name="call_to_action"
                    placeholder="Join us to build the future of edtech!"
                    value={formData.call_to_action}
                    onChange={handleChange}
                  />
                </div>

                {/* Logo URL */}
                <div>
                  <Label htmlFor="logo_url">Logo Image URL</Label>
                  <Input
                    id="logo_url"
                    name="logo_url"
                    type="url"
                    placeholder="https://.../logo.png"
                    value={formData.logo_url}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground mt-2">Provide a direct image URL. Leave blank to use a placeholder.</p>
                </div>

                {/* Stage */}
                <div>
                  <Label htmlFor="stage">Stage *</Label>
                  <select
                    id="stage"
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-border rounded-lg font-sans"
                  >
                    <option value="Ideation">Ideation</option>
                    <option value="Prototype">Prototype</option>
                    <option value="MVP">MVP</option>
                    <option value="Market-ready">Market-ready</option>
                  </select>
                </div>

                <div className="border-t pt-6">
                  <Label className="text-base font-semibold mb-4 block">Supporting Materials</Label>
                  <FileUpload ideaId={unwrappedParams.id} onFileUploaded={handleFileUploaded} disabled={isSubmitting} />
                </div>

                {/* Files Section */}
                {files.length > 0 && (
                  <div>
                    <Label>Attached Files</Label>
                    <div className="space-y-2 mt-2">
                      {files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium text-foreground">{file.file_name}</p>
                            <p className="text-xs text-muted-foreground">{(file.file_size / 1024).toFixed(2)} KB</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteFile(file.id)}
                            className="text-error hover:bg-error/10 p-2 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {error && <p className="text-sm text-error">{error}</p>}

                <div className="flex gap-3 flex-wrap">
                  <Button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    variant="outline"
                    disabled={isSubmitting}
                  >
                    Save Draft
                  </Button>
                  <Button type="button" onClick={(e) => handleSubmit(e, false)} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit for Review"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
