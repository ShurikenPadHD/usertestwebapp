'use client'

import { useEffect, useRef, useCallback } from 'react'

type YTPlayer = Record<string, unknown> & { seekTo?: (s: number, b: boolean) => void; playVideo?: () => void; destroy?: () => void }

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: {
          videoId: string
          playerVars?: Record<string, number | string>
          events?: { onReady?: (e: { target: YTPlayer }) => void }
        }
      ) => YTPlayer
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

interface YouTubeEmbedProps {
  videoId: string
  className?: string
  onReady?: (seekTo: (seconds: number) => void) => void
}

export function YouTubeEmbed({ videoId, className = '', onReady }: YouTubeEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)

  const seekTo = useCallback((seconds: number) => {
    const player = playerRef.current
    if (player?.seekTo) {
      (player as { seekTo: (s: number, b: boolean) => void }).seekTo(seconds, true)
      ;(player as { playVideo?: () => void }).playVideo?.()
    }
  }, [])

  useEffect(() => {
    if (!videoId || !containerRef.current) return

    const initPlayer = () => {
      const YT = window.YT
      if (!YT) return

      const el = document.getElementById('yt-player-' + videoId)
      if (!el) return

      const player = new YT.Player('yt-player-' + videoId, {
        videoId,
        playerVars: { enablejsapi: 1 },
        events: {
          onReady: () => {
            playerRef.current = player
            onReady?.(seekTo)
          },
        },
      })
    }

    if (window.YT?.Player) {
      initPlayer()
      return
    }

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScript = document.getElementsByTagName('script')[0]
    firstScript?.parentNode?.insertBefore(tag, firstScript)

    const prevReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prevReady?.()
      initPlayer()
    }

    return () => {
      window.onYouTubeIframeAPIReady = prevReady
      const p = playerRef.current as { destroy?: () => void } | null
      if (p?.destroy) p.destroy()
      playerRef.current = null
    }
  }, [videoId, onReady, seekTo])

  return (
    <div ref={containerRef} className={className || 'absolute inset-0 w-full h-full'}>
      <div id={`yt-player-${videoId}`} className="w-full h-full" />
    </div>
  )
}
