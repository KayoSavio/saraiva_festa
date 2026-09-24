import { WHATSAPP_NUMBER } from './config'

export function whatsappLink(message: string, number = WHATSAPP_NUMBER) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

/** (24) 99999-9999 enquanto a pessoa digita. */
export function maskPhone(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** Para o admin abrir conversa com o cliente. */
export function customerWhatsapp(phoneDigits: string, message: string) {
  const digits = phoneDigits.replace(/\D/g, '')
  return whatsappLink(message, digits.startsWith('55') ? digits : `55${digits}`)
}
