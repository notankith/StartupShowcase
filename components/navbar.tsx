"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useMemo, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { signOut } from "@/lib/supabase/auth"
import { Menu, X } from "lucide-react"

const NAV_ITEMS = [
  { href: "/browse", label: "Startups" },
  { href: "/events", label: "Events" },
  { href: "/#about", label: "About Us" },
  { href: "mailto:Incubation@gcu.edu.in", label: "Contact", external: true },
]

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  async function ensureUserPresent() {
    for (let i = 0; i < 3; i++) {
      try {
        const { data: { user: u } = { data: { user: null } } } = await supabase.auth.getUser()
        if (u) return u
      } catch { /* ignore */ }
      await new Promise((r) => setTimeout(r, 200))
    }
    return null
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const handleLogout = useCallback(async () => {
    await signOut()
    router.push("/")
    setUser(null)
  }, [router])

  const handleSubmitIdea = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    const u = await ensureUserPresent()
    if (u) {
      if (u.role === "admin") window.location.href = "/admin"
      else window.location.href = "/dashboard/ideas/new"
    } else {
      router.push("/auth/login")
    }
  }, [router])

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl shadow-sm border-b border-border/50"
          : "bg-background/95 backdrop-blur border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/placeholder-logo.png"
              alt="Logo"
              width={36}
              height={36}
              className="rounded-lg transition-transform duration-200 group-hover:scale-105"
            />
            <span className="font-bold text-lg text-foreground tracking-tight hidden sm:inline">
              StartupShowcase
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, external }) =>
              external ? (
                <a
                  key={label}
                  href={href}
                  className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground rounded-lg hover:bg-foreground/5 transition-all duration-200"
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={label}
                  href={href}
                  className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground rounded-lg hover:bg-foreground/5 transition-all duration-200"
                >
                  {label}
                </Link>
              )
            )}
          </div>

          {/* Desktop Right */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground rounded-lg hover:bg-foreground/5 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm text-foreground/70 hover:text-foreground rounded-lg hover:bg-foreground/5 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground rounded-lg hover:bg-foreground/5 transition"
              >
                Log In
              </Link>
            )}
            <a
              href="/dashboard/ideas/new"
              onClick={handleSubmitIdea}
              className="px-5 py-2 text-sm font-semibold rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              Submit your idea
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen((s) => !s)}
            className="lg:hidden p-2 rounded-lg hover:bg-foreground/5 transition"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 pt-2 space-y-1 bg-background/95 backdrop-blur-xl border-t border-border/30">
          {NAV_ITEMS.map(({ href, label, external }) =>
            external ? (
              <a
                key={label}
                href={href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-foreground/5 transition"
              >
                {label}
              </a>
            ) : (
              <Link
                key={label}
                href={href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-foreground/5 transition"
              >
                {label}
              </Link>
            )
          )}

          <div className="pt-2 border-t border-border/30 space-y-1">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-foreground/5 transition">
                  Dashboard
                </Link>
                <button
                  onClick={() => { setIsOpen(false); handleLogout(); }}
                  className="block w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-foreground/5 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-foreground/5 transition">
                  Log In
                </Link>
                <Link href="/auth/sign-up" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-foreground/5 transition">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <a
            href="/dashboard/ideas/new"
            onClick={(e) => { setIsOpen(false); handleSubmitIdea(e); }}
            className="block w-full text-center mt-2 px-5 py-2.5 text-sm font-semibold rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition cursor-pointer"
          >
            Submit your idea
          </a>
        </div>
      </div>
    </nav>
  )
}
