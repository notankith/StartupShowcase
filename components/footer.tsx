import Link from "next/link"

export function Footer() {
  return (
    <footer className="relative border-t border-border/40 bg-gradient-to-b from-background to-muted/30 text-foreground mt-16">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        <div>
          <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-4">Navigation</h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/" className="text-foreground/70 hover:text-emerald-600 transition-colors duration-200">Home</Link>
            </li>
            <li>
              <Link href="/browse" className="text-foreground/70 hover:text-emerald-600 transition-colors duration-200">Startups</Link>
            </li>
            <li>
              <Link href="/events" className="text-foreground/70 hover:text-emerald-600 transition-colors duration-200">Events</Link>
            </li>
            <li>
              <Link href="/dashboard/ideas/new" className="text-foreground/70 hover:text-emerald-600 transition-colors duration-200">Submit Idea</Link>
            </li>
            <li>
              <a href="mailto:Incubation@gcu.edu.in" className="text-foreground/70 hover:text-emerald-600 transition-colors duration-200">Contact Us</a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-4">Contact</h3>
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-medium text-foreground/80 text-xs uppercase tracking-wide mb-1">Phone</div>
              <div className="space-y-1">
                <a href="tel:+919738785942" className="text-foreground/70 hover:text-emerald-600 transition-colors duration-200 block">+91 9738785942</a>
                <a href="tel:+919113000357" className="text-foreground/70 hover:text-emerald-600 transition-colors duration-200 block">+91 9113000357</a>
              </div>
            </div>
            <div className="pt-1">
              <div className="font-medium text-foreground/80 text-xs uppercase tracking-wide mb-1">Email</div>
              <a href="mailto:Incubation@gcu.edu.in" className="text-foreground/70 hover:text-emerald-600 transition-colors duration-200">Incubation@gcu.edu.in</a>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-4">Address</h3>
          <address className="not-italic text-sm leading-relaxed text-foreground/70">
            Incubation Office, Garden City University – Campus
            <br />
            16th KM, Old Madras Road, Bangalore – 560 049
          </address>
        </div>
      </div>

      <div className="border-t border-border/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-muted-foreground flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} Garden City University Incubation</span>
          <a href="https://ankith.studio" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors duration-200">ankith.studio</a>
        </div>
      </div>
    </footer>
  )
}
