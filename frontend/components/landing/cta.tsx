"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export function CTA() {
  return (
    <section id="about" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-primary px-8 py-16 text-center md:px-16 md:py-24"
        >
          <div className="pointer-events-none absolute inset-0 -z-0">
            <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-primary-foreground/5 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-primary-foreground/5 blur-3xl" />
          </div>

          <div className="relative z-10">
            <h2 className="mx-auto max-w-2xl text-balance font-display text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
              Ready to Transform Your Health?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-primary-foreground/80">
              Join thousands of users who have already started their wellness
              journey with ArogyaMitra. Your AI health companion is waiting.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 px-8"
                asChild
              >
                <Link href="/auth/sign-up">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-primary-foreground/60">
              No credit card required. Start your free health assessment today.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
