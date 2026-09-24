// Cria as tabelas no Neon a partir de db/schema.sql.
// Uso: pnpm db:setup  (lê DATABASE_URL do .env.local)
import { readFileSync, existsSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

for (const file of ['.env.local', '.env']) {
  if (!existsSync(file)) continue
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL não definida. Copie .env.example para .env.local e preencha.')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)
const statements = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8')
  .split(/;\s*$/m)
  .map((s) => s.replace(/^\s*--.*$/gm, '').trim())
  .filter(Boolean)

for (const statement of statements) {
  await sql.query(statement)
  console.log('ok:', statement.split('\n')[0])
}
console.log('Banco pronto.')
