import { useEffect, useState } from 'react'
import type { MediaAsset } from '../content/types'

interface MediaWithFallbackProps {
  media: MediaAsset
  archiveCode: string
  title: string
  className?: string
  eager?: boolean
  fetchPriority?: 'high' | 'low' | 'auto'
}

const retrySource = (source: string, attempt: number) => {
  if (attempt === 0) return source
  const separator = source.includes('?') ? '&' : '?'
  return `${source}${separator}media_retry=${attempt}`
}

export function MediaWithFallback(props: MediaWithFallbackProps) {
  return <RetryingMedia key={props.media.src} {...props} />
}

function RetryingMedia({
  media,
  archiveCode,
  title,
  className = '',
  eager = false,
  fetchPriority = 'auto',
}: MediaWithFallbackProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const failed = failedSource === media.src

  useEffect(() => {
    const retry = () => {
      setFailedSource(null)
      setAttempt((value) => value + 1)
    }
    window.addEventListener('online', retry)
    return () => window.removeEventListener('online', retry)
  }, [])

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
      fetchPriority={fetchPriority}
      loading={eager ? 'eager' : 'lazy'}
      onError={() => {
        if (attempt < 2) setAttempt((value) => value + 1)
        else setFailedSource(media.src)
      }}
      onLoad={() => setFailedSource(null)}
      sizes="(max-width: 720px) 100vw, 900px"
      src={retrySource(media.src, attempt)}
      srcSet={attempt === 0 ? media.srcSet : undefined}
      style={{ objectPosition: media.objectPosition }}
    />
  )
}
