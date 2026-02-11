import Link from "next/link"
import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/20 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">
              ArogyaMitra
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="#features" className="transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="#how-it-works" className="transition-colors hover:text-foreground">
              How It Works
            </Link>
            <Link href="#about" className="transition-colors hover:text-foreground">
              About
            </Link>
            <Link href="/auth/login" className="transition-colors hover:text-foreground">
              Log In
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ArogyaMitra. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
