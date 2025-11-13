"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { signOut } from "@/lib/supabase/auth"

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const handleLogout = async () => {
    await signOut()
    router.push("/")
    setUser(null)
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-neutral-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-bold text-xl text-primary hover:text-primary/80">
            StartupShowcase
          </Link>

          <div className="hidden md:flex items-center gap-3 flex-nowrap">
            {user && (
              <Link href="/dashboard" className="text-foreground hover:text-primary transition whitespace-nowrap">
                Dashboard
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-neutral-dark truncate max-w-32">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="px-2 py-1 text-sm sm:px-3 sm:py-1.5 rounded-md bg-primary text-white hover:bg-primary/90 transition whitespace-nowrap"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="px-2 py-1 text-sm sm:px-3 sm:py-1.5 text-primary hover:bg-primary/10 rounded-md transition whitespace-nowrap">
                  Log In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="px-2 py-1 text-sm sm:px-3 sm:py-1.5 rounded-md bg-primary text-white hover:bg-primary/90 transition whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger - show on small screens only */}
          <button onClick={() => setIsOpen((s) => !s)} className="md:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Mobile menu drawer */}
          {isOpen && (
            <div className="fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/30" onClick={() => setIsOpen(false)} />
              <div className="absolute right-0 top-0 mt-16 mr-4 w-56 bg-background rounded-md shadow-lg p-3">
                <nav className="flex flex-col gap-2">
                  {user ? (
                    <>
                      <Link href="/dashboard/ideas/new" className="px-3 py-2 rounded-md hover:bg-muted/50">Create Idea</Link>
                      <a href={`mailto:support@startupshowcaseportal.com`} className="px-3 py-2 rounded-md hover:bg-muted/50">Mail</a>
                      <button onClick={() => { setIsOpen(false); handleLogout(); }} className="text-left px-3 py-2 rounded-md hover:bg-muted/50">Logout</button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" className="px-3 py-2 rounded-md hover:bg-muted/50">Log In</Link>
                      <Link href="/auth/sign-up" className="px-3 py-2 rounded-md hover:bg-muted/50">Sign Up</Link>
                      <a href={`mailto:support@startupshowcaseportal.com`} className="px-3 py-2 rounded-md hover:bg-muted/50">Mail</a>
                    </>
                  )}
                </nav>
              </div>
            </div>
          )}
        </div>

        {/* Mobile menu removed per design — links are shown inline without a hamburger */}
      </div>
    </nav>
  )
}
