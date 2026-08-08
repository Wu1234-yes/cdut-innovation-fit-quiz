/*!
MIT + Commons Clause License Condition v1.0

Copyright (c) 2026 David Haz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, and distribute the Software as part of an
application, website, or product, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

Commons Clause Restriction

You may use this Software, including for any commercial purpose, so long as you
do not sell, sublicense, or redistribute the components themselves-whether
alone, in a bundle, or as a ported version.

No Warranty

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Source:
https://github.com/DavidHDev/react-bits/blob/3ba27d8037a1e51e93864a7609eb48b623bcdf30/src/ts-default/Backgrounds/Radar/Radar.tsx
*/

import { Mesh, Program, Renderer, Triangle } from 'ogl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { RadarPoints, StaticRadar } from './StaticRadar'

export interface RadarHeroProps {
  forceStatic?: boolean
  onStart: () => void
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uEnableMouse;
uniform vec3 uRadarColor;
uniform vec3 uAccentColor;
uniform vec3 uBackgroundColor;

#define TAU 6.28318530718

void main() {
  vec2 point = gl_FragCoord.xy / uResolution.xy;
  point = point * 2.0 - 1.0;
  point.x *= uResolution.x / uResolution.y;

  vec2 mouseShift = uMouse * 2.0 - 1.0;
  mouseShift.x *= uResolution.x / uResolution.y;
  point -= mouseShift * 0.018 * uEnableMouse;

  float radius = length(point);
  float angle = atan(point.y, point.x);
  float time = uTime;

  float ringCell = abs(fract(radius * 6.0 - time * 0.08) - 0.5);
  float rings = 1.0 - smoothstep(0.018, 0.045, ringCell);
  float reverseCell = abs(fract(radius * 3.2 + time * 0.055) - 0.5);
  float reverseOrbit = 1.0 - smoothstep(0.012, 0.038, reverseCell);

  float spokeCell = abs(fract(angle * 8.0 / TAU + 0.5) - 0.5);
  float spokes = (1.0 - smoothstep(0.0, 0.012, spokeCell)) * smoothstep(0.05, 0.2, radius);

  float sweepAngle = mod(time * 0.42, TAU) - 3.14159265359;
  float angleDelta = abs(atan(sin(angle - sweepAngle), cos(angle - sweepAngle)));
  float sweepLine = 1.0 - smoothstep(0.008, 0.03, angleDelta);
  float sweepSector = 1.0 - smoothstep(0.0, 0.68, angleDelta);
  float pulse = max(0.0, sin(time * 2.1 - radius * 18.0)) * 0.16;

  float edge = 1.0 - smoothstep(0.82, 1.04, radius);
  float grid = (rings * 0.34 + reverseOrbit * 0.2 + spokes * 0.22) * edge;
  float scan = (sweepLine * 0.82 + sweepSector * 0.2 + pulse) * edge;
  vec3 color = uBackgroundColor + uRadarColor * grid + uAccentColor * scan;
  gl_FragColor = vec4(color, 1.0);
}
`

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'
const coarsePointerQuery = '(pointer: coarse)'
const hoverUnavailableQuery = '(hover: none)'

function queryMatches(query: string) {
  return typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function'
    ? window.matchMedia(query).matches
    : false
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => queryMatches(query))

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return
    }
    const media = window.matchMedia(query)
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }
    media.addEventListener?.('change', handleChange)
    return () => media.removeEventListener?.('change', handleChange)
  }, [query])

  return matches
}

function supportsWebGL() {
  if (typeof document === 'undefined') {
    return false
  }

  try {
    const probe = document.createElement('canvas')
    const context =
      probe.getContext('webgl2') ?? probe.getContext('webgl')
    context?.getExtension?.('WEBGL_lose_context')?.loseContext()
    return context !== null
  } catch {
    return false
  }
}

function RadarCanvas({
  mouseEnabled,
  onFailure,
}: {
  mouseEnabled: boolean
  onFailure: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    let renderer: Renderer | null = null
    let geometry: Triangle | null = null
    let program: Program | null = null
    let canvas: HTMLCanvasElement | null = null
    let resizeObserver: ResizeObserver | null = null
    let frameId: number | null = null
    let resizeHandler: (() => void) | null = null
    let mouseMoveHandler: ((event: MouseEvent) => void) | null = null
    let mouseLeaveHandler: (() => void) | null = null
    let contextLostHandler: ((event: Event) => void) | null = null
    let resizeAttached = false
    let mouseMoveAttached = false
    let mouseLeaveAttached = false
    let contextLostAttached = false
    let resourcesCleaned = false
    let failureReported = false
    let mounted = true

    const attempt = (action: () => void) => {
      try {
        action()
      } catch {
        return
      }
    }

    const cleanupResources = () => {
      if (resourcesCleaned) {
        return
      }
      resourcesCleaned = true

      if (frameId !== null) {
        const latestFrameId = frameId
        frameId = null
        attempt(() => window.cancelAnimationFrame(latestFrameId))
      }
      if (resizeAttached && resizeHandler) {
        resizeAttached = false
        attempt(() => window.removeEventListener('resize', resizeHandler!))
      }
      if (resizeObserver) {
        const activeObserver = resizeObserver
        resizeObserver = null
        attempt(() => activeObserver.disconnect())
      }
      if (canvas && mouseMoveAttached && mouseMoveHandler) {
        mouseMoveAttached = false
        attempt(() => canvas?.removeEventListener('mousemove', mouseMoveHandler!))
      }
      if (canvas && mouseLeaveAttached && mouseLeaveHandler) {
        mouseLeaveAttached = false
        attempt(() => canvas?.removeEventListener('mouseleave', mouseLeaveHandler!))
      }
      if (canvas && contextLostAttached && contextLostHandler) {
        contextLostAttached = false
        attempt(() =>
          canvas?.removeEventListener('webglcontextlost', contextLostHandler!),
        )
      }
      if (canvas) {
        attempt(() => canvas?.remove())
      }
      if (program) {
        attempt(() => program?.remove())
      }
      if (geometry) {
        attempt(() => geometry?.remove())
      }
      if (renderer) {
        attempt(() =>
          renderer?.gl.getExtension('WEBGL_lose_context')?.loseContext(),
        )
      }
    }

    const reportFailure = () => {
      if (failureReported) {
        return
      }
      failureReported = true
      cleanupResources()
      queueMicrotask(() => {
        if (mounted) {
          onFailure()
        }
      })
    }

    try {
      renderer = new Renderer({
        alpha: false,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
        premultipliedAlpha: false,
      })
      const gl = renderer.gl
      const glCanvas = gl.canvas
      canvas = glCanvas
      gl.clearColor(0.027, 0.078, 0.149, 1)

      geometry = new Triangle(gl)
      program = new Program(gl, {
        fragment: fragmentShader,
        uniforms: {
          uAccentColor: { value: [0.961, 0.784, 0.298] },
          uBackgroundColor: { value: [0.027, 0.078, 0.149] },
          uEnableMouse: { value: 0 },
          uMouse: { value: new Float32Array([0.5, 0.5]) },
          uRadarColor: { value: [0.082, 0.741, 0.91] },
          uResolution: { value: [1, 1, 1] },
          uTime: { value: 0 },
        },
        vertex: vertexShader,
      })
      const activeGeometry = geometry
      const activeProgram = program
      const mesh = new Mesh(gl, {
        geometry: activeGeometry,
        program: activeProgram,
      })
      const currentMouse = [0.5, 0.5]
      let targetMouse = [0.5, 0.5]

      glCanvas.setAttribute('aria-hidden', 'true')
      glCanvas.tabIndex = -1
      container.appendChild(glCanvas)

      const resize = () => {
        const bounds = container.getBoundingClientRect()
        const width = Math.max(1, Math.round(bounds.width || container.offsetWidth))
        const height = Math.max(1, Math.round(bounds.height || container.offsetHeight))
        renderer!.dpr = Math.min(window.devicePixelRatio || 1, 2)
        renderer?.setSize(width, height)
        activeProgram.uniforms.uResolution.value = [
          glCanvas.width,
          glCanvas.height,
          glCanvas.width / Math.max(1, glCanvas.height),
        ]
      }
      resizeHandler = () => {
        try {
          resize()
        } catch {
          reportFailure()
        }
      }

      mouseMoveHandler = (event: MouseEvent) => {
        const bounds = glCanvas.getBoundingClientRect()
        if (bounds.width === 0 || bounds.height === 0) {
          return
        }
        targetMouse = [
          (event.clientX - bounds.left) / bounds.width,
          1 - (event.clientY - bounds.top) / bounds.height,
        ]
      }

      mouseLeaveHandler = () => {
        targetMouse = [0.5, 0.5]
      }

      contextLostHandler = (event: Event) => {
        event.preventDefault()
        reportFailure()
      }

      glCanvas.addEventListener('webglcontextlost', contextLostHandler)
      contextLostAttached = true
      if (mouseEnabled) {
        glCanvas.addEventListener('mousemove', mouseMoveHandler)
        mouseMoveAttached = true
        glCanvas.addEventListener('mouseleave', mouseLeaveHandler)
        mouseLeaveAttached = true
        activeProgram.uniforms.uEnableMouse.value = 1
      }
      window.addEventListener('resize', resizeHandler)
      resizeAttached = true
      if (typeof ResizeObserver === 'function') {
        resizeObserver = new ResizeObserver(resizeHandler)
        resizeObserver.observe(container)
      }
      resize()

      const update = (time: number) => {
        if (resourcesCleaned) {
          return
        }
        try {
          activeProgram.uniforms.uTime.value = time * 0.001
          currentMouse[0] += (targetMouse[0] - currentMouse[0]) * 0.035
          currentMouse[1] += (targetMouse[1] - currentMouse[1]) * 0.035
          const mouse = activeProgram.uniforms.uMouse.value as Float32Array
          mouse[0] = currentMouse[0]
          mouse[1] = currentMouse[1]
          renderer?.render({ scene: mesh })
          frameId = window.requestAnimationFrame(update)
        } catch {
          reportFailure()
        }
      }

      frameId = window.requestAnimationFrame(update)
    } catch {
      reportFailure()
    }

    return () => {
      mounted = false
      cleanupResources()
    }
  }, [mouseEnabled, onFailure])

  return (
    <div
      className={`radar-visual radar-visual--canvas ${
        mouseEnabled ? 'radar-visual--interactive' : 'radar-visual--touch'
      }`}
      ref={containerRef}
    >
      <RadarPoints />
    </div>
  )
}

export default function RadarHero({ forceStatic = false, onStart }: RadarHeroProps) {
  const reducedMotion = useMediaQuery(reducedMotionQuery)
  const coarsePointer = useMediaQuery(coarsePointerQuery)
  const hoverUnavailable = useMediaQuery(hoverUnavailableQuery)
  const [webGLAvailable, setWebGLAvailable] = useState(() =>
    forceStatic || queryMatches(reducedMotionQuery) ? false : supportsWebGL(),
  )
  const [initializationFailed, setInitializationFailed] = useState(false)
  const previousReducedMotion = useRef(reducedMotion)

  useEffect(() => {
    const wasReduced = previousReducedMotion.current
    previousReducedMotion.current = reducedMotion
    if (wasReduced && !reducedMotion) {
      setInitializationFailed(false)
      setWebGLAvailable(supportsWebGL())
    }
  }, [reducedMotion])

  const handleCanvasFailure = useCallback(() => {
    setInitializationFailed(true)
  }, [])

  const useStaticRadar =
    forceStatic ||
    reducedMotion ||
    !webGLAvailable ||
    initializationFailed
  const mouseEnabled = !coarsePointer && !hoverUnavailable

  return (
    <>
      <main className="app-view radar-hero">
        <div className="radar-hero__visual">
          {useStaticRadar ? (
            <StaticRadar />
          ) : (
            <RadarCanvas
              mouseEnabled={mouseEnabled}
              onFailure={handleCanvasFailure}
            />
          )}
        </div>

        <p className="radar-hero__organization">
          成都理工大学青年科技创新服务中心
        </p>

        <aside className="radar-hud" aria-label="测评扫描状态">
          <p className="radar-hud__status"><span />SCANNING</p>
          <p>AXES 04</p>
          <p>QUESTIONS 20</p>
          <p>LOCAL / NO UPLOAD</p>
          <p>CHENGDU / 成都</p>
          <p>30.6799 N / 104.0665 E</p>
        </aside>

        <div className="radar-lock" aria-hidden="true">
          <span>青年科创</span>
          <strong>锁定坐标</strong>
        </div>

        <div className="radar-hero__copy view-transition">
          <h2 className="assessment-name">科创部门适配测评</h2>
          <h1>找到与你同频的部门</h1>
          <p className="welcome-lead">
            用 3 至 4 分钟完成 20 道情境选择，定位更适合你的科创协作方式。
          </p>
          <p className="privacy-note">
            测评匿名进行，答案仅保存在当前标签页，不会上传。
          </p>
          <button className="button button--accent" onClick={onStart} type="button">
            开始扫描
          </button>
        </div>
      </main>
      <div className="radar-next-signal" aria-hidden="true">
        <span>FIT SIGNAL / 04 AXES</span>
        <span>READY FOR INPUT</span>
      </div>
    </>
  )
}
