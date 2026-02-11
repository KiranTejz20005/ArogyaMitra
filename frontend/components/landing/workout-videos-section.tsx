"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VIDEOS } from "@/lib/videos"

export function WorkoutVideosSection() {
  return (
    <section id="workout-videos" className="border-t border-border bg-muted/20 px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            Workout Videos
          </h2>
          <p className="mt-2 text-muted-foreground">
            Watch our curated exercise videos – no sign-up required.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {VIDEOS.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/videos?v=${video.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/35">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg transition-transform group-hover:scale-110">
                      <Play className="ml-1 h-6 w-6 fill-current" />
                    </div>
                  </div>
                </div>
                <p className="p-3 text-sm font-medium text-card-foreground">
                  {video.title}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 flex justify-center"
        >
          <Button asChild size="lg" variant="default">
            <Link href="/videos">View all videos</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
