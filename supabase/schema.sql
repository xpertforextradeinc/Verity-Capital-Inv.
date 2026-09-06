-- Quantix institutional paper-trading schema.
-- Run this migration in the Supabase SQL editor.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('CUSTOMER', 'ADMIN');
create type public.user_status as enum ('ACTIVE', 'SUSPENDED');
create type public.asset_type as enum ('STOCK', 'CRYPTO', 'ETF', 'FOREX');
create type public.instrument_status as enum ('ACTIVE', 'HALTED');
create type public.order_side as enum ('BUY', 'SELL');
create type public.order_type as enum ('MARKET', 'LIMIT');
create type public.order_status as enum ('EXECUTED', 'PENDING', 'CANCELLED', 'REJECTED');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  first_name text not null default 'Institutional',
  last_name text not null default 'Investor',
  role public.user_role not null default 'CUSTOMER',
  status public.user_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  base_currency text not null default 'USD',
  total_equity numeric(20, 2) not null default 100000,
  invested_balance numeric(20, 2) not null default 0,
  unrealized_pnl numeric(20, 2) not null default 0,
  unrealized_pnl_percent numeric(12, 6) not null default 0,
  day_pnl numeric(20, 2) not null default 0,
  day_pnl_percent numeric(12, 6) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolio_balances (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  asset text not null,
  available numeric(30, 12) not null default 0,
  locked numeric(30, 12) not null default 0,
  average_cost numeric(20, 8) not null default 0,
  updated_at timestamptz not null default now(),
  unique (portfolio_id, asset),
  check (available >= 0),
  check (locked >= 0)
);

create table public.instruments (
  id uuid primary key default gen_random_uuid(),
  symbol text not null unique,
  name text not null,
  asset_type public.asset_type not null,
  exchange text not null,
  currency text not null default 'USD',
  status public.instrument_status not null default 'ACTIVE',
  price numeric(30, 12) not null default 0,
  change_amount numeric(30, 12) not null default 0,
  change_percent numeric(12, 6) not null default 0,
  high_24h numeric(30, 12) not null default 0,
  low_24h numeric(30, 12) not null default 0,
  volume_24h numeric(30, 12) not null default 0,
  updated_at timestamptz not null default now()
);

create table public.positions (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  instrument_id uuid not null references public.instruments(id),
  quantity numeric(30, 12) not null default 0,
  average_price numeric(30, 12) not null default 0,
  updated_at timestamptz not null default now(),
  unique (portfolio_id, instrument_id),
  check (quantity >= 0)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  instrument_id uuid not null references public.instruments(id),
  side public.order_side not null,
  order_type public.order_type not null,
  quantity numeric(30, 12) not null check (quantity > 0),
  requested_price numeric(30, 12),
  executed_price numeric(30, 12),
  total_value numeric(30, 12) not null default 0,
  status public.order_status not null default 'PENDING',
  rejection_reason text,
  created_at timestamptz not null default now(),
  executed_at timestamptz
);

create index orders_user_created_idx on public.orders(user_id, created_at desc);
create index positions_portfolio_idx on public.positions(portfolio_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', 'Institutional'),
    coalesce(new.raw_user_meta_data ->> 'last_name', 'Investor')
  );
  insert into public.portfolios (user_id) values (new.id);
  insert into public.portfolio_balances (portfolio_id, asset, available)
  select id, 'USD', 100000 from public.portfolios where user_id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;
alter table public.portfolio_balances enable row level security;
alter table public.positions enable row level security;
alter table public.orders enable row level security;
alter table public.instruments enable row level security;

-- Regular users have strictly read-only access to their own account data
create policy "users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "users read own portfolios" on public.portfolios for select using (auth.uid() = user_id);
create policy "users read own balances" on public.portfolio_balances for select using (
  exists (select 1 from public.portfolios p where p.id = portfolio_id and p.user_id = auth.uid())
);
create policy "users read own positions" on public.positions for select using (
  exists (select 1 from public.portfolios p where p.id = portfolio_id and p.user_id = auth.uid())
);
create policy "users read own orders" on public.orders for select using (auth.uid() = user_id);
create policy "authenticated users read instruments" on public.instruments for select using (auth.role() = 'authenticated');

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin', false)
      or coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
      or exists (
        select 1 from public.profiles
        where id = auth.uid()
          and upper(role::text) = 'ADMIN'
          and upper(coalesce(status::text, 'ACTIVE')) = 'ACTIVE'
      );
$$;

create policy "admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage portfolios" on public.portfolios for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage balances" on public.portfolio_balances for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage positions" on public.positions for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage instruments" on public.instruments for all using (public.is_admin()) with check (public.is_admin());
