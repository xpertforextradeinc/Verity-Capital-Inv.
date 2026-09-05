-- Verity-Capital Inv institutional admin controls.
-- Apply after supabase/schema.sql. The client must never query auth.users directly;
-- server-side service-role code should join these profiles to auth.users metadata.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'user' check (role in ('user', 'admin')),
  verified boolean not null default false,
  account_status text not null default 'active' check (account_status in ('active', 'restricted', 'closed')),
  balances jsonb not null default '{"USD":0,"EUR":0,"GBP":0,"NGN":0,"BTC":0,"ETH":0}'::jsonb,
  country text,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists verified boolean not null default false;
alter table public.profiles add column if not exists account_status text not null default 'active';
alter table public.profiles add column if not exists balances jsonb not null default '{"USD":0,"EUR":0,"GBP":0,"NGN":0,"BTC":0,"ETH":0}'::jsonb;
alter table public.profiles add column if not exists country text;

create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users(id),
  target_user_id uuid references auth.users(id),
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (lower(email));
create index if not exists profiles_country_idx on public.profiles (country);
create index if not exists admin_logs_target_idx on public.admin_logs (target_user_id, created_at desc);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and upper(role::text) = 'ADMIN'
      and upper(coalesce(account_status, 'ACTIVE')) = 'ACTIVE'
      and (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
$$;

create or replace function public.log_admin_action(
  target_id uuid,
  action_name text,
  action_metadata jsonb default '{}'::jsonb
) returns public.admin_logs
language plpgsql security definer set search_path = public as $$
declare result public.admin_logs;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  insert into public.admin_logs (admin_id, target_user_id, action, metadata)
  values (auth.uid(), target_id, action_name, action_metadata)
  returning * into result;
  return result;
end;
$$;

create or replace function public.admin_adjust_balance(
  target_id uuid,
  currency_code text,
  delta numeric
) returns public.profiles
language plpgsql security definer set search_path = public as $$
declare result public.profiles;
declare normalized text := upper(currency_code);
declare next_balances jsonb;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  if normalized not in ('USD','EUR','GBP','NGN','BTC','ETH') then raise exception 'Unsupported currency'; end if;
  if delta = 0 then raise exception 'Balance adjustment cannot be zero'; end if;
  update public.profiles
  set balances = jsonb_set(
    balances,
    array[normalized],
    to_jsonb(coalesce((balances ->> normalized)::numeric, 0) + delta),
    true
  )
  where id = target_id
    and coalesce((balances ->> normalized)::numeric, 0) + delta >= 0
  returning * into result;
  if result.id is null then raise exception 'User not found or balance would become negative'; end if;
  perform public.log_admin_action(target_id, 'balance_adjusted', jsonb_build_object('currency', normalized, 'delta', delta));
  return result;
end;
$$;

create or replace function public.admin_set_verified(target_id uuid, next_verified boolean)
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare result public.profiles;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  update public.profiles set verified = next_verified where id = target_id returning * into result;
  if result.id is null then raise exception 'User not found'; end if;
  perform public.log_admin_action(target_id, 'verification_changed', jsonb_build_object('verified', next_verified));
  return result;
end;
$$;

create or replace function public.admin_set_account_status(target_id uuid, next_status text)
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare result public.profiles;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  if next_status not in ('active','restricted','closed') then raise exception 'Invalid account status'; end if;
  update public.profiles set account_status = next_status where id = target_id returning * into result;
  if result.id is null then raise exception 'User not found'; end if;
  perform public.log_admin_action(target_id, 'account_status_changed', jsonb_build_object('status', next_status));
  return result;
end;
$$;

create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  verified boolean,
  account_status text,
  balances jsonb,
  country text,
  created_at timestamptz,
  last_sign_in timestamptz
)
language sql security definer set search_path = public, auth as $$
  select p.id, p.email, p.verified, p.account_status, p.balances, p.country, p.created_at, u.last_sign_in_at
  from public.profiles p
  join auth.users u on u.id = p.id
  where public.is_admin()
  order by p.created_at desc;
$$;

alter table public.profiles enable row level security;
alter table public.admin_logs enable row level security;

drop policy if exists "admins read all profiles" on public.profiles;
create policy "admins read all profiles" on public.profiles for select using (public.is_admin() or auth.uid() = id);
create policy "admins read logs" on public.admin_logs for select using (public.is_admin());

revoke all on function public.admin_adjust_balance(uuid, text, numeric) from public, anon;
revoke all on function public.admin_set_verified(uuid, boolean) from public, anon;
revoke all on function public.admin_set_account_status(uuid, text) from public, anon;
grant execute on function public.admin_adjust_balance(uuid, text, numeric) to authenticated;
grant execute on function public.admin_set_verified(uuid, boolean) to authenticated;
grant execute on function public.admin_set_account_status(uuid, text) to authenticated;
revoke all on function public.admin_list_users() from public, anon;
grant execute on function public.admin_list_users() to authenticated;
