'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { checkPassword, endSession, requireAdmin, startSession } from '@/lib/auth'
import { BookingError, blockDate, unblockDate, updateBookingNotes, updateBookingStatus } from '@/lib/bookings'
import type { BookingStatus } from '@/lib/config'

export type ActionState = { error?: string } | undefined

export async function login(_: ActionState, form: FormData): Promise<ActionState> {
  const password = String(form.get('password') ?? '')
  // Pequena espera para desestimular tentativa e erro.
  await new Promise((r) => setTimeout(r, 400))
  if (!checkPassword(password)) return { error: 'Senha incorreta.' }
  await startSession()
  redirect('/admin')
}

export async function logout() {
  await endSession()
  redirect('/admin/login')
}

const STATUSES: BookingStatus[] = ['pendente', 'confirmada', 'cancelada', 'concluida']

export async function setStatus(form: FormData) {
  await requireAdmin()
  const id = String(form.get('id'))
  const status = String(form.get('status')) as BookingStatus
  if (!STATUSES.includes(status)) return
  try {
    await updateBookingStatus(id, status)
  } catch (err) {
    if (err instanceof BookingError) redirect(`/admin?erro=${encodeURIComponent(err.message)}`)
    throw err
  }
  revalidatePath('/admin')
}

export async function saveNotes(form: FormData) {
  await requireAdmin()
  await updateBookingNotes(String(form.get('id')), String(form.get('admin_notes') ?? '').slice(0, 2000))
  revalidatePath('/admin')
}

export async function addBlockedDate(form: FormData) {
  await requireAdmin()
  const date = String(form.get('date') ?? '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return
  await blockDate(date, String(form.get('reason') ?? '').slice(0, 200))
  revalidatePath('/admin')
}

export async function removeBlockedDate(form: FormData) {
  await requireAdmin()
  await unblockDate(String(form.get('date')))
  revalidatePath('/admin')
}
