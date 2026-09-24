'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import clsx from 'clsx'

export default function CopiarEndereco({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      // Navegadores antigos ou sem permissão: seleciona um campo escondido.
      const campo = document.createElement('textarea')
      campo.value = texto
      document.body.appendChild(campo)
      campo.select()
      document.execCommand('copy')
      campo.remove()
    }
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2200)
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className={clsx(
        'flex h-12 items-center justify-center gap-2 rounded-full border-[3px] border-cartola px-5 font-label transition active:scale-95',
        copiado ? 'bg-cartola text-palco-claro' : 'bg-palco-claro hover:bg-ouro-claro',
      )}
    >
      {copiado ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
      <span aria-live="polite">{copiado ? 'Copiado!' : 'Copiar endereço'}</span>
    </button>
  )
}
