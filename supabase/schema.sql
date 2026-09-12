-- Verity-Capital Inv: Production Database Schema & RLS
-- Run this migration directly in the Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- 1. ENUMS
do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('CUSTOMER', 'ADMIN');
  end if;
  if not exists (select 1 from pg_type where typname = 'user_status') then
    create type public.user_status as enum ('ACTIVE', 'SUSPENDED');
  end if;
  if not exists (select 1 from pg_type where typname = 'asset_type') then
    create type public.asset_type as enum ('STOCK', 'CRYPTO', 'ETF', 'FOREX');
  end if;
  if not exists (select 1 from pg_type where typname = 'instrument_status') then
    create type public.instrument_status as enum ('ACTIVE', 'HALTED');
  end if;
  if not exists (select 1 from pg_type where typname = 'order_side') then
    create type public.order_side as enum ('BUY', 'SELL');
  end if;
  if not exists (select 1 from pg_type where typname = 'order_type') then
    create type public.order_type as enum ('MARKET', 'LIMIT');
  end if;
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('EXECUTED', 'PENDING', 'CANCELLED', 'REJECTED');
  end if;
end $$;

-- 2. PROFILES & ROLES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  first_name text not null default 'Institutional',
  last_name text not null default 'Investor',
  role public.user_role not null default 'CUSTOMER',
  status public.user_status not null default 'ACTIVE',
  verified boolean not null default false,
  account_status text not null default 'active',
  balances jsonb not null default '{"USD":100000,"EUR":0,"GBP":0,"NGN":0,"BTC":0,"ETH":0}'::jsonb,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  unique(user_id, role)
);

