import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Calendar, MapPin, ExternalLink } from "lucide-react"

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .order('event_date', { ascending: true })

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-700 text-xs font-semibold tracking-wide uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Upcoming
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-3">
            Events &amp;{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Workshops</span>
          </h1>
          <p className="text-lg text-foreground/60 max-w-lg">
            Upcoming and past events from the Incubation Centre
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {error && (
            <div className="col-span-full p-4 rounded-xl border border-border/60 bg-muted/30 text-sm">
              <p className="font-medium text-foreground mb-1">Events not available yet</p>
              <p className="text-muted-foreground">{error.message}</p>
            </div>
          )}
          {(events || []).map((e: any) => {
            const eventDate = new Date(e.event_date)
            const isPast = eventDate < new Date()

            return (
              <Card key={e.id} className={`h-full card-hover rounded-2xl border-border/60 overflow-hidden ${isPast ? "opacity-70" : ""}`}>
                {/* Top accent bar */}
                <div className={`h-1 ${isPast ? "bg-muted" : "bg-gradient-to-r from-emerald-500 to-teal-400"}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl font-bold">{e.title}</CardTitle>
                      {e.location && (
                        <CardDescription className="flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {e.location}
                        </CardDescription>
                      )}
                    </div>
                    {isPast && (
                      <span className="shrink-0 text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                        Past
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium mb-3">
                    <Calendar className="w-4 h-4" />
                    {eventDate.toLocaleString(undefined, {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  {e.description && (
                    <p className="text-foreground/80 text-sm whitespace-pre-wrap mb-4 leading-relaxed line-clamp-3">{e.description}</p>
                  )}
                  <div className="flex gap-3">
                    {e.registration_link && !isPast && (
                      <a
                        href={e.registration_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all duration-200 hover:bg-emerald-700 hover:-translate-y-0.5"
                      >
                        Register
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {(!events || events.length === 0) && !error && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100/80 flex items-center justify-center mb-4">
                <Calendar className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No events yet</h3>
              <p className="text-muted-foreground text-sm">Check back soon for upcoming events and workshops.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
