'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { ptBR } from 'react-day-picker/locale'
import 'react-day-picker/style.css'
import { CalendarHeart, Check, ChevronLeft, DoorOpen, Loader2, MessageCircle, PartyPopper } from 'lucide-react'
import clsx from 'clsx'
import {
  BOOKING_WINDOW_MONTHS,
  EVENT_MIN_LEAD_DAYS,
  EVENT_TYPES,
  MAX_GUESTS,
  PRICE_PER_DAY_CENTS,
  VISIT_MIN_LEAD_DAYS,
  VISIT_SLOTS,
  VISIT_WEEKDAYS,
  WHATSAPP_DISPLAY,
  type BookingKind,
} from '@/lib/config'
import { addDaysISO, addMonthsISO, dateFromISO, formatBRL, formatLong, isoFromDate, todayISO, type ISODate } from '@/lib/dates'
import { maskPhone, whatsappLink } from '@/lib/whatsapp'
import Confete from '@/components/festa/Confete'

type Availability = { eventDates: string[]; visitSlots: Record<string, string[]>; blockedDates: string[] }
const SLOT_GROUPS = [
  { label: 'Manhã', slots: VISIT_SLOTS.filter((s) => s < '12:00') },
  { label: 'Tarde', slots: VISIT_SLOTS.filter((s) => s >= '12:00' && s < '18:00') },
  { label: 'Noite', slots: VISIT_SLOTS.filter((s) => s >= '18:00') },
].filter((g) => g.slots.length > 0)

type Step = 'tipo' | 'data' | 'detalhes' | 'contato' | 'revisao' | 'pronto'

const STEPS: Record<BookingKind, { id: Step; label: string }[]> = {
  evento: [
    { id: 'data', label: 'Data' },
    { id: 'detalhes', label: 'Festa' },
    { id: 'contato', label: 'Contato' },
    { id: 'revisao', label: 'Revisão' },
  ],
  visita: [
    { id: 'data', label: 'Dia e horário' },
    { id: 'contato', label: 'Contato' },
    { id: 'revisao', label: 'Revisão' },
  ],
}

