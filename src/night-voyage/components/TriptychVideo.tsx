import { useMotionPreference } from '../hooks/useMotionPreference'

interface TriptychVideoProps {
  alt: string
  posterSrc: string
  desktopVideoSrc: string
  mobileVideoSrc: string
}

export function TriptychVideo({
  alt,
  posterSrc,
  desktopVideoSrc,
  mobileVideoSrc,
}: TriptychVideoProps) {
  const { reducedMotion } = useMotionPreference()

  return (
    <div aria-label={alt} className="triptych-video" role="img">
      {reducedMotion ? (
        <img alt="" src={posterSrc} />
      ) : (
        <video aria-hidden="true" autoPlay loop muted playsInline poster={posterSrc} preload="metadata">
          <source media="(min-width: 681px)" src={desktopVideoSrc} type="video/mp4" />
          <source src={mobileVideoSrc} type="video/mp4" />
        </video>
      )}
      <div aria-hidden="true" className="triptych-video__windows">
        {[0, 1, 2].map((panel) => (
          <span data-panel={panel + 1} data-testid="triptych-video-panel" key={panel}>
            <i />
          </span>
        ))}
      </div>
    </div>
  )
}
