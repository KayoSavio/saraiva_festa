'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// three.js só é baixado depois que a página está de pé.
const Baloes3D = dynamic(() => import('./Baloes3D'), { ssr: false })

export default function BaloesLazy() {
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    // Espera a entrada do GSAP terminar para não disputar o processador com ela.
    const iniciar = () => setPronto(true)
    window.addEventListener('abertura-pronta', iniciar, { once: true })
    const reserva = setTimeout(iniciar, 3000)
    return () => {
      window.removeEventListener('abertura-pronta', iniciar)
      clearTimeout(reserva)
    }
  }, [])

  return pronto ? <Baloes3D /> : null
}
