import 'server-only'
import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

let client: NeonQueryFunction<false, false> | null = null

/** Cliente HTTP do Neon, criado sob demanda para o build não exigir DATABASE_URL. */
export function db() {
  if (!client) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL não configurada. Veja .env.example.')
    client = neon(url)
  }
  return client
}

export function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === '23505'
}
