"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  RefreshCw,
  Heart,
  Layers,
  Play,
  Youtube,
  Calendar,
  UtensilsCrossed,
  Sparkles,
  Video,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { VIDEOS } from "@/lib/videos"

const FEATURE_PANELS = [
  {
    key: "adaptive",
    icon: RefreshCw,
    title: "Real-Time Adaptive AI",
    description:
      "The system instantly modifies workouts and meal plans when you travel, experience injuries, or have limited time. Plans evolve with your daily reality.",
    visual: "adjust" as const,
  },
  {
    key: "charity",
    icon: Heart,
    title: "Charity-Driven Motivation",
    description:
      "Calories burned, workouts completed, and goals achieved convert into virtual charitable contributions. Your progress creates collective impact.",
    visual: "progress" as const,
  },
  {
    key: "ecosystem",
    icon: Layers,
    title: "Hyper-Personalized Ecosystem",
    description:
      "AI generates tailored seven-day plans using advanced language modeling and connects seamlessly with exercise videos, recipes, and scheduling tools.",
    visual: "integrated" as const,
  },
]

const INTEGRATION_ICONS = [
  { icon: Youtube, label: "Exercise guidance" },
  { icon: UtensilsCrossed, label: "Nutrition inspiration" },
  { icon: Calendar, label: "Schedule integration" },
]

function AromiPresence() {
  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
      {/* Outer waveform rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-waveform absolute h-12 w-12 rounded-full border-2 border-primary/30" />
        <div className="absolute h-16 w-16 animate-waveform rounded-full border border-primary/20 [animation-delay:500ms]" />
      </div>
      {/* Glowing orb core */}
      <div className="animate-glow-orb relative h-10 w-10 rounded-full bg-gradient-to-br from-primary/90 to-primary/70" />
    </div>
  )
}

function AdaptiveVisual() {
  return (
    <div className="mt-3 flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-1.5 rounded-full bg-primary/30"
          initial={{ width: 8 }}
          animate={{ width: [8, 14, 8] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
      <RefreshCw className="ml-1 h-3.5 w-3.5 animate-adjust-pulse text-primary/70" strokeWidth={2} />
    </div>
  )
}

function CharityProgressVisual() {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Community impact this week</span>
        <span className="font-medium text-primary">68%</span>
      </div>
      <Progress value={68} className="h-2 bg-muted/80" />
      <p className="text-xs text-muted-foreground">
        Your workouts contribute to health charities
      </p>
    </div>
  )
}

function EcosystemIcons() {
  const icons = [
    { Icon: Video, label: "Videos" },
    { Icon: UtensilsCrossed, label: "Recipes" },
    { Icon: Calendar, label: "Schedule" },
  ]
  return (
    <div className="mt-3 flex items-center gap-3">
      {icons.map(({ Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1.5"
        >
          <Icon className="h-3.5 w-3.5 text-primary/80" strokeWidth={1.5} />
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  )
}

export function ArogyaMitraSection() {
  return (
    <section id="videos" className="relative px-4 py-12 md:px-6 md:py-16 lg:py-20">
      {/* Ambient background with subtle gradient motion */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute -right-20 top-1/2 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary/4 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-b from-card/98 via-card/95 to-card/90 shadow-2xl shadow-primary/[0.03] backdrop-blur-md"
        >
          <div className="relative p-6 md:p-10 lg:p-14">
            {/* Header with AROMI presence */}
            <div className="mb-12 flex flex-col items-center text-center md:mb-14">
              <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
                <AromiPresence />
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl lg:text-4xl">
                    ArogyaMitra – Adaptive AI Fitness & Wellness Coach
                  </h2>
                  <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                    Generates personalized workouts and meal plans that adapt in
                    real time to your life conditions.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature panels - horizontally scrollable */}
            <div className="mb-12 overflow-hidden md:mb-14">
              <div className="-mx-4 overflow-x-auto px-4 md:-mx-6 md:px-6">
                <div className="flex gap-5 pb-2 md:gap-6">
                  {FEATURE_PANELS.map((panel, i) => (
                    <motion.div
                      key={panel.key}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      whileHover={{ y: -2 }}
                      className="group min-w-[300px] shrink-0 rounded-2xl border border-border/40 bg-background/70 p-6 shadow-sm transition-all hover:border-primary/15 hover:shadow-lg active:scale-[0.995] md:min-w-[320px]"
                    >
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                        <panel.icon className="h-5 w-5" strokeWidth={1.5} />
                      </div>
                      <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                        {panel.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {panel.description}
                      </p>
                      {panel.visual === "adjust" && <AdaptiveVisual />}
                      {panel.visual === "progress" && <CharityProgressVisual />}
                      {panel.visual === "integrated" && <EcosystemIcons />}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Video exploration area */}
            <div className="mb-12 overflow-hidden md:mb-14">
              <h3 className="mb-5 font-display text-lg font-semibold text-foreground">
                Workout videos – explore routines & meals
              </h3>
              <div className="-mx-4 overflow-x-auto px-4 md:-mx-6 md:px-6">
                <div className="flex gap-4 pb-2 md:gap-5">
                  {VIDEOS.map((video, i) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
                    >
                      <Link
                        href={`/videos?v=${video.id}`}
                        className="group flex min-w-[240px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border/40 bg-background/60 shadow-sm transition-all hover:border-primary/20 hover:shadow-lg active:scale-[0.99] md:min-w-[260px]"
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg transition-transform duration-300 group-hover:scale-110">
                              <Play className="ml-1 h-6 w-6 fill-current" />
                            </div>
                          </div>
                        </div>
                        <p className="p-3 text-left text-sm font-medium text-foreground">
                          {video.title}
                        </p>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Integration strip */}
            <div className="mb-12 rounded-2xl border border-border/30 bg-muted/20 px-6 py-5 md:px-8 md:py-6">
              <div className="flex flex-col items-center gap-5 md:flex-row md:justify-between md:gap-8">
                <div className="flex items-center justify-center gap-8 md:gap-12">
                  {INTEGRATION_ICONS.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2.5 text-muted-foreground"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/80">
                        <item.icon className="h-4 w-4" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
                <p className="max-w-md text-center text-sm leading-relaxed text-muted-foreground md:text-left">
                  Workouts, nutrition, and scheduling flow into a unified daily
                  routine.
                </p>
              </div>
            </div>

            {/* Broader value section */}
            <div className="mb-12 rounded-2xl border border-border/30 bg-gradient-to-br from-muted/30 to-muted/10 px-6 py-6 md:mb-14 md:px-8 md:py-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
                <div>
                  <p className="text-sm font-medium leading-relaxed text-foreground md:text-base">
                    AI-driven automation makes personalized coaching scalable and
                    accessible—a cost-effective alternative to traditional
                    training while maintaining high-quality guidance.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Your personal progress contributes to charitable outcomes and
                    community well-being.
                  </p>
                </div>
                <div className="flex shrink-0 items-center justify-center rounded-xl bg-primary/5 px-5 py-3">
                  <TrendingUp className="h-8 w-8 text-primary/70" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col items-center gap-3 text-center">
              <Button
                size="lg"
                className="h-12 rounded-xl px-10 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98]"
                asChild
              >
                <Link href="/auth/sign-up" className="gap-2">
                  Start Your Personalized Plan
                  <Sparkles className="h-4 w-4" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Tailored, adaptive, and designed to fit real life.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

    </section>
  )
}
