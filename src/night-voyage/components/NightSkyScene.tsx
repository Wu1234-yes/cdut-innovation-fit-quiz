import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export interface NightSkySceneProps {
  onReady?: () => void
  onError?: () => void
}

const seededRandom = (seed: number) => {
  let value = seed
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

export default function NightSkyScene({ onReady, onError }: NightSkySceneProps) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      })
    } catch {
      onError?.()
      return
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80)
    camera.position.set(0, 0, 6.2)

    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.domElement.className = 'night-sky-canvas'
    renderer.domElement.setAttribute('aria-hidden', 'true')
    host.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0x82b8cb, 1.15)
    const cyanLight = new THREE.PointLight(0x65e5eb, 22, 14)
    cyanLight.position.set(2.8, 2.3, 3.8)
    const warmLight = new THREE.PointLight(0xffd05a, 9, 10)
    warmLight.position.set(-2.2, -1.6, 3)
    scene.add(ambient, cyanLight, warmLight)

    const planetGeometry = new THREE.IcosahedronGeometry(1.75, 3)
    const planetMaterial = new THREE.MeshStandardMaterial({
      color: 0x10283a,
      emissive: 0x06131d,
      emissiveIntensity: 0.8,
      flatShading: true,
      metalness: 0.06,
      roughness: 0.84,
    })
    const planet = new THREE.Mesh(planetGeometry, planetMaterial)
    planet.position.set(2.7, 1.25, -0.5)
    planet.rotation.set(0.24, -0.48, 0.08)
    scene.add(planet)

    const random = seededRandom(20260808)
    const starCount = window.innerWidth < 760 ? 280 : 520
    const positions = new Float32Array(starCount * 3)
    for (let index = 0; index < starCount; index += 1) {
      positions[index * 3] = (random() - 0.5) * 19
      positions[index * 3 + 1] = (random() - 0.5) * 11
      positions[index * 3 + 2] = -2 - random() * 16
    }
    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const starMaterial = new THREE.PointsMaterial({
      color: 0xb9f4f2,
      size: window.innerWidth < 760 ? 0.035 : 0.028,
      transparent: true,
      opacity: 0.78,
      sizeAttenuation: true,
    })
    const starField = new THREE.Points(starGeometry, starMaterial)
    scene.add(starField)

    const orbitCurve = new THREE.EllipseCurve(0, 0, 3.6, 1.62, 0, Math.PI * 2)
    const orbitPoints = orbitCurve
      .getPoints(128)
      .map((point) => new THREE.Vector3(point.x, point.y, 0))
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints)
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0x65e5eb,
      transparent: true,
      opacity: 0.32,
    })
    const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial)
    orbit.position.set(1.4, 0.44, -0.2)
    orbit.rotation.z = -0.26
    scene.add(orbit)

    const beaconGeometry = new THREE.SphereGeometry(0.065, 12, 8)
    const beaconMaterial = new THREE.MeshBasicMaterial({ color: 0xffd05a })
    const beacon = new THREE.Mesh(beaconGeometry, beaconMaterial)
    beacon.position.set(-1.85, -1.15, 0.2)
    scene.add(beacon)

    const pointer = { x: 0, y: 0 }
    const handlePointer = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect()
      if (!bounds.width || !bounds.height) return
      pointer.x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1))
      pointer.y = Math.max(-1, Math.min(1, -(((event.clientY - bounds.top) / bounds.height) * 2 - 1)))
    }
    host.addEventListener('pointermove', handlePointer, { passive: true })

    const resize = () => {
      const width = Math.max(host.clientWidth, 1)
      const height = Math.max(host.clientHeight, 1)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    resize()

    let frame = 0
    let running = !document.hidden
    const renderFrame = () => {
      if (!running) return
      frame = window.requestAnimationFrame(renderFrame)
      planet.rotation.y += 0.00045
      starField.rotation.y += 0.00008
      camera.position.x += (pointer.x * 0.14 - camera.position.x) * 0.025
      camera.position.y += (pointer.y * 0.1 - camera.position.y) * 0.025
      camera.lookAt(0.35, 0.1, 0)
      renderer.render(scene, camera)
    }
    const handleVisibility = () => {
      running = !document.hidden
      if (running && frame === 0) renderFrame()
      if (!running && frame !== 0) {
        window.cancelAnimationFrame(frame)
        frame = 0
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    renderFrame()
    onReady?.()

    return () => {
      running = false
      if (frame !== 0) window.cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', handleVisibility)
      host.removeEventListener('pointermove', handlePointer)
      resizeObserver.disconnect()
      planetGeometry.dispose()
      planetMaterial.dispose()
      starGeometry.dispose()
      starMaterial.dispose()
      orbitGeometry.dispose()
      orbitMaterial.dispose()
      beaconGeometry.dispose()
      beaconMaterial.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }, [onError, onReady])

  return <div className="night-sky-scene" ref={hostRef} />
}
