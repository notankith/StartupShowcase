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

      const { data, error: submitError } = await supabase
        .from("ideas")
        .insert({
          user_id: user.id,
          title: formData.title,
          problem_statement: formData.problem_statement,
          solution: formData.solution,
          market_opportunity: formData.market_opportunity,
          team_description: formData.team_description,
          category: formData.category,
          tags: tags,
          status: "draft",
        })
        .select()
        .single()

      if (submitError) throw submitError

      router.push(`/dashboard/ideas/${data.id}/edit`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create idea")
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
