"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { signOut } from "@/lib/supabase/auth"
import { LayoutDashboard, CheckCircle, BarChart3, Users, CalendarDays, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"

export function AdminNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/moderate", label: "Moderation", icon: CheckCircle },
    { href: "/admin/events", label: "Events", icon: CalendarDays },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/users", label: "Users", icon: Users },
  ]

  return (
    <nav className="bg-foreground text-background sticky top-0 z-50 border-b border-foreground/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link href="/admin" className="font-bold text-base tracking-tight">
            Admin
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                  pathname === href
                    ? "bg-white/15 text-white font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-red-500/20 text-red-300 hover:bg-red-500/30 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>

            {/* Mobile toggle */}
            <button
              onClick={() => setOpen((s) => !s)}
              className="md:hidden p-1.5 rounded-lg hover:bg-white/10 transition"
              aria-label="Toggle nav"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-3 pt-1 space-y-1 border-t border-white/10">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition ${
                pathname === href ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          <button
            onClick={() => { setOpen(false); handleLogout(); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg text-red-300 hover:bg-red-500/20 transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  )
}
