import 'server-only'
import { randomInt } from 'node:crypto'
import { z } from 'zod'
import { db, isUniqueViolation } from './db'
import {
  BOOKING_WINDOW_MONTHS,
  EVENT_MIN_LEAD_DAYS,
  EVENT_TYPES,
  MAX_GUESTS,
  PRICE_PER_DAY_CENTS,
  VISIT_MIN_LEAD_DAYS,
  VISIT_SLOTS,
  VISIT_WEEKDAYS,
  type BookingKind,
  type BookingStatus,
} from './config'
import { addDaysISO, addMonthsISO, todayISO, weekday, type ISODate } from './dates'

z.config(z.locales.pt())

export type Booking = {
  id: string
  code: string
  kind: BookingKind
  date: ISODate
  time: string | null
  status: BookingStatus
  event_type: string | null
  guests: number | null
  customer_name: string
  phone: string
  email: string | null
  notes: string | null
  admin_notes: string | null
  price_cents: number | null
  created_at: string
}

const COLUMNS = `id, code, kind, date::text as date, time, status, event_type, guests, customer_name,
  phone, email, notes, admin_notes, price_cents, created_at::text as created_at`

export type Availability = {
  /** Dias sem festa possível: já reservados ou bloqueados. */
  eventDates: ISODate[]
  /** Horários de visita ocupados por dia. */
  visitSlots: Record<ISODate, string[]>
  /** Dias fechados pelo administrador (sem festa nem visita). */
  blockedDates: ISODate[]
}

export async function getAvailability(from: ISODate, to: ISODate): Promise<Availability> {
  const sql = db()
  const [active, blocked] = await Promise.all([
    sql`select kind, date::text as date, time from bookings
        where date between ${from} and ${to} and status in ('pendente', 'confirmada')`,
    sql`select date::text as date from blocked_dates where date between ${from} and ${to}`,
  ])

  const eventDates = new Set<ISODate>()
  const visitSlots: Record<ISODate, string[]> = {}
  for (const row of active) {
    if (row.kind === 'evento') eventDates.add(row.date)
    else (visitSlots[row.date] ??= []).push(row.time)
  }
  const blockedDates = blocked.map((r) => r.date as ISODate)
  return { eventDates: [...eventDates], visitSlots, blockedDates }
}

const phone = z
  .string()
  .transform((v) => v.replace(/\D/g, ''))
  .refine((v) => v.length >= 10 && v.length <= 13, 'Informe um WhatsApp com DDD.')

const base = {
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Escolha uma data.'),
  customerName: z.string().trim().min(2, 'Informe seu nome.').max(120),
  phone,
  email: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((v) => v || undefined)
    .pipe(z.email('E-mail inválido.').optional()),
  notes: z.string().trim().max(1000).optional(),
  /** Campo isca: humanos não preenchem. */
  website: z.string().max(0).optional(),
}

export const bookingInput = z.discriminatedUnion('kind', [
  z.object({
    ...base,
    kind: z.literal('evento'),
    eventType: z.enum(EVENT_TYPES, 'Escolha o tipo de festa.'),
    guests: z.coerce.number().int().min(1, 'Informe quantos convidados.').max(MAX_GUESTS, `Máximo de ${MAX_GUESTS} convidados.`),
  }),
  z.object({
    ...base,
    kind: z.literal('visita'),
    time: z.enum(VISIT_SLOTS, 'Escolha um horário.'),
  }),
])

export type BookingInput = z.input<typeof bookingInput>

export class BookingError extends Error {
  constructor(message: string, public status = 400) {
    super(message)
  }
}

function generateCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += alphabet[randomInt(alphabet.length)]
  return `SF-${code}`
}

function checkDateWindow(kind: BookingKind, date: ISODate) {
  const today = todayISO()
  const min = addDaysISO(today, kind === 'evento' ? EVENT_MIN_LEAD_DAYS : VISIT_MIN_LEAD_DAYS)
  const max = addMonthsISO(today, BOOKING_WINDOW_MONTHS)
  if (date < min) {
    throw new BookingError(
      kind === 'evento'
        ? `Festas precisam ser reservadas com ${EVENT_MIN_LEAD_DAYS} dias de antecedência. Para datas mais próximas, chame no WhatsApp.`
        : 'Visitas podem ser agendadas a partir de amanhã.',
    )
  }
  if (date > max) throw new BookingError(`A agenda está aberta até ${BOOKING_WINDOW_MONTHS} meses à frente.`)
  if (kind === 'visita' && !VISIT_WEEKDAYS.includes(weekday(date))) {
    throw new BookingError('Não fazemos visitas nesse dia da semana.')
  }
}

