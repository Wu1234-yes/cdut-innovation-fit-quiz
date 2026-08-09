import { useState } from 'react'
import type { MediaAsset } from '../content/types'

interface MediaWithFallbackProps {
  media: MediaAsset
  archiveCode: string
  title: string
  className?: string
  eager?: boolean
}

export function MediaWithFallback({
  media,
  archiveCode,
  title,
  className = '',
  eager = false,
}: MediaWithFallbackProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const failed = failedSource === media.src

  if (failed) {
    return (
      <div className={`media-fallback ${className}`.trim()} role="img" aria-label={`${title}的影像暂未载入`}>
        <span>{archiveCode}</span>
        <strong>影像暂未载入</strong>
        <p>{title}</p>
      </div>
    )
  }

  return (
    <img
      alt={media.alt}
      className={className}
      decoding="async"
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailedSource(media.src)}
      sizes="(max-width: 720px) 100vw, 900px"
      src={media.src}
      srcSet={media.srcSet}
      style={{ objectPosition: media.objectPosition }}
    />
  )
}
