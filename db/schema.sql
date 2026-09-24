-- Saraiva Festa: schema do agendamento (Neon / Postgres)
-- Rode com: pnpm db:setup

create extension if not exists pgcrypto;

create table if not exists bookings (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  kind          text not null check (kind in ('evento', 'visita')),
  date          date not null,
  time          text,
  status        text not null default 'pendente'
                check (status in ('pendente', 'confirmada', 'cancelada', 'concluida')),
  event_type    text,
  guests        integer check (guests is null or guests between 1 and 150),
  customer_name text not null,
  phone         text not null,
  email         text,
  notes         text,
  admin_notes   text,
  price_cents   integer,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint visita_tem_horario check (kind <> 'visita' or time is not null)
);

-- Uma festa por dia: pendentes e confirmadas seguram a data.
create unique index if not exists bookings_evento_por_dia
  on bookings (date)
  where kind = 'evento' and status in ('pendente', 'confirmada');

-- Uma visita por horário.
create unique index if not exists bookings_visita_por_horario
  on bookings (date, time)
  where kind = 'visita' and status in ('pendente', 'confirmada');

create index if not exists bookings_date_idx on bookings (date);
create index if not exists bookings_status_idx on bookings (status);

-- Datas que o administrador fecha manualmente (manutenção, feriado, uso próprio).
create table if not exists blocked_dates (
  date       date primary key,
  reason     text,
  created_at timestamptz not null default now()
);
