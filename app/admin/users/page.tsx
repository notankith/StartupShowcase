"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminNavbar } from "@/components/admin-navbar"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUsers = async () => {
        try {
        const res = await fetch('/api/admin/users')
        const text = await res.text().catch(() => '')
        let json: any = null
        try {
          json = text ? JSON.parse(text) : null
        } catch (e) {
          // invalid JSON
        }

        if (!res.ok) {
          console.error('Error loading users (api):', { status: res.status, json, text })
          setLoading(false)
          return
        }

        setUsers((json && json.users) || [])
      } catch (err) {
        console.error('Unexpected error loading users (api):', err)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <AdminNavbar />

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground">Users</h1>
            <p className="text-muted-foreground">Platform users and their activity</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-3 py-2 sm:px-6 sm:py-4 text-left text-sm font-semibold text-foreground">Name</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-4 text-left text-sm font-semibold text-foreground">Email</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-4 text-left text-sm font-semibold text-foreground">Role</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-4 text-left text-sm font-semibold text-foreground">Ideas</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-4 text-left text-sm font-semibold text-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50 transition">
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-sm text-foreground">{user.full_name || user.email || "N/A"}</td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-sm text-foreground">{user.email}</td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.role === "admin" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-foreground"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-sm text-foreground">{user.ideas?.[0]?.count || 0}</td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
