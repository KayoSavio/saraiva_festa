// Regras do negócio num lugar só. Ajuste aqui preço, horários e prazos.

export const WHATSAPP_NUMBER = '5524999051196'
export const WHATSAPP_DISPLAY = '(24) 99905-1196'
export const CITY = 'Volta Redonda, RJ'

/**
 * Endereço do salão.
 * lat/lng deixam o pin exato e liberam o Street View (no Google Maps,
 * clique com o botão direito no local e copie os números). Sem eles, o mapa usa o endereço.
 */
export const ADDRESS = {
  street: 'Rua Lavras, 99',
  district: 'Minerlândia',
  cityState: CITY,
  zip: '27264-150',
  // Ponto da Rua Lavras no OpenStreetMap (a rua tem ~100 m). Troque pelo ponto exato do salão se quiser.
  lat: -22.5316439 as number | null,
  lng: -44.1237428 as number | null,
}

export const ADDRESS_FULL = `${ADDRESS.street} - ${ADDRESS.district}, ${ADDRESS.cityState}, ${ADDRESS.zip}`

export const PRICE_PER_DAY_CENTS = 120_000
export const MAX_GUESTS = 150

/** Festas: reservar com pelo menos N dias de antecedência. */
export const EVENT_MIN_LEAD_DAYS = 3
/** Visitas: a partir de amanhã. */
export const VISIT_MIN_LEAD_DAYS = 1
/** Até quantos meses à frente a agenda fica aberta. */
export const BOOKING_WINDOW_MONTHS = 18

/** Dias da semana com visita (0 = domingo). */
export const VISIT_WEEKDAYS = [1, 2, 3, 4, 5, 6]
/** Horários de visita (só para conhecer o salão, não é o horário da festa). */
export const VISIT_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'] as const

export const EVENT_TYPES = [
  'Aniversário',
  'Aniversário infantil',
  'Casamento',
  'Noivado',
  'Chá de bebê ou revelação',
  'Formatura',
  'Evento corporativo',
  'Confraternização',
  'Outro',
] as const

export const TIMEZONE = 'America/Sao_Paulo'

export type BookingKind = 'evento' | 'visita'
export type BookingStatus = 'pendente' | 'confirmada' | 'cancelada' | 'concluida'

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pendente: 'Aguardando confirmação',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  concluida: 'Concluída',
}
