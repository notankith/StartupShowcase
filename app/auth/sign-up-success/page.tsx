import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="w-full max-w-sm">
      <Card>
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-success/10 p-3">
              <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription>We&apos;ve sent a confirmation link to your email address</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-neutral-dark">
            Please click the confirmation link in your email to verify your account and get started.
          </p>
          <Button asChild className="w-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
