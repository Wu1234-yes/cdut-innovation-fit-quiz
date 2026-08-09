export interface CinematicAssetSet {
  desktopVideo: string
  mobileVideo: string
  poster: string
}

export const cinematicAssets = {
  mythPlanet: {
    desktopVideo: '/media/night-voyage/reference-motion14-desktop.mp4',
    mobileVideo: '/media/night-voyage/reference-motion14-mobile.mp4',
    poster: '/media/night-voyage/reference-motion14.jpg',
  },
  handoffDrift: {
    desktopVideo: '/media/night-voyage/reference-cosmic-drift-desktop.mp4',
    mobileVideo: '/media/night-voyage/reference-cosmic-drift-mobile.mp4',
    poster: '/media/night-voyage/reference-cosmic-drift.jpg',
  },
  reportBackground: {
    desktopVideo: '/media/night-voyage/reference-aurora-waves-desktop.mp4',
    mobileVideo: '/media/night-voyage/reference-aurora-waves-mobile.mp4',
    poster: '/media/night-voyage/reference-aurora-waves.jpg',
  },
  eggLiquid: {
    desktopVideo: '/media/night-voyage/future-reply-desktop.mp4',
    mobileVideo: '/media/night-voyage/future-reply-mobile.mp4',
    poster: '/media/night-voyage/future-reply.webp',
  },
} satisfies Record<string, CinematicAssetSet>
