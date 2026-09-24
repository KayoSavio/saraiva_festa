import { NextResponse } from 'next/server'
import { getAvailability } from '@/lib/bookings'
import { addMonthsISO, todayISO } from '@/lib/dates'
import { BOOKING_WINDOW_MONTHS } from '@/lib/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const from = todayISO()
    const to = addMonthsISO(from, BOOKING_WINDOW_MONTHS)
    const availability = await getAvailability(from, to)
    return NextResponse.json(availability, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('availability', err)
    return NextResponse.json({ error: 'Não foi possível carregar a agenda.' }, { status: 503 })
  }
}