export async function createBooking(raw: unknown): Promise<Booking> {
  const parsed = bookingInput.safeParse(raw)
  if (!parsed.success) throw new BookingError(parsed.error.issues[0]?.message ?? 'Dados inválidos.')
  const input = parsed.data
  if (input.website) throw new BookingError('Dados inválidos.')

  checkDateWindow(input.kind, input.date)

  const sql = db()
  const [blocked] = await sql`select 1 from blocked_dates where date = ${input.date}`
  if (blocked) throw new BookingError('Essa data não está disponível. Escolha outro dia.', 409)

  if (input.kind === 'visita') {
    const [eventThatDay] = await sql`select 1 from bookings
      where date = ${input.date} and kind = 'evento' and status in ('pendente', 'confirmada')`
    if (eventThatDay) throw new BookingError('Nesse dia o espaço está ocupado com uma festa. Escolha outro dia para a visita.', 409)
  }

  const isEvent = input.kind === 'evento'
  // Tenta de novo só no caso raríssimo de código repetido.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const [row] = await sql.query(
        `insert into bookings (code, kind, date, time, event_type, guests, customer_name, phone, email, notes, price_cents)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         returning ${COLUMNS}`,
        [
          generateCode(),
          input.kind,
          input.date,
          isEvent ? null : input.time,
          isEvent ? input.eventType : null,
          isEvent ? input.guests : null,
          input.customerName,
          input.phone,
          input.email ?? null,
          input.notes || null,
          isEvent ? PRICE_PER_DAY_CENTS : null,
        ],
      )
      return row as Booking
    } catch (err) {
      if (!isUniqueViolation(err)) throw err
      const constraint = (err as { constraint?: string }).constraint ?? ''
      if (constraint.includes('evento_por_dia')) {
        throw new BookingError('Essa data acabou de ser reservada por outra pessoa. Escolha outro dia.', 409)
      }
      if (constraint.includes('visita_por_horario')) {
        throw new BookingError('Esse horário acabou de ser ocupado. Escolha outro.', 409)
      }
    }
  }
  throw new BookingError('Não foi possível registrar agora. Tente de novo.', 500)
}

export async function getBookingByCode(code: string): Promise<Booking | null> {
  const [row] = await db().query(`select ${COLUMNS} from bookings where code = $1`, [code.toUpperCase()])
  return (row as Booking) ?? null
}

// ---------- Admin ----------

export type BookingFilter = { status?: BookingStatus | 'ativas' | 'todas'; kind?: BookingKind; from?: ISODate; to?: ISODate }

export async function listBookings(filter: BookingFilter = {}): Promise<Booking[]> {
  const where: string[] = []
  const params: unknown[] = []
  const add = (clause: string, value: unknown) => {
    params.push(value)
    where.push(clause.replace('?', `$${params.length}`))
  }
  if (filter.status === 'ativas' || !filter.status) where.push(`status in ('pendente', 'confirmada')`)
  else if (filter.status !== 'todas') add('status = ?', filter.status)
  if (filter.kind) add('kind = ?', filter.kind)
  if (filter.from) add('date >= ?', filter.from)
  if (filter.to) add('date <= ?', filter.to)

  const rows = await db().query(
    `select ${COLUMNS} from bookings ${where.length ? 'where ' + where.join(' and ') : ''}
     order by date asc, time asc nulls first limit 500`,
    params,
  )
  return rows as Booking[]
}

export async function getStats() {
  const today = todayISO()
  const [row] = await db()`
    select
      count(*) filter (where status = 'pendente')::int as pendentes,
      count(*) filter (where kind = 'evento' and status = 'confirmada' and date >= ${today})::int as festas_futuras,
      count(*) filter (where kind = 'visita' and status in ('pendente', 'confirmada') and date >= ${today})::int as visitas_futuras,
      coalesce(sum(price_cents) filter (
        where kind = 'evento' and status in ('confirmada', 'concluida')
        and date_trunc('month', date) = date_trunc('month', ${today}::date)
      ), 0)::int as receita_mes
    from bookings`
  return row as { pendentes: number; festas_futuras: number; visitas_futuras: number; receita_mes: number }
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  try {
    await db()`update bookings set status = ${status}, updated_at = now() where id = ${id}`
  } catch (err) {
    if (isUniqueViolation(err)) throw new BookingError('Já existe outra reserva ativa nessa data ou horário.', 409)
    throw err
  }
}

export async function updateBookingNotes(id: string, adminNotes: string) {
  await db()`update bookings set admin_notes = ${adminNotes || null}, updated_at = now() where id = ${id}`
}

export async function listBlockedDates(): Promise<{ date: ISODate; reason: string | null }[]> {
  const rows = await db()`select date::text as date, reason from blocked_dates where date >= ${todayISO()} order by date`
  return rows as { date: ISODate; reason: string | null }[]
}

export async function blockDate(date: ISODate, reason: string) {
  await db()`insert into blocked_dates (date, reason) values (${date}, ${reason || null})
             on conflict (date) do update set reason = excluded.reason`
}

export async function unblockDate(date: ISODate) {
  await db()`delete from blocked_dates where date = ${date}`
}
