"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { signOut } from "@/lib/supabase/auth"
import { LayoutDashboard, CheckCircle, BarChart3, Users, LogOut } from "lucide-react"

export function AdminNavbar() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/moderate", label: "Moderation Queue", icon: CheckCircle },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/users", label: "Users", icon: Users },
  ]

  return (
    <nav className="bg-neutral-dark text-white sticky top-0 z-40 border-b border-neutral-dark/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/admin" className="font-bold text-xl">
            StartupShowcase Admin
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                  pathname === href ? "bg-primary text-white" : "text-gray-300 hover:bg-neutral-dark/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-error text-white hover:bg-error/90 transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  )
}
