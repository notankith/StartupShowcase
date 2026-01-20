"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

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

export default function NewIdeaPage() {
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
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const skillsNeeded = formData.skills_needed
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      // Call server API to create an idea (server-side uses MongoDB)
      const res = await fetch("/api/ideas", {
        method: "POST",
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
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload?.error || `Create failed (${res.status})`)
      }

      const payload = await res.json()
      const created = payload.data
      router.push(`/dashboard/ideas/${created._id}/edit`)
    } catch (err) {
      // Surface more detailed Supabase/Postgres error info for debugging
      console.error("Create idea failed:", err)
      let message = "Failed to create idea"
      if (err && typeof err === "object") {
        const anyErr = err as any
        if (typeof anyErr.message === "string") message = anyErr.message
        // Include details if available (PostgrestError provides details property)
        if (typeof anyErr.details === "string" && anyErr.details.length) {
          message += `: ${anyErr.details}`
        }
        if (typeof anyErr.hint === "string" && anyErr.hint.length) {
          message += ` (Hint: ${anyErr.hint})`
        }
        if (typeof anyErr.code === "string" && anyErr.code.length) {
          message += ` [Code: ${anyErr.code}]`
          if (anyErr.code === 'PGRST204') {
            message += `\nFix: Run migration in Supabase SQL Editor -> ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS whatsapp_group_url TEXT; then in Dashboard Settings > API click 'Reload schema cache'.`
          }
        }
      }
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:underline text-sm mb-8">
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Create New Idea</CardTitle>
              <CardDescription>Share your startup idea with the community</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Idea Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="A catchy title for your startup"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
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
                    placeholder="Describe the problem your idea solves"
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
                    placeholder="Explain your solution"
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
                    placeholder="Describe the market size and opportunity"
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
                    placeholder="Tell us about your team members and their roles"
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
                  <p className="text-xs text-muted-foreground mt-2">Separate tags with commas</p>
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

                {error && <p className="text-sm text-error">{error}</p>}

                <div className="flex gap-3">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Creating..." : "Create Idea"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push("/dashboard")} className="flex-1">
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
