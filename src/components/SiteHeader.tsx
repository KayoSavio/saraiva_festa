import Image from 'next/image'
import { MessageCircle } from 'lucide-react'
import { WHATSAPP_DISPLAY } from '@/lib/config'
import { whatsappLink } from '@/lib/whatsapp'

const LINKS = [
  { href: '#espaco', label: 'O espaço' },
  { href: '#valores', label: 'Valor' },
  { href: '#como-chegar', label: 'Como chegar' },
  { href: '#agendar-visita', label: 'Visitar' },
]

/** Placa flutuante: a logo escapa um pouco para fora, como letreiro pendurado. */
export default function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 rounded-full border-[3px] border-cartola bg-palco-claro pl-3 pr-[7px] shadow-[0_10px_28px_-14px_rgb(26_18_14/0.45)] sm:pl-5">
        <a href="#" aria-label="Espaço Festas Saraiva, início" className="-my-4 shrink-0 transition hover:-rotate-2">
          <Image src="/saraivaFesta.svg" alt="" width={130} height={80} className="h-[76px] w-auto drop-shadow-[0_2px_0_var(--color-palco-claro)]" priority />
        </a>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Principal">
          <ul className="mr-2 hidden items-center gap-6 lg:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="font-label text-[0.95rem] decoration-veludo decoration-wavy decoration-2 underline-offset-[6px] transition hover:text-veludo hover:underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={whatsappLink('Olá! Vim pelo site do Espaço Festas Saraiva.')}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WhatsApp ${WHATSAPP_DISPLAY}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-circo text-palco-claro transition hover:-rotate-12 active:scale-95"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
          <a
            href="#reservar-data"
            className="flex h-11 items-center rounded-full bg-veludo px-4 font-label text-palco-claro transition hover:bg-veludo-escuro active:scale-95 sm:px-6"
          >
            Reservar data
          </a>
        </nav>
      </div>
    </header>
  )
}
