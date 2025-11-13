"use client"

import React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ContactPage({ params }: { params: any }) {
  // `params` can be a Promise in Next 16+ when passed into a client component.
  // Unwrap it with React.use() when available.
  const unwrappedParams = typeof (React as any).use === "function" ? (React as any).use(params) : params
  const [senderName, setSenderName] = useState("")
  const [senderEmail, setSenderEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error: submitError } = await supabase.from("contact_requests").insert({
        idea_id: unwrappedParams.id,
        sender_name: senderName,
        sender_email: senderEmail,
        message: message || null,
      })

      if (submitError) throw submitError

      setSuccess(true)
  setTimeout(() => router.push(`/ideas/${unwrappedParams.id}`), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-success/10 p-3">
                  <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <CardTitle>Interest Expressed</CardTitle>
              <CardDescription>Your message has been sent successfully</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <Link href={`/ideas/${unwrappedParams.id}`} className="text-primary hover:underline text-sm mb-6 inline-block">
            ← Back to Idea
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Express Your Interest</CardTitle>
              <CardDescription>Connect with the founder about this startup idea</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Your Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message (Optional)</Label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Tell them why you're interested..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg font-sans"
                  />
                </div>

                {error && <p className="text-sm text-error">{error}</p>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Express Interest"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
