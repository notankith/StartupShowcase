"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { IdeaGridCard } from "@/components/idea-grid-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

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

export default function BrowsePage() {
  const [ideas, setIdeas] = useState<any[]>([])
  const [filteredIdeas, setFilteredIdeas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    const fetchIdeas = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching ideas:", error)
      } else {
        setIdeas(data || [])
        setFilteredIdeas(data || [])
      }
      setLoading(false)
    }

    fetchIdeas()
  }, [])

  useEffect(() => {
    let result = ideas

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (idea) => idea.title.toLowerCase().includes(query) || idea.problem_statement.toLowerCase().includes(query),
      )
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter((idea) => idea.category === selectedCategory)
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      result = result.filter((idea) => selectedTags.some((tag) => (idea.tags || []).includes(tag)))
    }

    setFilteredIdeas(result)
  }, [searchQuery, selectedCategory, selectedTags, ideas])

  const allTags = Array.from(new Set(ideas.flatMap((idea) => idea.tags || []))) as string[]

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory(null)
    setSelectedTags([])
  }

  const hasActiveFilters = searchQuery || selectedCategory || selectedTags.length > 0

  const [showFilters, setShowFilters] = useState(false)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-700 text-xs font-semibold tracking-wide uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Explore
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-3">
              Browse Startup{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Ideas</span>
            </h1>
            <p className="text-lg text-foreground/60 max-w-lg">
              Discover innovative ideas from our community of student entrepreneurs
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8 relative animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title or problem..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-base rounded-xl border-border/60 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Ideas Grid (first on mobile) */}
            <div className="lg:col-span-3">
              {/* Mobile: Filters button and clear */}
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="font-semibold text-foreground">Ideas</h3>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(true)}
                    className="px-3 py-1.5 text-sm rounded-md bg-muted text-foreground hover:bg-muted/80"
                  >
                    Filters
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
              ) : filteredIdeas.length > 0 ? (
                <>
                  <div className="mb-4 text-sm text-muted-foreground">
                    Showing {filteredIdeas.length} of {ideas.length} ideas
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredIdeas.map((idea) => (
                      <IdeaGridCard
                        key={idea.id}
                        id={idea.id}
                        title={idea.title}
                        problem={idea.problem_statement}
                        category={idea.category}
                        tags={idea.tags || []}
                        featured={idea.is_featured}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg
                    className="w-12 h-12 text-muted-foreground mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No ideas found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or search query</p>
                  {hasActiveFilters && (
                    <Button onClick={clearFilters} variant="outline" className="mt-4 bg-transparent">
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar Filters (visible on lg+) */}
            <div className="hidden lg:block lg:col-span-1 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Filters</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground text-sm">Category</h4>
                <div className="space-y-2">
                  {CATEGORIES.map((category) => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategory === category}
                        onChange={(e) => setSelectedCategory(e.target.checked ? category : null)}
                        className="rounded border-border"
                      />
                      <span className="text-sm text-foreground">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              {allTags.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground text-sm">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 8).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-3 py-1.5 rounded-full transition-all duration-200 ${
                          selectedTags.includes(tag)
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-muted text-foreground hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Filters Overlay */}
          {showFilters && (
            <div className="fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
              <div className="relative bg-background w-full max-w-xs p-4 overflow-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="text-sm text-primary">Close</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground text-sm">Category</h4>
                      <div className="space-y-2">
                        {CATEGORIES.map((category) => (
                          <label key={category} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedCategory === category}
                              onChange={(e) => setSelectedCategory(e.target.checked ? category : null)}
                              className="rounded border-border"
                            />
                            <span className="text-sm text-foreground">{category}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {allTags.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-foreground text-sm">Tags</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {allTags.slice(0, 8).map((tag) => (
                            <button
                              key={tag}
                              onClick={() => toggleTag(tag)}
                              className={`text-xs px-3 py-1.5 rounded-full transition ${
                                selectedTags.includes(tag)
                                  ? "bg-primary text-white"
                                  : "bg-muted text-foreground hover:bg-muted/80"
                              }`}
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex items-center gap-2">
                      <Button onClick={() => { clearFilters(); setShowFilters(false); }} variant="outline">Clear</Button>
                      <Button onClick={() => setShowFilters(false)}>Apply</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
