import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { getBookingByCode } from '@/lib/bookings'
import { STATUS_LABEL } from '@/lib/config'
import { formatBRL, formatLong } from '@/lib/dates'
import { whatsappLink } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Sua reserva | Espaço Festas Saraiva', robots: { index: false } }

const STATUS_TEXT = {
  pendente: 'Recebemos seu pedido. Vamos confirmar com você pelo WhatsApp.',
  confirmada: 'Está tudo certo. Te esperamos!',
  cancelada: 'Este agendamento foi cancelado. Se quiser remarcar, é só escolher outra data.',
  concluida: 'Obrigado por celebrar com a gente.',
} as const

export default async function ReservaPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  if (!/^SF-[A-Z0-9]{6}$/i.test(code)) notFound()
  const booking = await getBookingByCode(code)
  if (!booking) notFound()

  const isEvent = booking.kind === 'evento'
  const tone =
    booking.status === 'confirmada'
      ? 'bg-emerald-700 text-white'
      : booking.status === 'cancelada'
        ? 'bg-cartola/15 text-cartola'
        : booking.status === 'concluida'
          ? 'bg-ouro text-cartola'
          : 'bg-ouro-claro text-cartola'

  return (
    <main className="min-h-svh px-5 py-10">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="inline-block">
          <Image src="/saraivaFesta.svg" alt="Espaço Festas Saraiva" width={160} height={99} className="h-auto w-36" />
        </Link>

        <div className="mt-8 rounded-[28px] bg-palco-claro p-6 shadow-[0_20px_50px_-24px_rgb(0_0_0/0.35)] sm:p-8">
          <p className="text-sm text-couro">Protocolo {booking.code}</p>
          <h1 className="mt-1 font-display text-3xl">{isEvent ? 'Sua festa' : 'Sua visita'}</h1>
          <span className={`mt-4 inline-block rounded-full px-3 py-1 font-label text-sm ${tone}`}>
            {STATUS_LABEL[booking.status]}
          </span>
          <p className="mt-3 text-tinta">{STATUS_TEXT[booking.status]}</p>

          <dl className="mt-6 divide-y divide-cartola/10 border-y border-cartola/10 text-sm">
            <div className="flex gap-4 py-3">
              <dt className="w-24 shrink-0 text-couro">{isEvent ? 'Data' : 'Dia'}</dt>
              <dd className="first-letter:uppercase">
                {formatLong(booking.date)}
                {booking.time && ` às ${booking.time}`}
              </dd>
            </div>
            {isEvent && (
              <>
                <div className="flex gap-4 py-3">
                  <dt className="w-24 shrink-0 text-couro">Festa</dt>
                  <dd>
                    {booking.event_type}, {booking.guests} convidados
                  </dd>
                </div>
                {booking.price_cents && (
                  <div className="flex gap-4 py-3">
                    <dt className="w-24 shrink-0 text-couro">Diária</dt>
                    <dd>{formatBRL(booking.price_cents)}</dd>
                  </div>
                )}
              </>
            )}
            <div className="flex gap-4 py-3">
              <dt className="w-24 shrink-0 text-couro">Nome</dt>
              <dd>{booking.customer_name}</dd>
            </div>
          </dl>

          <a
            href={whatsappLink(`Olá! Sobre meu agendamento no Espaço Festas Saraiva, protocolo *${booking.code}*.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 flex items-center justify-center gap-2 rounded-full bg-veludo px-6 py-3.5 font-label text-palco-claro transition hover:bg-veludo-escuro"
          >
            <MessageCircle className="h-5 w-5" /> Falar sobre este agendamento
          </a>
        </div>
      </div>
    </main>
  )
}
