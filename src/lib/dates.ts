import { addDays, addMonths, format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TIMEZONE } from './config'

/** Datas trafegam como 'yyyy-MM-dd' para não sofrer com fuso horário. */
export type ISODate = string

export function todayISO(): ISODate {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(new Date())
}

export function isoFromDate(d: Date): ISODate {
  return format(d, 'yyyy-MM-dd')
}

export function dateFromISO(iso: ISODate): Date {
  return parseISO(iso)
}

export function addDaysISO(iso: ISODate, days: number): ISODate {
  return isoFromDate(addDays(parseISO(iso), days))
}

export function addMonthsISO(iso: ISODate, months: number): ISODate {
  return isoFromDate(addMonths(parseISO(iso), months))
}

export function formatLong(iso: ISODate): string {
  return format(parseISO(iso), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function formatShort(iso: ISODate): string {
  return format(parseISO(iso), 'dd/MM/yyyy')
}

export function weekday(iso: ISODate): number {
  return parseISO(iso).getDay()
}

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}
