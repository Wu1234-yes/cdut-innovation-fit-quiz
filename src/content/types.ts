export type DimensionId =
  | 'expression'
  | 'analysis'
  | 'execution'
  | 'adaptation'

export type DepartmentId =
  | 'office'
  | 'project'
  | 'competition'
  | 'training'
  | 'science'
  | 'publicity'
  | 'language'

export type ScoreMap = Record<DimensionId, number>

export interface DepartmentMedia {
  fallback: string
  srcSet: string
  alt: string
  objectPosition: string
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

export interface Department {
  id: DepartmentId
  name: string
  summary: string
  mission: string
  accent: string
  keywords: string[]
  target: ScoreMap
  hero: DepartmentMedia
  gallery: DepartmentMedia[]
  responsibilities: string[]
  stats: DepartmentStat[]
  workflow: DepartmentWorkflowStep[]
  gains: string[]
  fitNarrative: string
  related: DepartmentId[]
}

export type DimensionPoints = Readonly<ScoreMap>
export type DepartmentPoints = Readonly<Record<DepartmentId, number>>

export interface PreferenceQuestionOption {
  readonly id: string
  readonly label: string
  readonly dimension: DimensionId
  readonly points: DimensionPoints
}

export interface ScenarioQuestionOption {
  readonly id: string
  readonly label: string
  readonly primary: DepartmentId
  readonly related: DepartmentId
  readonly points: DepartmentPoints
}

export type QuestionOption =
  | PreferenceQuestionOption
  | ScenarioQuestionOption

export interface PreferenceQuestion {
  readonly id: string
  readonly type: 'preference'
  readonly prompt: string
  readonly options: ReadonlyArray<PreferenceQuestionOption>
}

export interface ScenarioQuestion {
  readonly id: string
  readonly type: 'scenario'
  readonly prompt: string
  readonly options: ReadonlyArray<ScenarioQuestionOption>
}

export type Question = PreferenceQuestion | ScenarioQuestion

export type Answers = Partial<Record<string, string>>
