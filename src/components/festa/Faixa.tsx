import { EVENT_TYPES } from '@/lib/config'

/** Faixa preta rolando com os tipos de festa, como letreiro de parque. */
export default function Faixa() {
  const items = EVENT_TYPES.filter((t) => t !== 'Outro')
  const row = [...items, ...items]
  return (
    <div className="relative z-10 -rotate-1 overflow-hidden border-y-4 border-ouro bg-cartola py-3 text-ouro-claro">
      <div className="faixa flex w-max gap-8 whitespace-nowrap font-display text-xl md:text-2xl">
        {[...row, ...row].map((t, i) => (
          <span key={i} className="flex items-center gap-8">
            {t}
            <span className="text-veludo" aria-hidden>
              ★
            </span>
          </span>
        ))}
      </div>
      <span className="sr-only">Aniversários, casamentos, chás, formaturas, eventos corporativos e confraternizações.</span>
    </div>
  )
}
