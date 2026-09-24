import Image from 'next/image'
import { Armchair, Car, CookingPot, Flame, MessageCircle, Snowflake, Users } from 'lucide-react'
import ComoChegar from '@/components/ComoChegar'
import Hero from '@/components/Hero'
import SiteHeader from '@/components/SiteHeader'
import BookingWizard from '@/components/booking/BookingWizard'
import Animacoes from '@/components/festa/Animacoes'
import Faixa from '@/components/festa/Faixa'
import Mascote from '@/components/festa/Mascote'
import { ADDRESS, EVENT_MIN_LEAD_DAYS, VISIT_SLOTS, MAX_GUESTS, PRICE_PER_DAY_CENTS, WHATSAPP_DISPLAY } from '@/lib/config'
import { formatBRL } from '@/lib/dates'
import { whatsappLink } from '@/lib/whatsapp'

// Cada item vira um adesivo com cor e inclinação próprias.
const INCLUDED = [
  { icon: Users, title: `Até ${MAX_GUESTS} convidados`, text: 'Espaço para pista, mesas e aquela fila do parabéns.', tone: 'bg-veludo text-palco-claro', tilt: '-rotate-2' },
  { icon: Snowflake, title: 'Climatizado', text: 'Ar-condicionado no salão inteiro, mesmo em janeiro.', tone: 'bg-circo text-palco-claro', tilt: 'rotate-1' },
  { icon: Flame, title: 'Churrasqueira', text: 'Área gourmet para o churrasco sair junto com a festa.', tone: 'bg-ouro text-cartola', tilt: '-rotate-1' },
  { icon: CookingPot, title: 'Cozinha equipada', text: 'Apoio para o buffet ou para quem cozinha em casa.', tone: 'bg-palco-claro text-cartola border-[3px] border-cartola', tilt: 'rotate-2' },
  { icon: Armchair, title: 'Mesas e cadeiras', text: 'Já inclusas na diária, para todo mundo sentar.', tone: 'bg-cartola text-palco-claro', tilt: '-rotate-1' },
  { icon: Car, title: 'Estacionamento', text: 'Convidado chega e já tem onde parar.', tone: 'bg-circo-claro text-cartola', tilt: 'rotate-1' },
]

