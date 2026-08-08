export type SceneId =
  | 'observation'
  | 'clues'
  | 'dialogue'
  | 'map'
  | 'expression'

export type DepartmentId =
  | 'office'
  | 'project'
  | 'competition'
  | 'training'
  | 'science'
  | 'publicity'
  | 'language'

export type ExplorerPose =
  | 'wake'
  | 'idle'
  | 'walk'
  | 'observe'
  | 'touch'
  | 'record'
  | 'communicate'
  | 'enter'

export type CosmicWorldId =
  | 'intro'
  | 'hub'
  | 'observation'
  | 'clues'
  | 'dialogue'
  | 'map'
  | 'expression'
  | 'result'
  | 'atlas'

export interface SceneVisual {
  desktopSrc: string
  mobileSrc: string
  videoSrc?: string
  desktopVideoSrc?: string
  mobileVideoSrc?: string
  posterSrc?: string
  alt: string
  focalPoint: `${number}% ${number}%`
  accent: string
}

export type ObservationId = 'detail' | 'people' | 'place'

export type ClueId =
  | 'beginner-note'
  | 'project-record'
  | 'event-image'
  | 'schedule-gap'

export type DialogueId = 'newcomer' | 'participant' | 'mentor'

export type RouteTimeId = 'short' | 'weekend' | 'flexible'
export type RoutePartnerId = 'peer' | 'team' | 'solo'
export type RouteApproachId = 'try-first' | 'research-first' | 'ask-first'
export type ExpressionId = 'map' | 'poster' | 'video' | 'sharing'

export interface JourneySignals {
  observation: ObservationId[]
  clues: ClueId[]
  dialogue: DialogueId | null
  route: {
    time: RouteTimeId | null
    partner: RoutePartnerId | null
    approach: RouteApproachId | null
  }
  expression: ExpressionId | null
  expressionTuning: number | null
}

export interface ProfileTrait {
  id: string
  title: string
  evidence: string
}

export interface ResearchScene {
  id: string
  title: string
  description: string
}

export interface StarterTask {
  id: string
  title: string
  description: string
}

export interface ActionProfile {
  traits: ProfileTrait[]
  researchScenes: ResearchScene[]
  starterTasks: StarterTask[]
}

export type MascotPose = 'launch' | 'focus' | 'research' | 'cheer'
export type MascotState =
  | 'idle'
  | 'guide'
  | 'focus'
  | 'react'
  | 'celebrate'
  | 'projector'

export interface JourneyChoice {
  id: string
  label: string
  caption: string
  group?: 'time' | 'partner' | 'approach'
}

export interface JourneySceneDefinition {
  id: SceneId
  eyebrow: string
  title: string
  prompt: string
  instruction: string
  choices: JourneyChoice[]
  completionCaption: string
  mascotPose: MascotPose
}

export interface MediaAsset {
  src: string
  srcSet?: string
  alt: string
  objectPosition: string
}

export interface ProjectRecord {
  id: string
  archiveCode: string
  title: string
  description: string
  media: MediaAsset
  departmentId: DepartmentId
  screeningPriority: number
}

export interface DepartmentStat {
  value: number
  suffix: string
  label: string
  note: string
}

export interface DepartmentWorkflowStep {
  title: string
  description: string
}

export interface DepartmentArchiveRecord {
  id: DepartmentId
  name: string
  summary: string
  mission: string
  accent: string
  hero: MediaAsset
  gallery: MediaAsset[]
  responsibilities: string[]
  stats: DepartmentStat[]
  workflow: DepartmentWorkflowStep[]
  gains: string[]
  starterAction: string
  related: DepartmentId[]
}
