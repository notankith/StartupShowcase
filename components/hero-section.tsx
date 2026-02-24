"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export function HeroSection({ user }: { user: any }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-white to-violet-50/40 pointer-events-none" />
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <div
            className={`space-y-6 transition-all duration-700 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-700 text-xs font-semibold tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Now accepting ideas
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-extrabold leading-[1.08] tracking-tight text-foreground">
              The startup{" "}<br className="hidden sm:block" />
              experience{" "}<br className="hidden lg:block" />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent font-black">
                transformation
              </span>{" "}
              partner
            </h1>

            <p className="text-lg sm:text-xl text-foreground/55 max-w-xl leading-relaxed">
              GCUIF accelerates innovation and real-world execution with AI-fueled mentorship, expert teams, and hands-on support.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                href={user ? "/dashboard/ideas/new" : "/auth/sign-up"}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 transition-all duration-200 hover:-translate-y-0.5"
              >
                Submit your idea!
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/browse"
                className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold rounded-full text-foreground/70 hover:text-foreground border border-border/60 hover:border-border hover:bg-foreground/5 transition-all duration-200"
              >
                View Startups
              </Link>
            </div>
          </div>

          {/* Right: Abstract graphic */}
          <div
            className={`relative transition-all duration-700 delay-200 ease-out ${
              mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
            }`}
          >
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Concentric animated rings */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-200/40 to-teal-100/30 animate-[pulse_4s_ease-in-out_infinite]" />
              <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-violet-200/30 to-emerald-100/40 animate-[pulse_5s_ease-in-out_infinite_0.5s]" />
              <div className="absolute inset-12 rounded-full bg-gradient-to-br from-emerald-100/50 to-white/60 backdrop-blur-sm" />
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-2xl bg-white/80 shadow-xl shadow-emerald-600/10 flex items-center justify-center backdrop-blur">
                  <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                </div>
              </div>
              {/* Floating dots */}
              <div className="absolute top-8 right-12 w-3 h-3 rounded-full bg-emerald-400/60 animate-bounce" style={{ animationDelay: "0s", animationDuration: "3s" }} />
              <div className="absolute bottom-16 left-8 w-2 h-2 rounded-full bg-violet-400/60 animate-bounce" style={{ animationDelay: "1s", animationDuration: "4s" }} />
              <div className="absolute top-1/3 right-4 w-2.5 h-2.5 rounded-full bg-teal-300/60 animate-bounce" style={{ animationDelay: "0.5s", animationDuration: "3.5s" }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
