import { describe, expect, it } from 'vitest'
import { departmentArchives } from './departmentArchives'
import { journeyScenes } from './journey'
import { projects } from './projects'
import { explorerPoseSources, sceneVisuals } from './sceneVisuals'

const forbiddenLanguage = /适配率|匹配度|部门排名|最适合|人格类型|性格类型/

describe('night voyage content', () => {
  it('defines a local desktop and mobile visual for every cosmic world', () => {
    expect(Object.keys(sceneVisuals)).toEqual([
      'intro',
      'hub',
      'observation',
      'clues',
      'dialogue',
      'map',
      'expression',
      'result',
      'atlas',
    ])

    for (const visual of Object.values(sceneVisuals)) {
      expect(visual.desktopSrc).toMatch(/^\/(?:environments|media\/night-voyage)\/.+\.webp$/)
      expect(visual.mobileSrc).toMatch(/^\/(?:environments|media\/night-voyage)\/.+\.webp$/)
      if (visual.desktopVideoSrc || visual.mobileVideoSrc) {
        expect(visual.desktopVideoSrc).toMatch(/^\/media\/night-voyage\/.+-desktop\.mp4$/)
        expect(visual.mobileVideoSrc).toMatch(/^\/media\/night-voyage\/.+-mobile\.mp4$/)
        expect(visual.posterSrc).toMatch(/^\/media\/night-voyage\/.+\.webp$/)
      }
      expect(visual.alt.length).toBeGreaterThan(8)
      expect(visual.focalPoint).toMatch(/^\d+% \d+%$/)
    }
  })

  it('defines all explorer poses as local assets', () => {
    expect(Object.keys(explorerPoseSources)).toEqual([
      'wake',
      'idle',
      'walk',
      'observe',
      'touch',
      'record',
      'communicate',
      'enter',
    ])

    for (const source of Object.values(explorerPoseSources)) {
      expect(source).toMatch(/^\/explorer\/.+\.webp$/)
    }
  })

  it('defines five short interaction scenes in journey order', () => {
    expect(journeyScenes.map((scene) => scene.id)).toEqual([
      'observation',
      'clues',
      'dialogue',
      'map',
      'expression',
    ])

    for (const scene of journeyScenes) {
      expect(scene.prompt.length).toBeLessThanOrEqual(40)
      expect(scene.choices.length).toBeGreaterThanOrEqual(3)
      expect(scene.choices.every((choice) => choice.label.length <= 18)).toBe(true)
      expect(scene.completionCaption.length).toBeGreaterThan(0)
    }
  })

  it('provides a compact screening-room reel with meaningful real media', () => {
    expect(projects.length).toBeGreaterThanOrEqual(7)
    expect(projects.length).toBeLessThanOrEqual(10)
    expect(new Set(projects.map((project) => project.archiveCode)).size).toBe(
      projects.length,
    )

    for (const project of projects) {
      expect(project.media.src).toMatch(/^\/departments\/.+\/gallery-[1-3]-640\.webp$/)
      expect(project.media.alt.length).toBeGreaterThan(10)
      expect(project.title.length).toBeLessThanOrEqual(24)
      expect(project.description.length).toBeLessThanOrEqual(54)
      expect(project.media.objectPosition).toMatch(/^\d+% \d+%$/)
      expect(project.screeningPriority).toBeTypeOf('number')
    }

    const opener = [...projects].sort(
      (left, right) => left.screeningPriority - right.screeningPriority,
    )[0]
    expect(opener.id).not.toBe('project-line')
    expect(opener.media.alt).not.toMatch(/聊天|截图|微信/)
  })

  it('migrates seven complete department archives without fit fields', () => {
    expect(departmentArchives).toHaveLength(7)
    expect(new Set(departmentArchives.map((department) => department.id)).size).toBe(7)

    for (const department of departmentArchives) {
      expect(department.responsibilities.length).toBeGreaterThanOrEqual(3)
      expect(department.workflow.length).toBeGreaterThanOrEqual(4)
      expect(department.gains).toHaveLength(3)
      expect(department.gallery).toHaveLength(3)
      expect(department.starterAction.length).toBeGreaterThan(0)
      expect(department).not.toHaveProperty('target')
      expect(department).not.toHaveProperty('fitNarrative')
      expect(department).not.toHaveProperty('keywords')
    }
  })

  it('uses exploratory language throughout all public content', () => {
    expect(JSON.stringify({ journeyScenes, projects, departmentArchives })).not.toMatch(
      forbiddenLanguage,
    )
  })
})
