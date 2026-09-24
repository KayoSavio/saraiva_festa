'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const q = (sel: string) => gsap.utils.toArray<HTMLElement>(`[data-anim="${sel}"]`)

/**
 * Coreografia da página inteira. Os elementos só marcam `data-anim`;
 * a página continua sendo renderizada no servidor.
 */
export default function Animacoes() {
  useGSAP(() => {
    const root = document.documentElement
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Abertura: placa cai e balança, título sobe, adesivos pulam.
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onStart: () => root.classList.remove('anima-espera'),
        onComplete: () => window.dispatchEvent(new Event('abertura-pronta')),
      })
      tl.from(q('letreiro'), { y: -260, rotation: -9, autoAlpha: 0, duration: 1.3, ease: 'elastic.out(1, 0.45)' })
        .from(q('hero-linha'), { yPercent: 60, autoAlpha: 0, duration: 0.7, stagger: 0.12 }, 0.25)
        .from(q('hero-texto'), { y: 16, autoAlpha: 0, duration: 0.6 }, 0.55)
        .from(q('hero-pop'), { scale: 0.4, autoAlpha: 0, duration: 0.55, stagger: 0.07, ease: 'back.out(2.2)' }, 0.7)

      // Adesivos "grudam" na tela ao rolar.
      ScrollTrigger.batch(q('adesivo'), {
        start: 'top 88%',
        once: true,
        onEnter: (els) =>
          gsap.from(els, {
            scale: 1.25,
            rotation: () => gsap.utils.random(-14, 14),
            autoAlpha: 0,
            duration: 0.55,
            stagger: 0.09,
            ease: 'back.out(1.8)',
            clearProps: 'transform,opacity,visibility',
          }),
      })

      // Mascote entra pulando e o balão aparece depois.
      q('mascote').forEach((el) => {
        const balao = el.querySelector('[data-anim="balao"]')
        const t = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
        t.from(el, { x: 140, y: 40, rotation: 12, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.6)' })
        if (balao) t.from(balao, { scale: 0, transformOrigin: '100% 50%', duration: 0.45, ease: 'back.out(2.5)' }, '-=0.2')
      })

      // Polaroides caem no varal.
      ScrollTrigger.batch(q('polaroide'), {
        start: 'top 90%',
        once: true,
        onEnter: (els) =>
          gsap.from(els, {
            y: -120,
            rotation: () => gsap.utils.random(-20, 20),
            autoAlpha: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'bounce.out',
            clearProps: 'transform,opacity,visibility',
          }),
      })

      // Ingresso entra como carimbo.
      q('ingresso').forEach((el) =>
        gsap.from(el, {
          scale: 1.35,
          rotation: -8,
          autoAlpha: 0,
          duration: 0.6,
          ease: 'back.out(1.4)',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        }),
      )

      // Números do passo a passo pulam em sequência.
      ScrollTrigger.batch(q('passo'), {
        start: 'top 90%',
        once: true,
        onEnter: (els) => gsap.from(els, { scale: 0, rotation: -90, duration: 0.5, stagger: 0.15, ease: 'back.out(2)' }),
      })
    })

    // Sem animação: garante que nada fique escondido.
    mm.add('(prefers-reduced-motion: reduce)', () => {
      root.classList.remove('anima-espera')
      window.dispatchEvent(new Event('abertura-pronta'))
    })
  })

  return null
}
