'use client'

import Hls from 'hls.js'
import { useHotkeys } from 'react-hotkeys-hook'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { getToken } from '@/lib/token'
import { usePreferenceStore } from '@/lib/stores/preference'
import { useVideoAmbilight } from './player/use-video-ambilight'
import { VideoPlayerControls } from './player/video-player-controls'
import { VideoPlayerOverlays } from './player/video-player-overlays'

interface VideoPlayerProps {
  url: string
  thumbnailUrl: string | null
}

type OverlayAnimation = 'play' | 'pause' | 'mute' | 'unmute' | null

const CONTROLS_HIDE_DELAY_MS = 2500

export function VideoPlayer({ url, thumbnailUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLCanvasElement>(null)

  const isMuted = usePreferenceStore((s) => s.isMuted)
  const toggleMute = usePreferenceStore((s) => s.toggleMute)
  const volume = usePreferenceStore((s) => s.volume)
  const setVolume = usePreferenceStore((s) => s.setVolume)

  const [isPlaying, setIsPlaying] = useState(true)
  const [isBuffering, setIsBuffering] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [seekDelta, setSeekDelta] = useState<number>(0)
  const [animation, setAnimation] = useState<OverlayAnimation>(null)

  const isPlayingRef = useRef(isPlaying)
  const isMutedRef = useRef(isMuted)
  const volumeRef = useRef(volume)
  const controlsHideTimeoutRef = useRef<number | null>(null)

  useVideoAmbilight({
    videoRef,
    glowRef,
    enabled: true,
    blendFactor: 0.1,
    blurPx: 80,
    opacity: 0.4,
  })

  const applyPreferences = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = isMutedRef.current
    video.defaultMuted = isMutedRef.current
    video.volume = Math.min(1, Math.max(0, volumeRef.current))
  }, [])

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    isMutedRef.current = isMuted
    volumeRef.current = volume
    applyPreferences()
  }, [isMuted, volume, applyPreferences])

  const clearControlsHideTimeout = useCallback(() => {
    if (controlsHideTimeoutRef.current) {
      clearTimeout(controlsHideTimeoutRef.current)
      controlsHideTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearControlsHideTimeout()
  }, [clearControlsHideTimeout])

  const showControls = useCallback(
    (autoHide = true) => {
      setControlsVisible(true)
      clearControlsHideTimeout()
      if (autoHide && isPlayingRef.current) {
        controlsHideTimeoutRef.current = window.setTimeout(
          () => setControlsVisible(false),
          CONTROLS_HIDE_DELAY_MS,
        )
      }
    },
    [clearControlsHideTimeout],
  )

  const triggerAnimation = (type: Exclude<OverlayAnimation, null>) => {
    setAnimation(type)
    setTimeout(() => setAnimation(null), 500)
  }

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    showControls(true)
    if (video.paused || video.ended) video.play().catch(() => {})
    else video.pause()
  }, [showControls])

  const handleToggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !isMuted
    toggleMute()
    triggerAnimation(isMuted ? 'unmute' : 'mute')
    if (isMuted) video.volume = volume
  }, [isMuted, toggleMute, volume])

  const handleJump = useCallback(
    (value: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.max(0, Math.min(value, duration))
        setCurrentTime(videoRef.current.currentTime)
      }
    },
    [duration],
  )

  const handleVolumeChange = useCallback(
    (value: number) => {
      const video = videoRef.current
      if (!video) return
      if (value === 0) {
        setVolume(0)
        video.muted = true
      } else {
        setVolume(value)
        video.volume = value
        video.muted = false
      }
    },
    [setVolume],
  )

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else container.requestFullscreen().catch(() => {})
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(document.fullscreenElement === containerRef.current)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (Hls.isSupported()) {
      const token = getToken()
      const hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.withCredentials = true
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        },
      })

      hls.loadSource(url)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        applyPreferences()
        if (isPlayingRef.current) video.play().catch(() => {})
        else setIsBuffering(false)
      })

      return () => hls.destroy()
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      const onLoaded = () => {
        applyPreferences()
        if (isPlayingRef.current) video.play().catch(() => {})
        else setIsBuffering(false)
      }
      video.src = url
      video.addEventListener('loadedmetadata', onLoaded)
      return () => video.removeEventListener('loadedmetadata', onLoaded)
    }

    console.error('HLS not supported')
  }, [url, applyPreferences])

  useHotkeys(
    ['space', 'k'],
    () => {
      togglePlay()
      triggerAnimation(isPlaying ? 'pause' : 'play')
    },
    { preventDefault: true },
  )
  useHotkeys('f', toggleFullscreen)
  useHotkeys('m', handleToggleMute)
  useHotkeys('arrowleft', () => {
    if (videoRef.current) {
      handleJump(videoRef.current.currentTime - 5)
      setSeekDelta(-5)
    }
    setTimeout(() => setSeekDelta(0), 1000)
  })
  useHotkeys('arrowright', () => {
    if (videoRef.current) {
      handleJump(videoRef.current.currentTime + 5)
      setSeekDelta(5)
    }
    setTimeout(() => setSeekDelta(0), 1000)
  })
  useHotkeys('j', () => {
    if (videoRef.current) {
      handleJump(videoRef.current.currentTime - 10)
      setSeekDelta(-10)
    }
    setTimeout(() => setSeekDelta(0), 1000)
  })
  useHotkeys('l', () => {
    if (videoRef.current) {
      handleJump(videoRef.current.currentTime + 10)
      setSeekDelta(10)
    }
    setTimeout(() => setSeekDelta(0), 1000)
  })
  useHotkeys(
    ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    (e) => {
      handleJump(duration * (parseInt(e.key, 10) / 10))
    },
    { preventDefault: true },
  )

  return (
    <div className="relative isolate">
      <canvas ref={glowRef} aria-hidden/>

      <div
        ref={containerRef}
        onPointerMove={() => showControls(true)}
        onPointerDown={() => showControls(true)}
        className="group relative aspect-video overflow-hidden bg-black shadow-lg lg:rounded-lg"
      >
        <VideoPlayerOverlays animation={animation} seekDelta={seekDelta} />

        <video
          ref={videoRef}
          onClick={togglePlay}
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime)
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration)
              setIsBuffering(false)
            }
          }}
          onPlay={() => {
            isPlayingRef.current = true
            setIsPlaying(true)
            showControls(true)
          }}
          onPause={() => {
            isPlayingRef.current = false
            setIsPlaying(false)
            showControls(false)
          }}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          poster={thumbnailUrl ?? undefined}
          crossOrigin="use-credentials"
          className="h-full w-full cursor-pointer object-contain"
        />

        {isBuffering && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <Spinner className="size-18" />
          </div>
        )}

        <VideoPlayerControls
          controlsVisible={controlsVisible}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          isMuted={isMuted}
          volume={volume}
          isFullscreen={isFullscreen}
          onSeek={handleJump}
          onTogglePlay={togglePlay}
          onToggleMute={handleToggleMute}
          onVolumeChange={handleVolumeChange}
          onToggleFullscreen={toggleFullscreen}
        />
      </div>
    </div>
  )
}
