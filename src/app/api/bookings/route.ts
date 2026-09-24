import { after, NextResponse } from 'next/server'
import { BookingError, createBooking } from '@/lib/bookings'
import { notifyOwner } from '@/lib/notify'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
  }

  try {
    const booking = await createBooking(body)
    // O aviso sai depois da resposta: o cliente não espera o WhatsApp.
    after(() => notifyOwner(booking))
    return NextResponse.json({ code: booking.code }, { status: 201 })
  } catch (err) {
    if (err instanceof BookingError) return NextResponse.json({ error: err.message }, { status: err.status })
    console.error('create booking', err)
    return NextResponse.json({ error: 'Não foi possível registrar agora. Tente de novo ou chame no WhatsApp.' }, { status: 500 })
  }
}
