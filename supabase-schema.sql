create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null,
  phone text not null,
  email text,
  product_type text not null,
  note text,
  status text not null default 'Yeni' check (status in ('Yeni', 'Hazırlanıyor', 'Kargoda', 'Tamamlandı', 'İptal')),
  source text not null default 'perakece.com.tr',
  consent_kvkk boolean not null default false,
  admin_note text
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text,
  email text,
  message text not null,
  status text not null default 'Yeni'
);

alter table public.orders enable row level security;
alter table public.messages enable row level security;

drop policy if exists "Anon can create order requests" on public.orders;
create policy "Anon can create order requests"
  on public.orders
  for insert
  to anon
  with check (
    consent_kvkk is true
    and length(trim(customer_name)) >= 2
    and length(trim(phone)) >= 10
    and length(trim(product_type)) >= 2
  );

drop policy if exists "Anon can create contact messages" on public.messages;
create policy "Anon can create contact messages"
  on public.messages
  for insert
  to anon
  with check (
    length(trim(name)) >= 2
    and length(trim(message)) >= 5
  );

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
