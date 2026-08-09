import { useEffect, useRef, useState, type CSSProperties } from 'react'

interface CinematicBackdropProps {
  alt: string
  posterSrc: string
  videoSrc?: string
  desktopVideoSrc?: string
  mobileVideoSrc?: string
  mobilePosterSrc?: string
  focalPoint?: string
  reducedMotion?: boolean
  className?: string
}

type BackdropStyle = CSSProperties & {
  '--backdrop-focal-point': string
}

const attemptPlayback = (video: HTMLVideoElement, onFailure: () => void) => {
  const playback = video.play()
  if (playback && typeof playback.catch === 'function') {
    void playback.catch(onFailure)
  }
}

const retrySource = (source: string, attempt: number) => {
  if (attempt === 0) return source
  const separator = source.includes('?') ? '&' : '?'
  return `${source}${separator}media_retry=${attempt}`
}

interface BackdropMediaProps {
  alt: string
  className: string
  focalPoint: string
  posterSrc: string
  reducedMotion: boolean
  videoSrc?: string
}

function BackdropMedia({
  alt,
  className,
  focalPoint,
  posterSrc,
  reducedMotion,
  videoSrc,
}: BackdropMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const retryTimerRef = useRef<number | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [ready, setReady] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [exhausted, setExhausted] = useState(false)
  const showVideo = Boolean(videoSrc) && !reducedMotion && !retrying && !exhausted
  const resolvedVideoSrc = videoSrc ? retrySource(videoSrc, attempt) : undefined

  useEffect(() => {
    const video = videoRef.current
    if (!video || !showVideo) return
    attemptPlayback(video, () => setReady(false))
  }, [resolvedVideoSrc, showVideo])

  useEffect(() => {
    const handleVisibility = () => {
      const video = videoRef.current
      if (!video) return
      if (document.hidden) video.pause()
      else attemptPlayback(video, () => setReady(false))
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [showVideo])

  useEffect(() => {
    const retryOnReconnect = () => {
      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current)
        retryTimerRef.current = null
      }
      setExhausted(false)
      setRetrying(false)
      setReady(false)
      setAttempt((value) => value + 1)
    }

    window.addEventListener('online', retryOnReconnect)
    return () => {
      window.removeEventListener('online', retryOnReconnect)
      if (retryTimerRef.current !== null) window.clearTimeout(retryTimerRef.current)
    }
  }, [])

  const handleMediaError = () => {
    setReady(false)
    if (attempt >= 2) {
      setExhausted(true)
      return
    }
    setRetrying(true)
    retryTimerRef.current = window.setTimeout(() => {
      setAttempt((value) => value + 1)
      setRetrying(false)
      retryTimerRef.current = null
    }, 600 * (attempt + 1))
  }

  const style: BackdropStyle = {
    '--backdrop-focal-point': focalPoint,
  }

  return (
    <div
      aria-label={alt}
      className={`cinematic-backdrop ${showVideo ? 'is-video' : 'is-poster'} ${ready ? 'is-ready' : 'is-loading'} ${className}`.trim()}
      role="img"
      style={style}
    >
      <picture aria-hidden="true">
        <img alt="" decoding="async" src={posterSrc} />
      </picture>
      {showVideo ? (
        <video
          autoPlay
          key={resolvedVideoSrc}
          loop
          muted
          onError={handleMediaError}
          onLoadedData={() => setReady(true)}
          onCanPlay={(event) => attemptPlayback(event.currentTarget, () => setReady(false))}
          onPlaying={() => setReady(true)}
          onStalled={() => setReady(false)}
          playsInline
          poster={posterSrc}
          preload="auto"
          ref={videoRef}
          src={resolvedVideoSrc}
        />
      ) : null}
    </div>
  )
}

export function CinematicBackdrop({
  alt,
  posterSrc,
  videoSrc,
  desktopVideoSrc,
  mobileVideoSrc,
  mobilePosterSrc,
  focalPoint = '50% 50%',
  reducedMotion = false,
  className = '',
}: CinematicBackdropProps) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia?.('(max-width: 680px)').matches,
  )
  const activeVideoSrc = videoSrc ?? (isMobile ? mobileVideoSrc : desktopVideoSrc ?? mobileVideoSrc)
  const activePosterSrc = isMobile ? mobilePosterSrc ?? posterSrc : posterSrc

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(max-width: 680px)')
    if (!mediaQuery) return

    const handleViewportChange = () => {
      setIsMobile(mediaQuery.matches)
    }

    mediaQuery.addEventListener?.('change', handleViewportChange)
    return () => mediaQuery.removeEventListener?.('change', handleViewportChange)
  }, [])

  return <BackdropMedia alt={alt} className={className} focalPoint={focalPoint} key={`${activeVideoSrc ?? 'poster'}|${activePosterSrc}|${reducedMotion}`} posterSrc={activePosterSrc} reducedMotion={reducedMotion} videoSrc={activeVideoSrc} />
}
