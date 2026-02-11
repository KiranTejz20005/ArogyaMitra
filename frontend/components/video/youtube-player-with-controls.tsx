"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Script from "next/script"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  SkipForward,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

interface YouTubePlayerWithControlsProps {
  videoId: string
  title?: string
  autoplay?: boolean
  className?: string
}

export function YouTubePlayerWithControls({
  videoId,
  title,
  autoplay = false,
  className,
}: YouTubePlayerWithControlsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<InstanceType<NonNullable<typeof window.YT>["Player"]> | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const isSeekingRef = useRef(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [apiReady, setApiReady] = useState(false)

  const elementId = `yt-player-${videoId}`

  useEffect(() => {
    window.onYouTubeIframeAPIReady = () => setApiReady(true)
    if (window.YT?.Player) setApiReady(true)
    return () => {
      delete window.onYouTubeIframeAPIReady
    }
  }, [])

  const startPolling = useCallback(() => {
    if (pollRef.current) return
    pollRef.current = setInterval(() => {
      const player = playerRef.current
      if (!player || isSeekingRef.current) return
      try {
        const state = player.getPlayerState()
        if (state === 1) {
          setCurrentTime(player.getCurrentTime())
          setDuration(player.getDuration())
        }
      } catch {
        // Player not ready
      }
    }, 250)
  }, [])

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      stopPolling()
      try {
        playerRef.current?.destroy()
      } catch {
        // ignore
      }
      playerRef.current = null
    }
  }, [stopPolling, videoId])

  useEffect(() => {
    if (!apiReady || !videoId) return

    const initPlayer = () => {
      const YT = window.YT
      if (!YT || !containerRef.current) return

      const existing = document.getElementById(elementId)
      if (existing) existing.remove()

      const div = document.createElement("div")
      div.id = elementId
      div.className = "h-full w-full"
      containerRef.current.appendChild(div)

      const player = new YT.Player(elementId, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: 0,
          disablekb: 0,
          fs: 1,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          origin: typeof window !== "undefined" ? window.location.origin : "",
          iv_load_policy: 3,
        },
        events: {
          onReady: (e) => {
            playerRef.current = e.target
            setIsReady(true)
            setDuration(e.target.getDuration())
            setVolume(e.target.getVolume())
            e.target.setPlaybackRate(playbackRate)
            if (autoplay) {
              e.target.playVideo()
              setIsPlaying(true)
              startPolling()
            }
          },
          onStateChange: (e) => {
            const YT = window.YT
            if (!YT) return
            if (e.data === YT.PlayerState.PLAYING) {
              setIsPlaying(true)
              startPolling()
            } else if (
              e.data === YT.PlayerState.PAUSED ||
              e.data === YT.PlayerState.ENDED
            ) {
              setIsPlaying(false)
              stopPolling()
            } else if (e.data === YT.PlayerState.ENDED) {
              setCurrentTime(0)
            }
          },
        },
      })
    }

    initPlayer()
    return () => {
      stopPolling()
      try {
        playerRef.current?.destroy()
      } catch {
        // ignore
      }
      playerRef.current = null
      const el = document.getElementById(elementId)
      if (el) el.remove()
      setIsReady(false)
      setIsPlaying(false)
      setCurrentTime(0)
      setDuration(0)
    }
  }, [videoId, elementId, autoplay, playbackRate, apiReady, startPolling, stopPolling])

  const handlePlayPause = () => {
    const player = playerRef.current
    if (!player) return
    const state = player.getPlayerState()
    const YT = window.YT
    if (!YT) return
    if (state === YT.PlayerState.PLAYING) {
      player.pauseVideo()
    } else {
      player.playVideo()
    }
  }

  const handleSeek = (value: number[]) => {
    const percent = value[0] ?? 0
    const newTime = (percent / 100) * duration
    setCurrentTime(newTime)
  }

  const handleSeekCommit = (value: number[]) => {
    const player = playerRef.current
    if (!player) return
    const percent = value[0] ?? 0
    const newTime = (percent / 100) * duration
    isSeekingRef.current = true
    player.seekTo(newTime, true)
    setCurrentTime(newTime)
    setTimeout(() => {
      isSeekingRef.current = false
    }, 150)
  }

  const handleVolumeChange = (value: number[]) => {
    const player = playerRef.current
    const v = value[0] ?? 0
    setVolume(v)
    if (player) {
      player.setVolume(v)
      if (v === 0) {
        player.mute()
        setIsMuted(true)
      } else {
        player.unMute()
        setIsMuted(false)
      }
    }
  }

  const toggleMute = () => {
    const player = playerRef.current
    if (!player) return
    if (isMuted || volume === 0) {
      const v = volume || 80
      setVolume(v)
      player.setVolume(v)
      player.unMute()
      setIsMuted(false)
    } else {
      player.mute()
      setIsMuted(true)
    }
  }

  const handleFullscreen = () => {
    const container = containerRef.current
    if (!container) return
    if (!document.fullscreenElement) {
      container.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  const skip = (seconds: number) => {
    const player = playerRef.current
    if (!player) return
    const t = Math.max(0, Math.min(duration, currentTime + seconds))
    player.seekTo(t, true)
    setCurrentTime(t)
  }

  const handleSpeedChange = () => {
    const idx = PLAYBACK_SPEEDS.indexOf(playbackRate)
    const next = PLAYBACK_SPEEDS[(idx + 1) % PLAYBACK_SPEEDS.length]
    setPlaybackRate(next)
    playerRef.current?.setPlaybackRate(next)
  }

  const progressValue = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <>
      <Script
        id="youtube-iframe-api"
        src="https://www.youtube.com/iframe_api"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.YT?.Player) setApiReady(true)
        }}
      />
      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-black shadow-xl",
          className
        )}
      >
        <div
          ref={containerRef}
          className="relative aspect-video w-full overflow-hidden bg-black"
        >
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Custom controls */}
        <div className="flex flex-col gap-3 border-t border-border/50 bg-card/95 p-4 backdrop-blur-sm">
          {title && (
            <h3 className="line-clamp-1 font-display text-sm font-semibold text-foreground md:text-base">
              {title}
            </h3>
          )}

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[progressValue]}
              max={100}
              step={0.1}
              className="flex-1"
              onValueChange={handleSeek}
              onValueCommit={handleSeekCommit}
            />
            <span className="w-12 shrink-0 text-left text-xs tabular-nums text-muted-foreground">
              {formatTime(duration)}
            </span>
          </div>

          {/* Control buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={handlePlayPause}
              disabled={!isReady}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="ml-0.5 h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => skip(-10)}
              disabled={!isReady}
              aria-label="Rewind 10 seconds"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => skip(10)}
              disabled={!isReady}
              aria-label="Forward 10 seconds"
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            <div className="mx-2 h-6 w-px bg-border" />

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={toggleMute}
                disabled={!isReady}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={100}
                step={5}
                className="w-20"
                onValueChange={handleVolumeChange}
              />
            </div>

            <div className="mx-2 h-6 w-px bg-border" />

            <Button
              variant="outline"
              size="sm"
              className="h-9 px-2 font-medium"
              onClick={handleSpeedChange}
              disabled={!isReady}
            >
              {playbackRate}x
            </Button>

            <div className="flex-1" />

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={handleFullscreen}
              aria-label="Fullscreen"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
