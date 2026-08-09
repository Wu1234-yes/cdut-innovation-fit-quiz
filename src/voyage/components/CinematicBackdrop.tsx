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
  const videoRef = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia?.('(max-width: 680px)').matches,
  )
  const activeVideoSrc = videoSrc ?? (isMobile ? mobileVideoSrc : desktopVideoSrc ?? mobileVideoSrc)
  const activePosterSrc = isMobile ? mobilePosterSrc ?? posterSrc : posterSrc
  const showVideo = Boolean(activeVideoSrc) && !reducedMotion && !failed

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(max-width: 680px)')
    if (!mediaQuery) return

    const handleViewportChange = () => {
      setFailed(false)
      setIsMobile(mediaQuery.matches)
    }

    mediaQuery.addEventListener?.('change', handleViewportChange)
    return () => mediaQuery.removeEventListener?.('change', handleViewportChange)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !showVideo) return

    attemptPlayback(video, () => setFailed(true))
  }, [activeVideoSrc, showVideo])

  useEffect(() => {
    const handleVisibility = () => {
      const video = videoRef.current
      if (!video) return
      if (document.hidden) {
        video.pause()
      } else {
        attemptPlayback(video, () => setFailed(true))
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [showVideo])

  const style: BackdropStyle = {
    '--backdrop-focal-point': focalPoint,
  }

  return (
    <div
      aria-label={alt}
      className={`cinematic-backdrop ${showVideo ? 'is-video' : 'is-poster'} ${className}`.trim()}
      role="img"
      style={style}
    >
      {showVideo ? (
        <video
          autoPlay
          key={activeVideoSrc}
          loop
          muted
          onError={() => setFailed(true)}
          onLoadedData={() => setFailed(false)}
          onCanPlay={(event) => attemptPlayback(event.currentTarget, () => setFailed(true))}
          playsInline
          poster={activePosterSrc}
          preload="auto"
          ref={videoRef}
          src={activeVideoSrc}
        />
      ) : (
        <picture>
          {mobilePosterSrc && <source media="(max-width: 680px)" srcSet={mobilePosterSrc} />}
          <img alt={alt} decoding="async" src={posterSrc} />
        </picture>
      )}
    </div>
  )
}