export default function BookingWizard() {
  const [kind, setKind] = useState<BookingKind | null>(null)
  const [step, setStep] = useState<Step>('tipo')
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [loadError, setLoadError] = useState(false)

  const [date, setDate] = useState<ISODate | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [eventType, setEventType] = useState<string>('')
  const [guests, setGuests] = useState<string>('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [website, setWebsite] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [code, setCode] = useState<string | null>(null)

  const loadAvailability = useCallback(async () => {
    setLoadError(false)
    try {
      const res = await fetch('/api/availability', { cache: 'no-store' })
      if (!res.ok) throw new Error()
      setAvailability(await res.json())
    } catch {
      setLoadError(true)
    }
  }, [])

  useEffect(() => {
    loadAvailability()
  }, [loadAvailability])

  const choose = useCallback((k: BookingKind) => {
    setKind(k)
    setDate(null)
    setTime(null)
    setError(null)
    setStep('data')
  }, [])

  // Os botões do topo da página levam direto ao fluxo certo.
  useEffect(() => {
    const fromHash = () => {
      if (window.location.hash === '#agendar-visita') choose('visita')
      else if (window.location.hash === '#reservar-data') choose('evento')
    }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    return () => window.removeEventListener('hashchange', fromHash)
  }, [choose])

  const today = todayISO()
  const minDate = kind ? addDaysISO(today, kind === 'evento' ? EVENT_MIN_LEAD_DAYS : VISIT_MIN_LEAD_DAYS) : today
  const maxDate = addMonthsISO(today, BOOKING_WINDOW_MONTHS)

  const sets = useMemo(
    () => ({
      events: new Set(availability?.eventDates ?? []),
      blocked: new Set(availability?.blockedDates ?? []),
    }),
    [availability],
  )

  const takenSlots = (d: ISODate) => availability?.visitSlots[d] ?? []

  const isUnavailable = (d: Date) => {
    const iso = isoFromDate(d)
    if (iso < minDate || iso > maxDate) return true
    if (sets.blocked.has(iso) || sets.events.has(iso)) return true
    if (kind === 'visita') {
      if (!VISIT_WEEKDAYS.includes(d.getDay())) return true
      if (takenSlots(iso).length >= VISIT_SLOTS.length) return true
    }
    return false
  }

  const isBooked = (d: Date) => {
    const iso = isoFromDate(d)
    return iso >= today && (sets.events.has(iso) || sets.blocked.has(iso))
  }

  const steps = kind ? STEPS[kind] : []
  const stepIndex = steps.findIndex((s) => s.id === step)

  const goBack = () => {
    setError(null)
    if (stepIndex <= 0) {
      setStep('tipo')
      setKind(null)
    } else setStep(steps[stepIndex - 1].id)
  }

  const goNext = () => {
    const problem = validate(step)
    if (problem) return setError(problem)
    setError(null)
    setStep(steps[stepIndex + 1].id)
  }

  function validate(s: Step): string | null {
    if (s === 'data') {
      if (!date) return kind === 'visita' ? 'Escolha o dia da visita.' : 'Escolha a data da festa.'
      if (kind === 'visita' && !time) return 'Escolha um horário.'
    }
    if (s === 'detalhes') {
      if (!eventType) return 'Escolha o tipo de festa.'
      const g = Number(guests)
      if (!g || g < 1) return 'Informe quantos convidados, mais ou menos.'
      if (g > MAX_GUESTS) return `O salão comporta até ${MAX_GUESTS} convidados.`
    }
    if (s === 'contato') {
      if (name.trim().length < 2) return 'Informe seu nome.'
      const digits = phone.replace(/\D/g, '')
      if (digits.length < 10) return 'Informe seu WhatsApp com DDD.'
      if (email && !/^\S+@\S+\.\S+$/.test(email)) return 'Confira o e-mail, ou deixe em branco.'
    }
    return null
  }

  async function submit() {
    if (!kind || !date) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          date,
          time: kind === 'visita' ? time : undefined,
          eventType: kind === 'evento' ? eventType : undefined,
          guests: kind === 'evento' ? Number(guests) : undefined,
          customerName: name,
          phone,
          email: email || undefined,
          notes: notes || undefined,
          website,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Não foi possível enviar. Tente de novo.')
        if (res.status === 409) {
          await loadAvailability()
          setDate(null)
          setTime(null)
          setStep('data')
        }
        return
      }
      setCode(data.code)
      setStep('pronto')
    } catch {
      setError('Sem conexão. Confira sua internet e tente de novo.')
    } finally {
      setSubmitting(false)
    }
  }

  function restart() {
    setKind(null)
    setStep('tipo')
    setDate(null)
    setTime(null)
    setEventType('')
    setGuests('')
    setNotes('')
    setCode(null)
    setError(null)
    loadAvailability()
  }

  const whatsappMessage =
    kind === 'evento'
      ? `Olá! Acabei de pedir a reserva do Espaço Festas Saraiva pelo site.\nProtocolo: *${code}*\nData: *${date ? formatLong(date) : ''}*\nFesta: ${eventType}, ${guests} convidados.\nNome: ${name}`
      : `Olá! Agendei uma visita ao Espaço Festas Saraiva pelo site.\nProtocolo: *${code}*\nDia: *${date ? formatLong(date) : ''}* às *${time}*\nNome: ${name}`

  return (
    <div className="relative overflow-hidden rounded-[32px] border-[3px] border-cartola bg-palco-claro p-5 text-cartola shadow-[0_12px_0_var(--color-cartola)] sm:p-8">
      {step !== 'tipo' && step !== 'pronto' && kind && (
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            className="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-couro transition hover:bg-palco"
            aria-label="Voltar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <ol className="flex flex-1 items-center gap-2" aria-label="Etapas">
            {steps.map((s, i) => (
              <li key={s.id} className="flex flex-1 flex-col gap-1.5">
                <span
                  className={clsx(
                    'h-1 rounded-full transition-colors',
                    i <= stepIndex ? 'bg-veludo' : 'bg-cartola/10',
                  )}
                />
                <span
                  className={clsx('font-label text-xs', i === stepIndex ? 'text-veludo' : 'text-couro/70')}
                  aria-current={i === stepIndex ? 'step' : undefined}
                >
                  {s.label}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {step === 'tipo' && (
        <div>
          <h3 className="font-display text-2xl">O que você quer agendar?</h3>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <KindCard
              icon={<PartyPopper className="h-6 w-6" />}
              title="Reservar a data da festa"
              text={`O salão fica só seu o dia inteiro. Diária de ${formatBRL(PRICE_PER_DAY_CENTS)}.`}
              tone="bg-ouro text-cartola"
              onClick={() => choose('evento')}
            />
            <KindCard
              icon={<DoorOpen className="h-6 w-6" />}
              title="Visitar o espaço"
              text="Só para conhecer o salão antes de fechar. Sem compromisso, leva uns 30 minutos."
              tone="bg-circo-claro text-cartola"
              onClick={() => choose('visita')}
            />
          </div>
        </div>
      )}

      {step === 'data' && kind && (
        <div>
          <h3 className="font-display text-2xl">
            {kind === 'evento' ? 'Qual o dia da festa?' : 'Quando você quer vir conhecer?'}
          </h3>
          <p className="mt-1 text-sm text-tinta">
            {kind === 'evento'
              ? 'A diária é o dia inteiro: um dia, uma festa. Dias riscados já estão reservados.'
              : 'A visita é só para conhecer o salão, não é o horário da festa. De segunda a sábado, das 9h às 20h.'}
          </p>

          <div className="agenda relative mt-5 flex min-h-[360px] justify-center">
            {!availability && !loadError && (
              <div className="absolute inset-0 flex items-center justify-center text-couro">
                <Loader2 className="h-6 w-6 animate-spin" aria-label="Carregando agenda" />
              </div>
            )}
            {loadError && (
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <p>Não conseguimos carregar a agenda agora.</p>
                <button type="button" onClick={loadAvailability} className="font-label text-veludo underline underline-offset-4">
                  Tentar de novo
                </button>
                <a href={whatsappLink('Olá! Queria ver as datas livres do Espaço Festas Saraiva.')} className="text-sm text-couro">
                  Ou pergunte no WhatsApp {WHATSAPP_DISPLAY}
                </a>
              </div>
            )}
            {availability && (
              <DayPicker
                mode="single"
                locale={ptBR}
                selected={date ? dateFromISO(date) : undefined}
                onSelect={(d) => {
                  setDate(d ? isoFromDate(d) : null)
                  setTime(null)
                  setError(null)
                }}
                defaultMonth={date ? dateFromISO(date) : dateFromISO(minDate)}
                startMonth={dateFromISO(today)}
                endMonth={dateFromISO(maxDate)}
                disabled={isUnavailable}
                modifiers={{ ocupado: isBooked }}
                modifiersClassNames={{ ocupado: 'dia-ocupado' }}
                showOutsideDays={false}
              />
            )}
          </div>

          {kind === 'evento' && availability && (
            <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-couro">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-veludo" /> Sua escolha
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-veludo line-through">15</span> Reservado
              </span>
            </div>
          )}

          {kind === 'visita' && date && (
            <fieldset className="mt-6">
              <legend className="font-label text-sm">
                Que horas você chega para a visita? <span className="text-couro first-letter:lowercase">({formatLong(date)})</span>
              </legend>
              {SLOT_GROUPS.map((group) => (
                <div key={group.label} className="mt-3">
                  <p className="mb-1.5 text-xs text-couro">{group.label}</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {group.slots.map((slot) => {
                  const taken = takenSlots(date).includes(slot)
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={taken}
                      onClick={() => {
                        setTime(slot)
                        setError(null)
                      }}
                      className={clsx(
                        'rounded-full border py-2 font-label text-sm transition',
                        time === slot
                          ? 'border-veludo bg-veludo text-palco-claro'
                          : 'border-cartola/20 hover:border-veludo',
                        taken && 'cursor-not-allowed opacity-35 line-through',
                      )}
                      aria-pressed={time === slot}
                    >
                      {slot}
                    </button>
                  )
                })}
                  </div>
                </div>
              ))}
            </fieldset>
          )}

          {kind === 'evento' && date && (
            <p className="mt-5 rounded-2xl bg-ouro-claro/45 px-4 py-3 text-center">
              <span className="first-letter:uppercase">{formatLong(date)}</span> está livre. O salão fica só seu o dia todo.
            </p>
          )}
        </div>
      )}

      {step === 'detalhes' && (
        <div className="space-y-6">
          <h3 className="font-display text-2xl">Conte sobre a festa</h3>
          <fieldset>
            <legend className="font-label text-sm">Tipo de festa</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {EVENT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setEventType(t)}
                  aria-pressed={eventType === t}
                  className={clsx(
                    'rounded-full border px-4 py-2 text-sm transition',
                    eventType === t ? 'border-veludo bg-veludo text-palco-claro' : 'border-cartola/20 hover:border-veludo',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </fieldset>
          <Field label="Quantos convidados, mais ou menos?" hint={`Até ${MAX_GUESTS}.`}>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_GUESTS}
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className={inputClass + ' max-w-40'}
              placeholder="80"
            />
          </Field>
          <Field label="Algo que a gente precisa saber?" hint="Opcional. Horário, decoração, buffet próprio...">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputClass} maxLength={1000} />
          </Field>
        </div>
      )}

      {step === 'contato' && (
        <div className="space-y-5">
          <h3 className="font-display text-2xl">Como falamos com você?</h3>
          <Field label="Seu nome">
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputClass} maxLength={120} />
          </Field>
          <Field label="WhatsApp" hint="É por ele que confirmamos.">
            <input
              value={phone}
              onChange={(e) => setPhone(maskPhone(e.target.value))}
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(24) 99999-9999"
              className={inputClass}
            />
          </Field>
          <Field label="E-mail" hint="Opcional.">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className={inputClass}
              maxLength={160}
            />
          </Field>
          {kind === 'visita' && (
            <Field label="Quer adiantar alguma dúvida?" hint="Opcional.">
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} maxLength={1000} />
            </Field>
          )}
          {/* Isca para robôs: escondida de pessoas e leitores de tela. */}
          <input
            tabIndex={-1}
            aria-hidden
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
            name="website"
          />
        </div>
      )}

      {step === 'revisao' && kind && date && (
        <div>
          <h3 className="font-display text-2xl">Confira antes de enviar</h3>
          <dl className="mt-5 divide-y divide-cartola/10 rounded-2xl border border-cartola/10">
            <Row term={kind === 'evento' ? 'Festa' : 'Visita'}>
              <span className="first-letter:uppercase">{formatLong(date)}</span>
              {time && ` às ${time}`}
            </Row>
            {kind === 'evento' && (
              <>
                <Row term="Tipo">{eventType}</Row>
                <Row term="Convidados">{guests}</Row>
                <Row term="Diária">{formatBRL(PRICE_PER_DAY_CENTS)}</Row>
              </>
            )}
            <Row term="Nome">{name}</Row>
            <Row term="WhatsApp">{phone}</Row>
            {email && <Row term="E-mail">{email}</Row>}
            {notes && <Row term="Observações">{notes}</Row>}
          </dl>
          <p className="mt-4 text-sm text-tinta">
            {kind === 'evento'
              ? 'Sua data fica guardada enquanto a gente confirma pelo WhatsApp. Nada é cobrado agora.'
              : 'Vamos confirmar a visita pelo WhatsApp.'}
          </p>
        </div>
      )}

      {step === 'pronto' && code && kind && date && (
        <div className="text-center" role="status">
          <Confete pieces={50} fall="700px" />
          <div className="mx-auto flex h-16 w-16 -rotate-6 items-center justify-center rounded-full bg-veludo text-palco-claro shadow-[0_5px_0_var(--color-veludo-escuro)]">
            <Check className="h-7 w-7" />
          </div>
          <h3 className="mt-5 font-display text-3xl">
            {kind === 'evento' ? 'Data guardada!' : 'Visita agendada!'}
          </h3>
          <p className="mt-2 text-tinta">
            <span className="first-letter:uppercase">{formatLong(date)}</span>
            {time && ` às ${time}`}.{' '}
            {kind === 'evento' ? 'Agora é só confirmar com a gente.' : 'Te esperamos.'}
          </p>
          <p className="mt-5 text-sm text-couro">Seu protocolo</p>
          <p className="font-label text-3xl tracking-wider text-veludo">{code}</p>
          <div className="mt-7 flex flex-col gap-3">
            <a
              href={whatsappLink(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full bg-veludo px-6 py-3.5 font-label text-palco-claro transition hover:bg-veludo-escuro"
            >
              <MessageCircle className="h-5 w-5" /> Confirmar pelo WhatsApp
            </a>
            <a
              href={`/reserva/${code}`}
              className="flex items-center justify-center gap-2 rounded-full border-2 border-cartola/15 px-6 py-3 font-label transition hover:border-cartola"
            >
              <CalendarHeart className="h-5 w-5" /> Acompanhar pelo protocolo
            </a>
            <button type="button" onClick={restart} className="mt-1 text-sm text-couro underline underline-offset-4">
              Fazer outro agendamento
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-5 rounded-2xl bg-veludo/10 px-4 py-3 text-sm text-veludo" role="alert">
          {error}
        </p>
      )}

      {step !== 'tipo' && step !== 'pronto' && (
        <div className="mt-7">
          {step === 'revisao' ? (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-veludo px-6 py-3.5 font-label text-palco-claro transition hover:bg-veludo-escuro disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
              {kind === 'evento' ? 'Enviar pedido de reserva' : 'Agendar visita'}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="w-full rounded-full bg-cartola px-6 py-3.5 font-label text-lg text-palco-claro shadow-[0_5px_0_var(--color-veludo)] transition hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
            >
              Continuar
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border border-cartola/20 bg-white/70 px-4 py-3 text-cartola placeholder:text-couro/50 transition focus:border-veludo focus:outline-none focus:ring-2 focus:ring-veludo/15'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-label text-sm">{label}</span>
      {hint && <span className="ml-2 text-xs text-couro">{hint}</span>}
      <span className="mt-2 block">{children}</span>
    </label>
  )
}

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 px-4 py-3 text-sm">
      <dt className="w-28 shrink-0 text-couro">{term}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  )
}

function KindCard({
  icon,
  title,
  text,
  tone,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  text: string
  tone: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'group flex flex-col items-start rounded-3xl border-[3px] border-cartola p-5 text-left shadow-[0_6px_0_var(--color-cartola)] transition hover:-translate-y-1 hover:shadow-[0_10px_0_var(--color-cartola)] active:translate-y-1 active:shadow-[0_2px_0_var(--color-cartola)]',
        tone,
      )}
    >
      <span className="flex h-12 w-12 -rotate-6 items-center justify-center rounded-full bg-cartola text-palco-claro transition group-hover:rotate-6">
        {icon}
      </span>
      <span className="mt-4 font-display text-xl leading-tight">{title}</span>
      <span className="mt-1.5 text-sm">{text}</span>
    </button>
  )
}
