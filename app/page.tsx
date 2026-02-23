import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { FeaturedCard } from "@/components/featured-card"
import { HeroSection } from "@/components/hero-section"
import { TrustSection } from "@/components/trust-section"
import { JourneySection } from "@/components/journey-section"
import Link from "next/link"

async function getFeaturedIdeas() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .eq("status", "approved")
    .eq("is_featured", true)
    .limit(6)

  if (error) {
    console.error("Error fetching featured ideas:", error)
    return []
  }

  return data || []
}

async function getUpcomingEvents() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("event_date", { ascending: true })

  if (error) {
    console.error("Error fetching events:", error)
    return []
  }

  return data || []
}

export default async function Home() {
  const featuredIdeas = await getFeaturedIdeas()
  const upcomingEvents = await getUpcomingEvents()
  const supabase = await createClient()
  const { data: { user } = { data: { user: null } } } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <HeroSection user={user} />

      {/* Trust / Metrics */}
      <TrustSection />

      {/* Journey */}
      <JourneySection />

      {/* Featured Ideas + Events Section */}
      {(featuredIdeas.length > 0 || upcomingEvents.length > 0) && (
        <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-neutral-light/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">Featured Ideas</h2>
                    <p className="text-foreground/60 max-w-xl">
                      Check out some of the most exciting startup ideas from our community.
                    </p>
                  </div>
                  <Link
                    href="/browse"
                    className="inline-block px-5 py-2 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition"
                  >
                    View All Ideas
                  </Link>
                </div>
                {featuredIdeas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredIdeas.map((idea: any) => (
                      <FeaturedCard
                        key={idea.id}
                        id={idea.id}
                        title={idea.title}
                        problem={idea.problem_statement}
                        category={idea.category}
                        tags={idea.tags || []}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-white/70 p-10 text-center text-muted-foreground">
                    No featured ideas yet. Check back soon!
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-border/40 bg-white/80 shadow-sm p-6 backdrop-blur-sm">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-foreground">Upcoming Events</h3>
                    <p className="text-sm text-foreground/50">Join our next sessions and meet fellow builders.</p>
                  </div>
                  <Link href="/events" className="text-sm font-semibold text-emerald-600 hover:underline whitespace-nowrap">
                    View all
                  </Link>
                </div>

                {upcomingEvents.length > 0 ? (
                  <div className="space-y-5">
                    {upcomingEvents.map((event: any) => (
                      <div key={event.id} className="rounded-xl border border-border/60 p-4 bg-background/80 hover:shadow-sm transition">
                        <div className="text-xs uppercase tracking-wide text-foreground/40 mb-1">
                          {new Date(event.event_date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <h4 className="text-lg font-semibold text-foreground mb-1">{event.title}</h4>
                        {event.location && <p className="text-sm text-foreground/50 mb-2">{event.location}</p>}
                        {event.description && (
                          <p className="text-sm text-foreground/60 line-clamp-3 mb-3">{event.description}</p>
                        )}
                        {event.registration_link && (
                          <a
                            href={event.registration_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                          >
                            Register
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                    No upcoming events yet. Keep an eye on this space!
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About / CTA Section */}
      <section id="about" className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 scroll-mt-20">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8 md:p-14 border border-emerald-100/60 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Share Your Idea?</h2>
          <p className="text-foreground/60 mb-8 max-w-xl mx-auto">
            Join our community of student innovators and get your startup idea in front of mentors, investors, and
            collaborators.
          </p>
          <Link
            href={user ? "/dashboard/ideas/new" : "/auth/sign-up"}
            className="inline-flex items-center px-8 py-3 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
          >
            Get Started Free
            <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  )
}
