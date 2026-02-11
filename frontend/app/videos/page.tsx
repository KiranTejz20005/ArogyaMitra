"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Play, ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/landing/navbar"
import { Button } from "@/components/ui/button"
import { YouTubePlayerWithControls } from "@/components/video/youtube-player-with-controls"
import { VIDEOS } from "@/lib/videos"
import type { VideoId } from "@/lib/videos"

function VideosContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const videoParam = searchParams.get("v") as VideoId | null
  const selectedVideo = VIDEOS.find((v) => v.id === videoParam) ?? VIDEOS[0]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Back option */}
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {/* Main player with custom controls */}
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/50 shadow-xl">
            <YouTubePlayerWithControls
              key={selectedVideo.id}
              videoId={selectedVideo.id}
              title={selectedVideo.title}
              autoplay={!!videoParam}
              className="w-full"
            />
          </div>

          {/* Video grid / gallery */}
          <div>
            <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
              More workouts & routines
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {VIDEOS.map((video) => (
                <Link
                  key={video.id}
                  href={`/videos?v=${video.id}`}
                  className={`group flex flex-col overflow-hidden rounded-xl border transition-all ${
                    selectedVideo.id === video.id
                      ? "border-primary/50 ring-2 ring-primary/20"
                      : "border-border/40 hover:border-primary/30 hover:shadow-md"
                  }`}
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/35">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full transition-transform ${
                          selectedVideo.id === video.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-white/95 text-primary group-hover:scale-110"
                        }`}
                      >
                        <Play className="ml-1 h-5 w-5 fill-current" />
                      </div>
                    </div>
                  </div>
                  <p className="line-clamp-2 p-3 text-sm font-medium text-foreground">
                    {video.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

function VideosFallback() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </main>
    </div>
  )
}

export default function VideosPage() {
  return (
    <Suspense fallback={<VideosFallback />}>
      <VideosContent />
    </Suspense>
  )
}