const GALLERY = [
  { src: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=700&q=80', alt: 'Balões e decoração de aniversário', caption: 'Aniversário', tilt: '-rotate-3' },
  { src: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=700&q=80', alt: 'Salão com mesas decoradas', caption: 'Casamento', tilt: 'rotate-2' },
  { src: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=700&q=80', alt: 'Mesa de buffet', caption: 'Buffet', tilt: '-rotate-1' },
  { src: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=700&q=80', alt: 'Convidados celebrando', caption: 'Confraternização', tilt: 'rotate-3' },
]

const HOW = [
  { title: 'Escolha a data', text: 'O calendário mostra na hora os dias livres.' },
  { title: 'Envie o pedido', text: 'A data fica guardada no seu nome e você recebe um protocolo.' },
  { title: 'Confirme pelo WhatsApp', text: 'Combinamos os detalhes e o pagamento direto com você.' },
]

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Faixa />

        {/* O espaço */}
        <section id="espaco" className="relative px-5 py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-end gap-4 md:grid-cols-[1fr_auto] md:gap-8">
              <div>
                <h2 className="font-display text-4xl md:text-6xl">
                  Tá tudo pronto.
                  <span className="block text-veludo">Só falta a festa.</span>
                </h2>
                <p className="mt-6 max-w-xl text-lg text-tinta">
                  Você chega com os convidados, o bolo e a playlist. O resto a gente já deixou no salão.
                </p>
              </div>

              {/* O mascote "pisa" nos adesivos e aponta para o balão. */}
              <div data-anim="mascote" className="relative z-10 -mb-14 ml-auto w-44 sm:w-52 md:-mb-24 md:w-64 lg:-mb-28 lg:w-80">
                <p data-anim="balao" className="absolute right-[80%] top-[14%] w-max max-w-[11rem] -rotate-6 rounded-3xl border-[3px] border-cartola bg-ouro-claro px-4 py-2.5 font-display text-lg leading-tight text-cartola shadow-[0_4px_0_var(--color-cartola)] sm:max-w-[13rem] md:text-xl lg:max-w-[15rem]">
                  Olha tudo que já vem na diária!
                  <span
                    className="absolute -right-[11px] top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 border-r-[3px] border-t-[3px] border-cartola bg-ouro-claro"
                    aria-hidden
                  />
                </p>
                <Mascote apontaEsquerda acena />
              </div>
            </div>

            <ul className="mt-6 grid gap-5 sm:grid-cols-2 md:mt-10 lg:grid-cols-3">
              {INCLUDED.map(({ icon: Icon, title, text, tone, tilt }) => (
                <li key={title} data-anim="adesivo" className={`adesivo ${tilt} rounded-[26px] p-6 shadow-[0_10px_0_-2px_rgb(26_18_14/0.9)] ${tone}`}>
                  <Icon className="h-7 w-7" aria-hidden />
                  <p className="mt-4 font-display text-2xl">{title}</p>
                  <p className="mt-1 opacity-85">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Galeria */}
        <section className="overflow-hidden bg-circo px-5 py-20 text-palco-claro md:py-24" aria-labelledby="titulo-galeria">
          <div className="mx-auto max-w-6xl">
            <h2 id="titulo-galeria" className="text-center font-display text-4xl md:text-5xl">
              Cada festa de um jeito
            </h2>
            <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4 md:gap-x-7">
              {GALLERY.map((img) => (
                <figure key={img.src} data-anim="polaroide" className={`polaroide relative ${img.tilt}`}>
                  <span className="fita" aria-hidden />
                  <div className="relative aspect-[4/5] overflow-hidden bg-palco">
                    <Image src={img.src} alt={img.alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
                  </div>
                  <figcaption className="absolute inset-x-0 bottom-2 text-center font-display text-lg text-cartola">
                    {img.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-10 text-center text-sm text-circo-claro">Imagens ilustrativas. Fotos do salão em breve.</p>
          </div>
        </section>

        {/* Valor */}
        <section id="valores" className="px-5 py-20 md:py-28">
          <div
            data-anim="ingresso"
            className="ingresso mx-auto flex max-w-4xl -rotate-1 flex-col overflow-hidden rounded-3xl bg-ouro text-cartola shadow-[0_24px_50px_-24px_rgb(26_18_14/0.55)] md:flex-row md:rounded-none"
            style={{ ['--corte' as string]: '66%' }}
          >
            <div className="relative min-w-0 flex-1 p-6 sm:p-8 md:p-10">
              <p className="font-label text-sm">Ingresso · diária completa</p>
              <p className="mt-2 whitespace-nowrap font-display text-[clamp(2.5rem,14vw,4.5rem)] md:text-7xl lg:text-8xl">{formatBRL(PRICE_PER_DAY_CENTS)}</p>
              <p className="mt-4 max-w-md">
                O salão fica só seu o dia inteiro, com tudo aquilo ali de cima incluso. Sem taxa para reservar pelo site.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3 border-t-[3px] border-dashed border-cartola/40 bg-veludo p-6 text-palco-claro sm:p-8 md:w-[34%] md:border-l-[3px] md:border-t-0 md:p-10">
              <p className="font-label text-sm text-ouro-claro">Admite</p>
              <p className="font-display text-3xl leading-tight">até {MAX_GUESTS} convidados</p>
              <a
                href="#reservar-data"
                className="mt-2 rounded-full bg-palco-claro px-6 py-3 text-center font-label text-cartola shadow-[0_5px_0_var(--color-cartola)] transition hover:-translate-y-0.5"
              >
                Ver datas livres
              </a>
            </div>
          </div>
        </section>

        <ComoChegar />

        {/* Agendamento */}
        <section id="reservar" className="relative bg-veludo text-palco-claro">
          <span id="reservar-data" className="absolute top-0" aria-hidden />
          <span id="agendar-visita" className="absolute top-0" aria-hidden />
          <div className="mx-auto grid max-w-6xl items-start gap-10 px-5 py-20 md:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="lg:sticky lg:top-28">
              <h2 className="font-display text-5xl md:text-6xl">Reserve sua data</h2>
              <p className="mt-5 max-w-md text-lg text-palco/90">
                A agenda aqui é a mesma que a gente usa. Se o dia aparece livre, ele está livre.
              </p>

              <ol className="mt-10 space-y-6">
                {HOW.map((item, i) => (
                  <li key={item.title} className="flex gap-4">
                    <span data-anim="passo" className="flex h-11 w-11 shrink-0 -rotate-6 items-center justify-center rounded-full bg-ouro font-display text-xl text-cartola">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-label text-lg">{item.title}</p>
                      <p className="text-palco/80">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div data-anim="mascote" className="mt-10 hidden items-end gap-4 lg:flex">
                <Mascote className="w-36 shrink-0" />
                <p data-anim="balao" className="mb-16 rounded-3xl rounded-bl-none bg-palco-claro px-5 py-3 font-label text-cartola">
                  É só escolher ali do lado!
                </p>
              </div>

              <p className="mt-10 text-sm text-palco/80 lg:mt-4">
                Festa daqui a menos de {EVENT_MIN_LEAD_DAYS} dias?{' '}
                <a
                  href={whatsappLink('Olá! Queria saber se tem data livre no Espaço Festas Saraiva para os próximos dias.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-label text-ouro-claro underline underline-offset-4"
                >
                  Chame no WhatsApp
                </a>
                .
              </p>
            </div>

            <BookingWizard />
          </div>
        </section>
      </main>

      <footer className="relative overflow-hidden bg-cartola px-5 pb-8 pt-16 text-palco-claro md:pt-20">
        <div className="mx-auto grid max-w-6xl items-end gap-10 md:grid-cols-[auto_1fr_auto] md:gap-12">
          <Mascote noite acena className="mx-auto w-32 md:mx-0 md:w-40" />

          <div className="text-center md:text-left">
            <p className="font-display text-4xl text-ouro-claro md:text-5xl">Bora fazer festa?</p>
            <p className="mt-3 max-w-md text-palco/80 md:max-w-none">
              Escolha a data no site ou chame a gente no WhatsApp. Respondemos rapidinho.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:justify-start">
              <a
                href="#reservar-data"
                className="flex h-12 w-full items-center justify-center rounded-full bg-veludo px-7 font-label text-palco-claro transition hover:bg-veludo-escuro sm:w-auto"
              >
                Reservar data
              </a>
              <a
                href={whatsappLink('Olá! Vim pelo site do Espaço Festas Saraiva.')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-[3px] border-palco-claro px-6 font-label transition hover:bg-palco-claro hover:text-cartola sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" /> {WHATSAPP_DISPLAY}
              </a>
            </div>
          </div>

          <dl className="grid gap-4 text-center text-sm md:text-right">
            <div>
              <dt className="text-palco/55">Onde</dt>
              <dd className="font-label text-base">
                <a href="#como-chegar" className="hover:text-ouro-claro">
                  {ADDRESS.street}
                  <span className="block font-body text-sm text-palco/70">{ADDRESS.district}, {ADDRESS.cityState}</span>
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-palco/55">Visitas</dt>
              <dd className="font-label text-base">
                Seg. a sáb., {VISIT_SLOTS[0].replace(':00', 'h')} às {VISIT_SLOTS[VISIT_SLOTS.length - 1].replace(':00', 'h')}
              </dd>
            </div>
            <div>
              <dt className="text-palco/55">Festas</dt>
              <dd className="font-label text-base">Diária de {formatBRL(PRICE_PER_DAY_CENTS)}</dd>
            </div>
          </dl>
        </div>

        <div className="mx-auto mt-14 flex max-w-6xl flex-col items-center justify-between gap-2 border-t border-palco/15 pt-6 text-sm text-palco/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Espaço Festas Saraiva</p>
          <a href="/admin" className="hover:text-palco">Área do administrador</a>
        </div>
      </footer>
      <Animacoes />
    </>
  )
}
