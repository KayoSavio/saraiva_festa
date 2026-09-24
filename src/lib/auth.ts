import 'server-only'
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const COOKIE = 'sf_admin'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7

function secret() {
  const s = process.env.SESSION_SECRET
  if (!s || s.length < 16) throw new Error('SESSION_SECRET não configurado (mínimo 16 caracteres).')
  return s
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

function safeEqual(a: string, b: string) {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

export function checkPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) throw new Error('ADMIN_PASSWORD não configurada.')
  return safeEqual(password, expected)
}

export async function startSession() {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS)
  const store = await cookies()
  store.set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function endSession() {
  const store = await cookies()
  store.delete(COOKIE)
}

export async function isAdmin() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return false
  const [exp, sig] = token.split('.')
  if (!exp || !sig || !safeEqual(sig, sign(exp))) return false
  return Number(exp) * 1000 > Date.now()
}

/** Use no topo de páginas e ações do painel. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login')
}
