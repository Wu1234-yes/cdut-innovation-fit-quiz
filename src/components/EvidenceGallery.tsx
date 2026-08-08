import { useState } from 'react'
import type { DepartmentMedia } from '../content/types'

interface EvidenceGalleryProps {
  images: DepartmentMedia[]
}

function EvidenceImage({ image, index }: { image: DepartmentMedia; index: number }) {
  const [failed, setFailed] = useState(false)

  return (
    <figure className={failed ? 'evidence-gallery__item is-failed' : 'evidence-gallery__item'}>
      <span aria-hidden="true" className="evidence-gallery__scan" />
      {!failed ? (
        <picture>
          <source sizes={index === 0 ? '(min-width: 900px) 62vw, 100vw' : '(min-width: 900px) 31vw, 100vw'} srcSet={image.srcSet} type="image/webp" />
          <img
            alt={image.alt}
            data-testid="evidence-image"
            loading="lazy"
            onError={() => setFailed(true)}
            src={image.fallback}
            style={{ objectPosition: image.objectPosition }}
          />
        </picture>
      ) : (
        <span aria-hidden="true" data-testid="evidence-image" />
      )}
      <figcaption>{image.alt}</figcaption>
    </figure>
  )
}

export function EvidenceGallery({ images }: EvidenceGalleryProps) {
  return (
    <div className="evidence-gallery">
      {images.map((image, index) => (
        <EvidenceImage image={image} index={index} key={image.fallback} />
      ))}
    </div>
  )
}
