"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminNavbar } from "@/components/admin-navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { TrendingUp, Eye, CheckCircle, Clock } from "lucide-react"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalIdeas: 0,
    approvedIdeas: 0,
    pendingIdeas: 0,
    featuredIdeas: 0,
    totalUsers: 0,
    contactRequests: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const supabase = createClient()

        const [
          { count: totalIdeas },
          { count: approvedIdeas },
          { count: pendingIdeas },
          { count: featuredIdeas },
          { count: totalUsers },
          { count: contactRequests },
        ] = await Promise.all([
          supabase.from("ideas").select("id", { count: "exact" }),
          supabase.from("ideas").select("id", { count: "exact" }).eq("status", "approved"),
          supabase.from("ideas").select("id", { count: "exact" }).eq("status", "submitted"),
          supabase.from("ideas").select("id", { count: "exact" }).eq("is_featured", true),
          supabase.from("profiles").select("id", { count: "exact" }),
          supabase.from("contact_requests").select("id", { count: "exact" }),
        ])

        setStats({
          totalIdeas: totalIdeas || 0,
          approvedIdeas: approvedIdeas || 0,
          pendingIdeas: pendingIdeas || 0,
          featuredIdeas: featuredIdeas || 0,
          totalUsers: totalUsers || 0,
          contactRequests: contactRequests || 0,
        })
      } catch (error) {
        console.error("Error loading stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <AdminNavbar />

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform overview and moderation tools</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Total Ideas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats.totalIdeas}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      Approved Ideas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-success">{stats.approvedIdeas}</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {stats.totalIdeas > 0
                        ? `${((stats.approvedIdeas / stats.totalIdeas) * 100).toFixed(1)}% of total`
                        : "N/A"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      Under Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-500">{stats.pendingIdeas}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-black">
                      <Eye className="w-4 h-4 text-accent" />
                      Featured Ideas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-black">{stats.featuredIdeas}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">{stats.totalUsers}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Contact Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats.contactRequests}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link
                      href="/admin/moderate"
                      className="block p-3 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition font-medium"
                    >
                      Review Pending Ideas ({stats.pendingIdeas})
                    </Link>
                    <Link
                      href="/admin/users"
                      className="block p-3 bg-secondary/10 text-foreground rounded-lg hover:bg-secondary/20 transition font-medium"
                    >
                      Manage Users
                    </Link>
                    <Link
                      href="/admin/events"
                      className="block p-3 bg-accent/10 text-foreground rounded-lg hover:bg-accent/20 transition font-medium"
                    >
                      Manage Events
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Platform Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Approval Rate</span>
                        <span className="text-sm text-muted-foreground">
                          {stats.totalIdeas > 0
                            ? `${((stats.approvedIdeas / stats.totalIdeas) * 100).toFixed(1)}%`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-success h-2 rounded-full transition-all"
                          style={{
                            width: stats.totalIdeas > 0 ? `${(stats.approvedIdeas / stats.totalIdeas) * 100}%` : "0%",
                          }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
