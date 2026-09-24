'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const CORES = ['#c8262c', '#e5a823', '#17756f', '#1a120e', '#fff8ec', '#f28aa0']

type Balao = { group: THREE.Group; speed: number; sway: number; phase: number; baseX: number }

/**
 * Balões 3D subindo atrás do letreiro. Leve de propósito:
 * poucos balões no celular, resolução limitada, pausa fora da tela
 * e fica parado para quem pediu menos movimento.
 */
export default function Baloes3D() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.matchMedia('(max-width: 767px)').matches

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: true, powerPreference: 'low-power' })
    } catch {
      return // Sem WebGL: o letreiro segura a cena sozinho.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.75))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    camera.position.set(0, 0, 18)

    scene.add(new THREE.HemisphereLight('#fff6e0', '#c8262c', 1.6))
    const sol = new THREE.DirectionalLight('#ffffff', 2.4)
    sol.position.set(4, 6, 8)
    scene.add(sol)

    // Geometria compartilhada: esfera esticada + nó + fio.
    const corpo = new THREE.SphereGeometry(1, mobile ? 20 : 32, mobile ? 16 : 24)
    corpo.scale(1, 1.18, 1)
    const no = new THREE.ConeGeometry(0.16, 0.26, 10)
    const fioGeo = new THREE.BufferGeometry().setFromPoints(
      Array.from({ length: 12 }, (_, i) => new THREE.Vector3(Math.sin(i * 0.9) * 0.08, -1.3 - i * 0.22, 0)),
    )
    const fioMat = new THREE.LineBasicMaterial({ color: '#7e5a3f', transparent: true, opacity: 0.6 })
    const materiais = CORES.map(
      (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.22, metalness: 0.08 }),
    )

    const total = mobile ? 5 : 9
    const baloes: Balao[] = []
    let largura = 12
    let altura = 10

    const sortearX = () => (Math.random() - 0.5) * largura * 1.1
    for (let i = 0; i < total; i++) {
      const mat = materiais[i % materiais.length]
      const group = new THREE.Group()
      const b = new THREE.Mesh(corpo, mat)
      const n = new THREE.Mesh(no, mat)
      n.position.y = -1.22
      n.rotation.x = Math.PI
      group.add(b, n, new THREE.Line(fioGeo, fioMat))
      const escala = 0.55 + Math.random() * 0.55
      group.scale.setScalar(escala)
      group.position.set(sortearX(), (Math.random() - 0.5) * altura * 1.6, -2 - Math.random() * 6)
      scene.add(group)
      baloes.push({ group, speed: 0.35 + Math.random() * 0.45, sway: 0.3 + Math.random() * 0.5, phase: Math.random() * 10, baseX: group.position.x })
    }

    const redimensionar = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      altura = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
      largura = altura * camera.aspect
    }
    redimensionar()
    const ro = new ResizeObserver(redimensionar)
    ro.observe(mount)

    // Parallax leve com mouse ou dedo.
    const alvo = { x: 0, y: 0 }
    const mover = (e: PointerEvent) => {
      alvo.x = (e.clientX / window.innerWidth - 0.5) * 1.6
      alvo.y = (e.clientY / window.innerHeight - 0.5) * -1
    }
    window.addEventListener('pointermove', mover, { passive: true })

    const relogio = new THREE.Clock()
    let rodando = false
    let frame = 0

    const desenhar = () => {
      const dt = Math.min(relogio.getDelta(), 0.05)
      const t = relogio.elapsedTime
      for (const b of baloes) {
        const p = b.group.position
        p.y += b.speed * dt
        p.x = b.baseX + Math.sin(t * b.sway + b.phase) * 0.6
        b.group.rotation.z = Math.sin(t * b.sway + b.phase) * 0.12
        if (p.y > altura * 0.75) {
          p.y = -altura * 0.75
          b.baseX = sortearX()
        }
      }
      camera.position.x += (alvo.x - camera.position.x) * 0.04
      camera.position.y += (alvo.y - camera.position.y) * 0.04
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }

    const loop = () => {
      desenhar()
      frame = requestAnimationFrame(loop)
    }

    if (reduced) {
      desenhar()
    } else {
      // Só anima enquanto a abertura está na tela.
      const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !rodando) {
          rodando = true
          relogio.getDelta()
          loop()
        } else if (!entry.isIntersecting && rodando) {
          rodando = false
          cancelAnimationFrame(frame)
        }
      })
      io.observe(mount)
      mount.dataset.io = '1'
      ;(mount as HTMLDivElement & { _io?: IntersectionObserver })._io = io
    }

    renderer.compile(scene, camera)
    requestAnimationFrame(() => mount.classList.add('opacity-100'))

    return () => {
      cancelAnimationFrame(frame)
      ;(mount as HTMLDivElement & { _io?: IntersectionObserver })._io?.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', mover)
      corpo.dispose()
      no.dispose()
      fioGeo.dispose()
      fioMat.dispose()
      materiais.forEach((m) => m.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-1000 [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full"
      // Some suave nas bordas: o balão desaparece em vez de ser cortado no limite da área.
      style={{
        maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 55%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 55%, transparent 100%)',
      }}
      aria-hidden
    />
  )
}
