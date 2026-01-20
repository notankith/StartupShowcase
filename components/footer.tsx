import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background text-foreground mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Navigation</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:underline">Home</Link>
            </li>
            <li>
              <Link href="/browse" className="hover:underline">Startups</Link>
            </li>
            <li>
              <Link href="/events" className="hover:underline">Events</Link>
            </li>
            <li>
              <Link href="/dashboard/ideas/new" className="hover:underline">Submit Idea</Link>
            </li>
            <li>
              <a href="mailto:Incubation@gcu.edu.in" className="hover:underline">Contact Us</a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Contact</h3>
          <div className="space-y-2 text-sm">
            <div>
              <div className="font-medium">Phone:</div>
              <div className="mt-1 space-y-1">
                <a href="tel:+919738785942" className="hover:underline block">+91 9738785942</a>
                <a href="tel:+919113000357" className="hover:underline block">+91 9113000357</a>
              </div>
            </div>
            <div className="pt-2">
              <div className="font-medium">Email:</div>
              <a href="mailto:Incubation@gcu.edu.in" className="hover:underline">Incubation@gcu.edu.in</a>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Address</h3>
          <address className="not-italic text-sm leading-relaxed text-foreground/90">
            Incubation Office, Garden City University – Campus
            <br />
            16th KM, Old Madras Road, Bangalore – 560 049
          </address>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-muted-foreground flex items-center justify-between">
          <span>© {new Date().getFullYear()} Garden City University Incubation</span>
         <a href="https://ankith.studio" target="_blank" rel="noopener noreferrer">ankith.studio</a>

        </div>
      </div>
    </footer>
  )
}
