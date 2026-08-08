import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface CosmicCoreSceneProps {
  reducedMotion: boolean
  saveData: boolean
  pointerX?: number
  pointerY?: number
}

const createStarPositions = (count: number) => {
  const positions = new Float32Array(count * 3)
  let seed = 23

  for (let index = 0; index < count; index += 1) {
    seed = (seed * 16807) % 2147483647
    const azimuth = (seed / 2147483647) * Math.PI * 2
    seed = (seed * 16807) % 2147483647
    const elevation = (seed / 2147483647 - 0.5) * Math.PI
    seed = (seed * 16807) % 2147483647
    const radius = 5.4 + (seed / 2147483647) * 4.6
    const offset = index * 3

    positions[offset] = Math.cos(elevation) * Math.cos(azimuth) * radius
    positions[offset + 1] = Math.sin(elevation) * radius
    positions[offset + 2] = Math.cos(elevation) * Math.sin(azimuth) * radius
  }

  return positions
}

export function CosmicCoreScene({
  reducedMotion,
  saveData,
  pointerX = 0,
  pointerY = 0,
}: CosmicCoreSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerRef = useRef({ x: pointerX, y: pointerY })
  const [ready, setReady] = useState(false)
  const staticMode = reducedMotion || saveData

  useEffect(() => {
    pointerRef.current = { x: pointerX, y: pointerY }
  }, [pointerX, pointerY])

  useEffect(() => {
    if (staticMode || !canvasRef.current) return
    if (typeof WebGLRenderingContext === 'undefined') return

    const canvas = canvasRef.current
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 0.1, 7.4)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas,
        powerPreference: 'high-performance',
      })
    } catch {
      return
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.08

    const coreGeometry = new THREE.IcosahedronGeometry(1.58, 5)
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x07131c,
      emissive: 0x0b6472,
      emissiveIntensity: 0.72,
      metalness: 0.58,
      roughness: 0.24,
      clearcoat: 0.72,
      clearcoatRoughness: 0.22,
    })
    const core = new THREE.Mesh(coreGeometry, coreMaterial)

    const wireGeometry = new THREE.IcosahedronGeometry(1.64, 2)
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x7beaf0,
      opacity: 0.18,
      transparent: true,
      wireframe: true,
    })
    const wire = new THREE.Mesh(wireGeometry, wireMaterial)

    const ringGeometryA = new THREE.TorusGeometry(2.35, 0.012, 8, 180)
    const ringGeometryB = new THREE.TorusGeometry(2.82, 0.009, 8, 180)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x74e7ed,
      opacity: 0.48,
      transparent: true,
    })
    const ringMaterialSoft = ringMaterial.clone()
    ringMaterialSoft.color.setHex(0xffd66b)
    ringMaterialSoft.opacity = 0.24
    const ringA = new THREE.Mesh(ringGeometryA, ringMaterial)
    const ringB = new THREE.Mesh(ringGeometryB, ringMaterialSoft)
    ringA.rotation.set(1.18, 0.28, -0.34)
    ringB.rotation.set(0.68, -0.56, 0.42)

    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(createStarPositions(340), 3),
    )
    const starMaterial = new THREE.PointsMaterial({
      color: 0xd8fbff,
      opacity: 0.62,
      size: 0.026,
      sizeAttenuation: true,
      transparent: true,
    })
    const stars = new THREE.Points(starGeometry, starMaterial)

    const coreGroup = new THREE.Group()
    coreGroup.add(core, wire, ringA, ringB)
    scene.add(coreGroup, stars)
    scene.add(new THREE.AmbientLight(0x79b9c4, 0.56))
    const keyLight = new THREE.PointLight(0xa3ffff, 18, 18)
    keyLight.position.set(3.8, 2.6, 4.6)
    scene.add(keyLight)
    const backLight = new THREE.PointLight(0xffcf72, 12, 16)
    backLight.position.set(-3.2, -1.8, -2.8)
    scene.add(backLight)

    let animationFrame = 0
    let previousTime = performance.now()
    let elapsed = 0
    let firstFrame = true
    let visible = !document.hidden

    const resize = () => {
      const bounds = canvas.parentElement?.getBoundingClientRect()
      const width = Math.max(1, Math.round(bounds?.width ?? canvas.clientWidth))
      const height = Math.max(1, Math.round(bounds?.height ?? canvas.clientHeight))
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    const renderFrame = (time: number) => {
      const delta = Math.min((time - previousTime) / 1000, 0.05)
      previousTime = time

      if (visible) {
        elapsed += delta
        const pointer = pointerRef.current
        coreGroup.rotation.y = elapsed * 0.12 + pointer.x * 0.1
        coreGroup.rotation.x = -0.08 + pointer.y * 0.07
        wire.rotation.y = -elapsed * 0.1
        ringA.rotation.z = -0.34 + elapsed * 0.055
        ringB.rotation.z = 0.42 - elapsed * 0.034
        const breath = 1 + Math.sin(elapsed * 0.9) * 0.018
        core.scale.setScalar(breath)
        camera.position.x += (pointer.x * 0.16 - camera.position.x) * 0.035
        camera.position.y += (0.1 - pointer.y * 0.1 - camera.position.y) * 0.035
        camera.lookAt(0, 0, 0)
        renderer.render(scene, camera)

        if (firstFrame) {
          firstFrame = false
          setReady(true)
        }
      }

      animationFrame = requestAnimationFrame(renderFrame)
    }

    const handleVisibility = () => {
      visible = !document.hidden
      previousTime = performance.now()
    }

    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(resize)

    resize()
    observer?.observe(canvas.parentElement ?? canvas)
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', handleVisibility)
    animationFrame = requestAnimationFrame(renderFrame)

    return () => {
      cancelAnimationFrame(animationFrame)
      observer?.disconnect()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibility)
      coreGeometry.dispose()
      coreMaterial.dispose()
      wireGeometry.dispose()
      wireMaterial.dispose()
      ringGeometryA.dispose()
      ringGeometryB.dispose()
      ringMaterial.dispose()
      ringMaterialSoft.dispose()
      starGeometry.dispose()
      starMaterial.dispose()
      renderer.dispose()
    }
  }, [staticMode])

  return (
    <div className={`cosmic-core ${ready ? 'is-ready' : ''}`}>
      <div
        aria-hidden="true"
        className="cosmic-core__fallback"
        data-testid="cosmic-core-fallback"
      >
        <span className="cosmic-core__fallback-body" />
        <i />
        <i />
      </div>
      {!staticMode ? (
        <canvas
          aria-hidden="true"
          className="cosmic-core__canvas"
          data-testid="cosmic-core-canvas"
          ref={canvasRef}
        />
      ) : null}
    </div>
  )
}
