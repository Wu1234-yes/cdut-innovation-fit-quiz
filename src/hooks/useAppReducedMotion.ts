import { useEffect, useState } from 'react'

const query = '(prefers-reduced-motion: reduce)'

const readPreference = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(query).matches
    : false

export function useAppReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(readPreference)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return
    }

    const media = window.matchMedia(query)
    const update = () => setReducedMotion(media.matches)

    update()
    media.addEventListener?.('change', update)

    return () => media.removeEventListener?.('change', update)
  }, [])

  return reducedMotion
}
