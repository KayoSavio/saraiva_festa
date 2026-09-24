# Espaço Festas Saraiva

Site do salão de festas com agenda online: o cliente vê as datas livres, reserva a data da festa ou agenda uma visita, recebe um protocolo e confirma pelo WhatsApp. O dono gerencia tudo em `/admin`.

Stack: Next.js 16, Tailwind 4, Neon (Postgres serverless).

## Configurar

1. Crie um projeto em [neon.tech](https://neon.tech) e copie a connection string **pooled**.
2. `cp .env.example .env.local` e preencha `DATABASE_URL`, `ADMIN_PASSWORD` e `SESSION_SECRET`.
3. Crie as tabelas: `pnpm db:setup`
4. `pnpm dev`

Na Vercel, cadastre as mesmas três variáveis em Settings > Environment Variables.

## Como funciona a agenda

- **Festa**: uma por dia. Pedidos pendentes e confirmados seguram a data (índice único no banco, então duas pessoas nunca pegam o mesmo dia).
- **Visita**: segunda a sábado, horários em `src/lib/config.ts`. Dias com festa não aceitam visita.
- **Datas fechadas**: o admin pode fechar um dia (manutenção, uso próprio); ele some do calendário.
- Cancelar uma reserva no painel libera a data na hora.

Preço, antecedência mínima, horários de visita e tipos de festa ficam em `src/lib/config.ts`.

## Rotas

| Rota | O que é |
| --- | --- |
| `/` | Site + agendamento |
| `/reserva/SF-XXXXXX` | Cliente acompanha o pedido pelo protocolo |
| `/admin` | Painel: calendário, pedidos, confirmar/cancelar, fechar datas |
| `GET /api/availability` | Dias ocupados e horários de visita tomados |
| `POST /api/bookings` | Cria reserva ou visita |
