import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Authentication Error
        </h1>
        <p className="mt-3 text-muted-foreground">
          Something went wrong during authentication. Please try again or
          contact support if the issue persists.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/">Go Home</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/login">Try Again</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
