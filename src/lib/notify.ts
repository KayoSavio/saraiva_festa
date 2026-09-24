import 'server-only'
import type { Booking } from './bookings'
import { WHATSAPP_NUMBER } from './config'
import { formatBRL, formatLong } from './dates'

/**
 * Avisa o dono no WhatsApp quando entra um pedido.
 * Usa o CallMeBot (gratuito, só manda para o próprio número). Sem CALLMEBOT_APIKEY, não faz nada.
 */
export async function notifyOwner(b: Booking) {
  const apikey = process.env.CALLMEBOT_APIKEY
  if (!apikey) return
  const phone = process.env.OWNER_WHATSAPP || WHATSAPP_NUMBER
  const site = process.env.SITE_URL?.replace(/\/$/, '')

  const lines =
    b.kind === 'evento'
      ? [
          `🎉 *Novo pedido de festa* ${b.code}`,
          `📅 ${formatLong(b.date)}`,
          `${b.event_type}, ${b.guests} convidados${b.price_cents ? ` (${formatBRL(b.price_cents)})` : ''}`,
        ]
      : [`🚪 *Nova visita agendada* ${b.code}`, `📅 ${formatLong(b.date)} às ${b.time}`]

  lines.push(`👤 ${b.customer_name}`, `📱 wa.me/55${b.phone.replace(/^55/, '')}`)
  if (b.notes) lines.push(`📝 ${b.notes}`)
  if (site) lines.push(`Painel: ${site}/admin`)

  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&apikey=${encodeURIComponent(apikey)}&text=${encodeURIComponent(lines.join('\n'))}`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
    if (!res.ok) console.error('callmebot', res.status, await res.text().catch(() => ''))
  } catch (err) {
    console.error('callmebot', err)
  }
}
