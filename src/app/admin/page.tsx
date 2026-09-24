import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, LogOut, MessageCircle } from 'lucide-react'
import clsx from 'clsx'
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, parse, startOfMonth, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { requireAdmin } from '@/lib/auth'
import { getStats, listBlockedDates, listBookings, type Booking, type BookingFilter } from '@/lib/bookings'
import { STATUS_LABEL, type BookingKind, type BookingStatus } from '@/lib/config'
import { formatBRL, formatLong, formatShort, isoFromDate, todayISO } from '@/lib/dates'
import { customerWhatsapp } from '@/lib/whatsapp'
import { addBlockedDate, logout, removeBlockedDate, saveNotes, setStatus } from './actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Painel | Espaço Festas Saraiva', robots: { index: false } }

const TABS: { id: NonNullable<BookingFilter['status']>; label: string }[] = [
  { id: 'ativas', label: 'Próximas' },
  { id: 'pendente', label: 'Pendentes' },
  { id: 'confirmada', label: 'Confirmadas' },
  { id: 'concluida', label: 'Concluídas' },
  { id: 'cancelada', label: 'Canceladas' },
  { id: 'todas', label: 'Todas' },
]

type Search = { status?: string; tipo?: string; mes?: string; erro?: string }

export default async function AdminPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin()
  const sp = await searchParams
  const today = todayISO()

  const status = (TABS.find((t) => t.id === sp.status)?.id ?? 'ativas') as BookingFilter['status']
  const kind = sp.tipo === 'evento' || sp.tipo === 'visita' ? (sp.tipo as BookingKind) : undefined
  const month = /^\d{4}-\d{2}$/.test(sp.mes ?? '') ? parse(sp.mes!, 'yyyy-MM', new Date()) : parse(today, 'yyyy-MM-dd', new Date())
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)

  const [stats, bookings, monthBookings, blocked] = await Promise.all([
    getStats(),
    listBookings({ status, kind, from: status === 'ativas' ? today : undefined }),
    listBookings({ status: 'ativas', from: isoFromDate(monthStart), to: isoFromDate(monthEnd) }),
    listBlockedDates(),
  ])

  const byDay = new Map<string, Booking[]>()
  for (const b of monthBookings) byDay.set(b.date, [...(byDay.get(b.date) ?? []), b])
  const blockedSet = new Set(blocked.map((b) => b.date))
  const days = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) })

  const link = (next: Partial<Search>) => {
    const params = new URLSearchParams()
    const merged = { status: sp.status, tipo: sp.tipo, mes: sp.mes, ...next }
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v)
    const qs = params.toString()
    return qs ? `/admin?${qs}` : '/admin'
  }

  return (
    <div className="min-h-svh">
      <header className="border-b border-cartola/10 bg-palco-claro">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/saraivaFesta.svg" alt="" width={80} height={50} className="h-10 w-auto" />
            <span className="font-display text-lg">Painel da agenda</span>
          </Link>
          <form action={logout}>
            <button className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-couro hover:bg-palco">
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-5 py-8">
        {sp.erro && (
          <p className="rounded-2xl bg-veludo/10 px-4 py-3 text-sm text-veludo" role="alert">
            {sp.erro}
          </p>
        )}

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Resumo">
          <Stat label="Aguardando confirmação" value={stats.pendentes} highlight={stats.pendentes > 0} />
          <Stat label="Festas confirmadas à frente" value={stats.festas_futuras} />
          <Stat label="Visitas marcadas" value={stats.visitas_futuras} />
          <Stat label="Diárias confirmadas no mês" value={formatBRL(stats.receita_mes)} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Calendário do mês */}
          <div className="rounded-3xl bg-palco-claro p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl first-letter:uppercase">{format(month, "MMMM 'de' yyyy", { locale: ptBR })}</h2>
              <div className="flex gap-1">
                <Link
                  href={link({ mes: format(addMonths(month, -1), 'yyyy-MM') })}
                  className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-palco"
                  aria-label="Mês anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Link>
                <Link
                  href={link({ mes: format(addMonths(month, 1), 'yyyy-MM') })}
                  className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-palco"
                  aria-label="Próximo mês"
                >
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-couro">
              {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {days.map((d) => {
                const iso = isoFromDate(d)
                const items = byDay.get(iso) ?? []
                const event = items.find((b) => b.kind === 'evento')
                const visits = items.filter((b) => b.kind === 'visita').length
                const inMonth = d.getMonth() === month.getMonth()
                return (
                  <div
                    key={iso}
                    className={clsx(
                      'flex min-h-16 flex-col rounded-xl p-1.5 text-left text-xs',
                      !inMonth && 'opacity-30',
                      event ? (event.status === 'confirmada' ? 'bg-veludo text-palco-claro' : 'bg-ouro-claro') : 'bg-palco/60',
                      blockedSet.has(iso) && 'bg-[repeating-linear-gradient(45deg,transparent_0_6px,rgb(0_0_0/0.08)_6px_12px)]',
                      iso === today && 'ring-2 ring-cartola',
                    )}
                    title={items.map((b) => `${b.kind === 'evento' ? 'Festa' : `Visita ${b.time}`}: ${b.customer_name}`).join('\n')}
                  >
                    <span className="font-label">{d.getDate()}</span>
                    {event && <span className="mt-auto truncate">{event.customer_name.split(' ')[0]}</span>}
                    {visits > 0 && (
                      <span className={clsx('truncate', !event && 'mt-auto')}>
                        {visits} visita{visits > 1 ? 's' : ''}
                      </span>
                    )}
                    {blockedSet.has(iso) && !event && <span className="mt-auto">Fechado</span>}
                  </div>
                )
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-couro">
              <Legend className="bg-veludo">Festa confirmada</Legend>
              <Legend className="bg-ouro-claro">Festa pendente</Legend>
              <Legend className="bg-[repeating-linear-gradient(45deg,transparent_0_3px,rgb(0_0_0/0.2)_3px_6px)]">Data fechada</Legend>
            </div>
          </div>

          {/* Datas fechadas */}
          <div className="rounded-3xl bg-palco-claro p-5">
            <h2 className="font-display text-xl">Fechar uma data</h2>
            <p className="mt-1 text-sm text-tinta">Some do calendário do site. Útil para manutenção ou uso próprio.</p>
            <form action={addBlockedDate} className="mt-4 flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
              <input type="date" name="date" required min={today} className={adminInput} />
              <input name="reason" placeholder="Motivo (opcional)" className={clsx(adminInput, 'flex-1')} maxLength={200} />
              <button className="rounded-full bg-cartola px-5 py-2.5 font-label text-sm text-palco-claro hover:bg-veludo">
                Fechar data
              </button>
            </form>
            <ul className="mt-5 divide-y divide-cartola/10">
              {blocked.length === 0 && <li className="py-2 text-sm text-couro">Nenhuma data fechada.</li>}
              {blocked.map((b) => (
                <li key={b.date} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span>
                    <span className="font-label">{formatShort(b.date)}</span>
                    {b.reason && <span className="text-couro"> {b.reason}</span>}
                  </span>
                  <form action={removeBlockedDate}>
                    <input type="hidden" name="date" value={b.date} />
                    <button className="text-veludo underline underline-offset-4">Reabrir</button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Lista */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav className="flex flex-wrap gap-1.5" aria-label="Filtrar por situação">
              {TABS.map((t) => (
                <Link
                  key={t.id}
                  href={link({ status: t.id === 'ativas' ? undefined : t.id })}
                  className={clsx(
                    'rounded-full px-4 py-2 font-label text-sm transition',
                    status === t.id ? 'bg-cartola text-palco-claro' : 'bg-palco-claro hover:bg-white',
                  )}
                >
                  {t.label}
                </Link>
              ))}
            </nav>
            <nav className="flex gap-1.5 text-sm" aria-label="Filtrar por tipo">
              {[
                { id: undefined, label: 'Tudo' },
                { id: 'evento', label: 'Festas' },
                { id: 'visita', label: 'Visitas' },
              ].map((t) => (
                <Link
                  key={t.label}
                  href={link({ tipo: t.id })}
                  className={clsx('rounded-full px-3 py-1.5', kind === t.id ? 'text-veludo underline underline-offset-4' : 'text-couro')}
                >
                  {t.label}
                </Link>
              ))}
            </nav>
          </div>

          <ul className="mt-5 space-y-3">
            {bookings.length === 0 && (
              <li className="rounded-3xl bg-palco-claro p-8 text-center text-couro">
                Nada por aqui. Quando alguém reservar pelo site, aparece nesta lista.
              </li>
            )}
            {bookings.map((b) => (
              <BookingItem key={b.id} booking={b} />
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}

const adminInput =
  'rounded-xl border border-cartola/20 bg-white/70 px-3 py-2.5 text-sm focus:border-veludo focus:outline-none focus:ring-2 focus:ring-veludo/15'

function Stat({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div className={clsx('rounded-3xl p-5', highlight ? 'bg-veludo text-palco-claro' : 'bg-palco-claro')}>
      <p className="font-display text-3xl">{value}</p>
      <p className={clsx('mt-1 text-sm', highlight ? 'text-palco/85' : 'text-couro')}>{label}</p>
    </div>
  )
}

function Legend({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={clsx('h-3 w-3 rounded', className)} /> {children}
    </span>
  )
}

const STATUS_TONE: Record<BookingStatus, string> = {
  pendente: 'bg-ouro-claro text-cartola',
  confirmada: 'bg-emerald-700 text-white',
  cancelada: 'bg-cartola/10 text-couro',
  concluida: 'bg-ouro text-cartola',
}

function BookingItem({ booking: b }: { booking: Booking }) {
  const isEvent = b.kind === 'evento'
  const actions: { status: BookingStatus; label: string; primary?: boolean }[] =
    b.status === 'pendente'
      ? [
          { status: 'confirmada', label: 'Confirmar', primary: true },
          { status: 'cancelada', label: 'Cancelar' },
        ]
      : b.status === 'confirmada'
        ? [
            { status: 'concluida', label: 'Marcar como concluída' },
            { status: 'cancelada', label: 'Cancelar' },
          ]
        : [{ status: 'pendente', label: 'Reabrir' }]

  // Mensagem pronta para o cliente, de acordo com a situação do pedido.
  const nome = b.customer_name.split(' ')[0]
  const quando = `${formatLong(b.date)}${b.time ? ` às ${b.time}` : ''}`
  const message = {
    pendente: isEvent
      ? `Olá, ${nome}! Aqui é do Espaço Festas Saraiva. Recebemos seu pedido de reserva ${b.code} para ${quando}. Podemos confirmar?`
      : `Olá, ${nome}! Aqui é do Espaço Festas Saraiva. Recebemos sua visita ${b.code} para ${quando}. Podemos confirmar?`,
    confirmada: isEvent
      ? `Olá, ${nome}! Sua festa no Espaço Festas Saraiva está *confirmada* para ${quando} (protocolo ${b.code}). O salão é todo seu!`
      : `Olá, ${nome}! Sua visita ao Espaço Festas Saraiva está *confirmada* para ${quando}. Te esperamos!`,
    cancelada: `Olá, ${nome}! Aqui é do Espaço Festas Saraiva. O agendamento ${b.code} de ${quando} foi cancelado. Se quiser remarcar, é só escolher outra data no site.`,
    concluida: `Olá, ${nome}! Obrigado por celebrar com a gente no Espaço Festas Saraiva. Volte sempre!`,
  }[b.status]

  return (
    <li className={clsx('rounded-3xl bg-palco-claro p-5', b.status === 'cancelada' && 'opacity-70')}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={clsx('rounded-full px-2.5 py-0.5 font-label text-xs', STATUS_TONE[b.status])}>
              {STATUS_LABEL[b.status]}
            </span>
            <span className="rounded-full border border-cartola/15 px-2.5 py-0.5 text-xs">{isEvent ? 'Festa' : 'Visita'}</span>
            <span className="text-xs text-couro">{b.code}</span>
          </div>
          <p className="mt-2 font-label text-lg first-letter:uppercase">
            {formatLong(b.date)}
            {b.time && ` às ${b.time}`}
          </p>
          <p className="text-tinta">
            {b.customer_name}
            {isEvent && ` · ${b.event_type}, ${b.guests} convidados`}
          </p>
          <p className="mt-1 flex flex-wrap gap-x-4 text-sm">
            <a
              href={customerWhatsapp(b.phone, message)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-veludo hover:underline"
            >
              <MessageCircle className="h-4 w-4" /> {b.phone}
            </a>
            {b.email && (
              <a href={`mailto:${b.email}`} className="text-couro hover:underline">
                {b.email}
              </a>
            )}
          </p>
          {b.notes && <p className="mt-3 max-w-2xl rounded-2xl bg-palco px-4 py-2.5 text-sm">{b.notes}</p>}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <a
            href={customerWhatsapp(b.phone, message)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-circo px-4 py-2 font-label text-sm text-palco-claro transition hover:brightness-110"
          >
            <MessageCircle className="h-4 w-4" /> Avisar cliente
          </a>
          {actions.map((a) => (
            <form key={a.status} action={setStatus}>
              <input type="hidden" name="id" value={b.id} />
              <input type="hidden" name="status" value={a.status} />
              <button
                className={clsx(
                  'rounded-full px-4 py-2 font-label text-sm transition',
                  a.primary ? 'bg-veludo text-palco-claro hover:bg-veludo-escuro' : 'border border-cartola/20 hover:border-cartola',
                )}
              >
                {a.label}
              </button>
            </form>
          ))}
        </div>
      </div>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-couro">
          {b.admin_notes ? 'Anotações internas' : 'Adicionar anotação interna'}
        </summary>
        <form action={saveNotes} className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input type="hidden" name="id" value={b.id} />
          <textarea
            name="admin_notes"
            defaultValue={b.admin_notes ?? ''}
            rows={2}
            className={clsx(adminInput, 'flex-1')}
            placeholder="Sinal pago, buffet, decoração..."
          />
          <button className="self-start rounded-full bg-cartola px-4 py-2 font-label text-sm text-palco-claro hover:bg-veludo">
            Salvar
          </button>
        </form>
      </details>
      <p className="mt-2 text-xs text-couro/70">Recebido em {formatShort(b.created_at.slice(0, 10))}</p>
    </li>
  )
}
