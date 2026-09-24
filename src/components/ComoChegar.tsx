import { Eye, MapPin, Navigation } from 'lucide-react'
import { ADDRESS, ADDRESS_FULL } from '@/lib/config'
import { maps } from '@/lib/maps'
import CopiarEndereco from './CopiarEndereco'
import Mascote from './festa/Mascote'

export default function ComoChegar() {
  return (
    <section id="como-chegar" className="px-5 pb-20 md:pb-28" aria-labelledby="titulo-local">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div>
          <h2 id="titulo-local" className="font-display text-4xl md:text-6xl">
            Como chegar
          </h2>

          <address className="mt-6 flex gap-3 not-italic">
            <MapPin className="mt-1 h-7 w-7 shrink-0 text-veludo" aria-hidden />
            <span>
              <span className="block font-display text-2xl md:text-3xl">{ADDRESS.street}</span>
              <span className="mt-1 block text-lg text-tinta">
                {ADDRESS.district}, {ADDRESS.cityState}
              </span>
              <span className="block text-tinta">CEP {ADDRESS.zip}</span>
            </span>
          </address>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a
              href={maps.route}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-veludo px-5 font-label text-palco-claro transition hover:bg-veludo-escuro active:scale-95 sm:col-span-2"
            >
              <Navigation className="h-5 w-5" /> Traçar rota no Google Maps
            </a>
            <a
              href={maps.waze}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-circo px-5 font-label text-palco-claro transition hover:brightness-110 active:scale-95"
            >
              <Navigation className="h-5 w-5 rotate-45" /> Abrir no Waze
            </a>
            <CopiarEndereco texto={ADDRESS_FULL} />
            {maps.streetView && (
              <a
                href={maps.streetView}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-ouro px-5 font-label text-cartola transition hover:bg-ouro-claro active:scale-95 sm:col-span-2"
              >
                <Eye className="h-5 w-5" /> Ver a rua no Street View
              </a>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[32px] border-[3px] border-cartola bg-palco shadow-[0_10px_0_var(--color-cartola)]">
            <iframe
              title={`Mapa: ${ADDRESS_FULL}`}
              src={maps.embed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-[300px] w-full sm:h-[380px] lg:h-[440px]"
            />
          </div>
          <a
            href={maps.open}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute -top-5 left-5 flex -rotate-3 items-center gap-2 rounded-full border-[3px] border-cartola bg-ouro-claro px-4 py-2 font-display text-lg shadow-[0_4px_0_var(--color-cartola)] transition hover:rotate-0"
          >
            <MapPin className="h-5 w-5 text-veludo" aria-hidden /> Estamos aqui!
          </a>
          <Mascote className="absolute -bottom-8 -right-3 w-24 sm:w-28 lg:-right-8 lg:w-32" />
        </div>
      </div>
    </section>
  )
}