-- 3. PORTFOLIOS & BALANCES
create table if not exists public.portfolios (
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

create table if not exists public.portfolio_balances (
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

-- 4. INSTRUMENTS
create table if not exists public.instruments (
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

-- 5. POSITIONS & ORDERS
create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  instrument_id uuid not null references public.instruments(id),
  quantity numeric(30, 12) not null default 0,
  average_price numeric(30, 12) not null default 0,
  updated_at timestamptz not null default now(),
  unique (portfolio_id, instrument_id)
);

create table if not exists public.orders (
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

-- 6. INVESTMENT PLANS & SETTINGS
create table if not exists public.investment_plans (
  id text primary key,
  name text not null,
  amount numeric not null check (amount > 0),
  features jsonb not null default '[]'::jsonb,
  recommended boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.investment_plans (id, name, amount, features, recommended, display_order)
values
  ('starter', 'Starter Plan', 1000, '["Standard market access", "Daily reporting", "Email support", "Standard execution"]'::jsonb, false, 1),
  ('silver', 'Silver Plan', 5000, '["Full digital asset coverage", "Real-time insights", "Priority email support", "Fast execution"]'::jsonb, false, 2),
  ('gold', 'Gold Plan', 10000, '["Global OTC access", "Dedicated account manager", "24/7 priority desk", "Institutional execution"]'::jsonb, true, 3),
  ('vip', 'VIP Plan', 25000, '["Exclusive block trades", "Cold custody solutions", "Direct executive line", "Zero-latency execution"]'::jsonb, false, 4)
on conflict (id) do nothing;

create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  description text,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value, description)
values ('whatsapp_number', '+1234567890', 'WhatsApp Desk Number')
on conflict (key) do nothing;

-- 7. SEED BASE INSTRUMENTS
insert into public.instruments (symbol, name, asset_type, exchange, price, change_amount, change_percent, high_24h, low_24h, volume_24h)
values
  ('BTC/USD', 'Bitcoin', 'CRYPTO', 'Coinbase Institutional', 68420.50, 1240.20, 1.85, 69200.00, 67100.00, 48200),
  ('ETH/USD', 'Ethereum', 'CRYPTO', 'Coinbase Institutional', 3620.10, -42.80, -1.17, 3710.00, 3580.00, 29100),
  ('SOL/USD', 'Solana', 'CRYPTO', 'Binance Prime', 178.40, 6.20, 3.60, 182.00, 171.50, 15300),
  ('AAPL', 'Apple Inc.', 'STOCK', 'NASDAQ', 224.50, 1.80, 0.81, 226.00, 223.10, 128000),
  ('NVDA', 'NVIDIA Corporation', 'STOCK', 'NASDAQ', 128.90, 4.30, 3.45, 131.00, 125.20, 340000)
on conflict (symbol) do update set
  price = excluded.price,
  change_percent = excluded.change_percent;

-- 8. AUTOMATIC AUTH TRIGGER (SUPPORTS GOOGLE OAUTH & EMAIL SIGNUPS)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_full text;
  v_first text;
  v_last text;
  v_is_admin boolean;
begin
  v_full := coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '');
  v_first := coalesce(new.raw_user_meta_data ->> 'first_name', split_part(v_full, ' ', 1), 'Investor');
  v_last := coalesce(new.raw_user_meta_data ->> 'last_name', nullif(substr(v_full, length(v_first) + 2), ''), 'Client');
  
  v_is_admin := lower(new.email) = 'verifycapitalinv@gmail.com' or (new.raw_user_meta_data ->> 'role') = 'admin';

  insert into public.profiles (id, email, first_name, last_name, role, verified, account_status)
  values (
    new.id,
    new.email,
    v_first,
    v_last,
    case when v_is_admin then 'ADMIN'::public.user_role else 'CUSTOMER'::public.user_role end,
    true,
    'active'
  )
  on conflict (id) do update set
    email = excluded.email,
    first_name = coalesce(public.profiles.first_name, excluded.first_name),
    last_name = coalesce(public.profiles.last_name, excluded.last_name);

  insert into public.user_roles (user_id, role)
  values (new.id, case when v_is_admin then 'admin' else 'user' end)
  on conflict (user_id, role) do nothing;

  insert into public.portfolios (user_id, total_equity)
  values (new.id, 100000)
  on conflict (user_id) do nothing;

  insert into public.portfolio_balances (portfolio_id, asset, available)
  select id, 'USD', 100000 from public.portfolios where user_id = new.id
  on conflict (portfolio_id, asset) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.portfolios enable row level security;
alter table public.portfolio_balances enable row level security;
alter table public.instruments enable row level security;
alter table public.positions enable row level security;
alter table public.orders enable row level security;
alter table public.investment_plans enable row level security;
alter table public.app_settings enable row level security;

-- Admin check function
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
      or exists (
        select 1 from public.user_roles
        where user_id = auth.uid() and role = 'admin'
      )
      or exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'ADMIN'
      );
$$;

-- Drop existing policies
drop policy if exists "allow read own profile" on public.profiles;
drop policy if exists "allow update own profile" on public.profiles;
drop policy if exists "allow read own roles" on public.user_roles;
drop policy if exists "allow read own portfolios" on public.portfolios;
drop policy if exists "allow read own balances" on public.portfolio_balances;
drop policy if exists "allow read instruments" on public.instruments;
drop policy if exists "allow read plans" on public.investment_plans;
drop policy if exists "allow read settings" on public.app_settings;
drop policy if exists "admin full access profiles" on public.profiles;
drop policy if exists "admin full access portfolios" on public.portfolios;

-- Customer Policies
create policy "allow read own profile" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "allow update own profile" on public.profiles for update using (auth.uid() = id or public.is_admin());
create policy "allow read own roles" on public.user_roles for select using (auth.uid() = user_id or public.is_admin());
create policy "allow read own portfolios" on public.portfolios for select using (auth.uid() = user_id or public.is_admin());
create policy "allow read own balances" on public.portfolio_balances for select using (
  exists (select 1 from public.portfolios p where p.id = portfolio_id and (p.user_id = auth.uid() or public.is_admin()))
);

-- Public Read Policies
create policy "allow read instruments" on public.instruments for select using (true);
create policy "allow read plans" on public.investment_plans for select using (true);
create policy "allow read settings" on public.app_settings for select using (true);

-- Admin Full Access Policies
create policy "admin full access profiles" on public.profiles for all using (public.is_admin());
create policy "admin full access portfolios" on public.portfolios for all using (public.is_admin());
create policy "admin full access balances" on public.portfolio_balances for all using (public.is_admin());
create policy "admin full access positions" on public.positions for all using (public.is_admin());
create policy "admin full access orders" on public.orders for all using (public.is_admin());
create policy "admin full access instruments" on public.instruments for all using (public.is_admin());
create policy "admin full access plans" on public.investment_plans for all using (public.is_admin());
create policy "admin full access settings" on public.app_settings for all using (public.is_admin());

-- User Orders & Positions Policies
create policy "allow read own positions" on public.positions for select using (
  exists (select 1 from public.portfolios p where p.id = portfolio_id and (p.user_id = auth.uid() or public.is_admin()))
);
create policy "allow read own orders" on public.orders for select using (auth.uid() = user_id or public.is_admin());
create policy "allow insert own orders" on public.orders for insert with check (auth.uid() = user_id or public.is_admin());
create policy "allow update own orders" on public.orders for update using (auth.uid() = user_id or public.is_admin());
