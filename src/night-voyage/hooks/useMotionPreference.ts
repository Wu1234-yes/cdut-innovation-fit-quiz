import { useEffect, useState } from 'react'

interface NetworkInformationLike extends EventTarget {
  saveData?: boolean
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformationLike
}

export interface MotionPreference {
  reducedMotion: boolean
  coarsePointer: boolean
  saveData: boolean
}

const readMedia = (query: string) =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(query).matches
    : false

const readPreference = (): MotionPreference => ({
  reducedMotion: readMedia('(prefers-reduced-motion: reduce)'),
  coarsePointer: readMedia('(pointer: coarse)'),
  saveData:
    typeof navigator !== 'undefined' &&
    Boolean((navigator as NavigatorWithConnection).connection?.saveData),
})

export function useMotionPreference(): MotionPreference {
  const [preference, setPreference] = useState(readPreference)

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const coarse = window.matchMedia?.('(pointer: coarse)')
    const connection = (navigator as NavigatorWithConnection).connection
    const update = () => setPreference(readPreference())

    reduced?.addEventListener?.('change', update)
    coarse?.addEventListener?.('change', update)
    connection?.addEventListener?.('change', update)

    return () => {
      reduced?.removeEventListener?.('change', update)
      coarse?.removeEventListener?.('change', update)
      connection?.removeEventListener?.('change', update)
    }
  }, [])

  return preference
}
