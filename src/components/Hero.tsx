import Image from 'next/image'
import { Flame, Snowflake, Users } from 'lucide-react'
import { MAX_GUESTS, PRICE_PER_DAY_CENTS } from '@/lib/config'
import { formatBRL } from '@/lib/dates'
import BaloesLazy from './festa/BaloesLazy'
import Confete from './festa/Confete'

/** Abertura: chamada à esquerda, letreiro à direita, o conjunto centralizado na página. */
export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-palco-claro pt-20" aria-labelledby="titulo-hero">
      <Confete pieces={44} />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-10 sm:px-8 md:pt-14 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-2 lg:gap-14 lg:pb-16 lg:pt-4">
        <div className="relative z-10 order-2 text-center lg:order-1 lg:text-left">
          <h1 id="titulo-hero" className="font-display text-5xl text-balance text-cartola sm:text-6xl xl:text-7xl">
            <span data-anim="hero-linha" className="block">
              A festa é sua.
            </span>
            <span data-anim="hero-linha" className="mt-1 block text-veludo">
              O salão também.
            </span>
          </h1>
          <p data-anim="hero-texto" className="mx-auto mt-6 max-w-md text-lg text-tinta lg:mx-0">
            Salão de festas em Volta Redonda, pronto para aniversário, casamento, chá e confraternização. Diária de{' '}
            <strong className="font-label">{formatBRL(PRICE_PER_DAY_CENTS)}</strong>.
          </p>

          <ul className="mt-6 flex flex-wrap justify-center gap-2.5 lg:justify-start">
            <li data-anim="hero-pop" className="adesivo -rotate-2 rounded-full bg-circo px-4 py-1.5 font-label text-sm text-palco-claro">
              <Users className="mr-1.5 inline h-4 w-4 align-[-3px]" aria-hidden />
              Até {MAX_GUESTS} convidados
            </li>
            <li data-anim="hero-pop" className="adesivo rotate-1 rounded-full bg-ouro px-4 py-1.5 font-label text-sm text-cartola">
              <Snowflake className="mr-1.5 inline h-4 w-4 align-[-3px]" aria-hidden />
              Climatizado
            </li>
            <li data-anim="hero-pop" className="adesivo -rotate-1 rounded-full bg-cartola px-4 py-1.5 font-label text-sm text-palco-claro">
              <Flame className="mr-1.5 inline h-4 w-4 align-[-3px] text-ouro-claro" aria-hidden />
              Churrasqueira
            </li>
          </ul>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <a
              data-anim="hero-pop"
              href="#reservar-data"
              className="flex h-14 w-full items-center justify-center rounded-full bg-veludo px-8 font-label text-lg text-palco-claro shadow-[0_6px_0_var(--color-veludo-escuro)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_0_var(--color-veludo-escuro)] active:translate-y-1 active:shadow-[0_2px_0_var(--color-veludo-escuro)] sm:w-auto"
            >
              Ver datas livres
            </a>
            <a
              data-anim="hero-pop"
              href="#agendar-visita"
              className="flex h-14 w-full items-center justify-center rounded-full border-[3px] border-cartola bg-palco-claro px-7 font-label text-lg text-cartola transition hover:bg-cartola hover:text-palco-claro sm:w-auto"
            >
              Agendar uma visita
            </a>
          </div>
        </div>

        <div className="relative order-1 mx-auto w-full max-w-[440px] lg:order-2 lg:max-w-[520px]">
          <div className="raios absolute -inset-[35%] -z-10" aria-hidden />
          {/* Balões só em volta do letreiro: nunca passam atrás do texto. */}
          <div className="pointer-events-none absolute -inset-x-[18%] -bottom-[10%] -top-[55%] -z-10 lg:-bottom-[35%] lg:-left-[6%] lg:-right-[40%] lg:-top-[50%]">
            <BaloesLazy />
          </div>
          <div data-anim="letreiro" className="letreiro rotate-[1.5deg]">
            <div className="rounded-[18px] bg-palco-claro px-6 py-7 sm:px-10 sm:py-9">
              <Image src="/saraivaFesta.svg" alt="Espaço Festas Saraiva" width={400} height={247} priority className="h-auto w-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
