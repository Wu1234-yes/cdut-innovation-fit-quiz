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
  const showVideo = Boolean(videoSrc || desktopVideoSrc || mobileVideoSrc) && !reducedMotion && !failed

  useEffect(() => {
    const handleVisibility = () => {
      const video = videoRef.current
      if (!video) return
      if (document.hidden) {
        video.pause()
      } else {
        void video.play().catch(() => setFailed(true))
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
          loop
          muted
          onError={() => setFailed(true)}
          playsInline
          poster={posterSrc}
          preload="metadata"
          ref={videoRef}
          src={videoSrc}
        >
          {desktopVideoSrc && <source media="(min-width: 681px)" src={desktopVideoSrc} type="video/mp4" />}
          {mobileVideoSrc && <source src={mobileVideoSrc} type="video/mp4" />}
        </video>
      ) : (
        <picture>
          {mobilePosterSrc && <source media="(max-width: 680px)" srcSet={mobilePosterSrc} />}
          <img alt={alt} decoding="async" src={posterSrc} />
        </picture>
      )}
    </div>
  )
}
