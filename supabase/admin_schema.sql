-- Verity-Capital Inv institutional admin controls.
-- Apply after supabase/schema.sql. The client must never query auth.users directly;
-- server-side service-role code should join these profiles to auth.users metadata.

-- 1. USER ROLES SYSTEM
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  unique(user_id, role)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'user' check (role in ('user', 'admin')),
  verified boolean not null default false,
  account_status text not null default 'pending' check (account_status in ('pending', 'approved', 'suspended', 'on_hold', 'active', 'restricted', 'closed')),
  balances jsonb not null default '{"USD":0,"EUR":0,"GBP":0,"NGN":0,"BTC":0,"ETH":0}'::jsonb,
  country text,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists verified boolean not null default false;
alter table public.profiles add column if not exists account_status text not null default 'pending';
alter table public.profiles add column if not exists balances jsonb not null default '{"USD":0,"EUR":0,"GBP":0,"NGN":0,"BTC":0,"ETH":0}'::jsonb;
alter table public.profiles add column if not exists country text;

-- App Settings (WhatsApp business number, platform parameters)
create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

insert into public.app_settings (key, value, description)
values ('whatsapp_number', '+1234567890', 'Business WhatsApp Contact Number')
on conflict (key) do nothing;

-- Platform Settings (mirrored for backward compatibility)
create table if not exists public.platform_settings (
  key text primary key,
  value text not null,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

insert into public.platform_settings (key, value, description)
values ('whatsapp_number', '+1234567890', 'Business WhatsApp Contact Number')
on conflict (key) do nothing;

-- Dynamic Investment Plans
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
  ('starter', 'Starter Plan', 1000, '["Access to standard markets", "Basic portfolio reporting", "Email support", "Standard execution"]'::jsonb, false, 1),
  ('silver', 'Silver Plan', 5000, '["Advanced market access", "Daily market insights", "Priority email support", "Fast execution"]'::jsonb, false, 2),
  ('gold', 'Gold Plan', 10000, '["Global OTC access", "Dedicated account manager", "24/7 priority support", "Institutional execution"]'::jsonb, true, 3),
  ('vip', 'VIP Plan', 25000, '["Exclusive block trades", "Private custody solutions", "Direct broker line", "Zero-latency execution"]'::jsonb, false, 4)
on conflict (id) do nothing;

-- 4. AUDIT LOGS TABLE
-- Every admin action must be logged with admin id, target user id, action type, previous value, new value, timestamp
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users(id),
  target_user_id uuid references auth.users(id),
  action_type text not null,
  previous_value jsonb,
  new_value jsonb,
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Legacy admin_logs table compatibility
create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users(id),
  target_user_id uuid references auth.users(id),
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 6. BALANCE TRANSACTION HISTORY
-- Every balance adjustment must create a transaction record
create table if not exists public.balance_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  admin_id uuid references auth.users(id),
  transaction_type text not null check (transaction_type in ('ADD', 'DEDUCT', 'DEPOSIT', 'WITHDRAWAL', 'TRADE', 'ADJUSTMENT')),
  currency text not null,
  amount numeric not null,
  previous_balance numeric not null,
  new_balance numeric not null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (lower(email));
create index if not exists profiles_country_idx on public.profiles (country);
create index if not exists audit_logs_target_idx on public.audit_logs (target_user_id, timestamp desc);
create index if not exists audit_logs_admin_idx on public.audit_logs (admin_id, timestamp desc);
create index if not exists balance_transactions_user_idx on public.balance_transactions (user_id, timestamp desc);

-- Helper function: Is Admin check
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin', false)
      or coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
      or exists (
        select 1 from public.user_roles
        where user_id = auth.uid()
          and role = 'admin'
      )
      or exists (
        select 1 from public.profiles
        where id = auth.uid()
          and lower(role::text) = 'admin'
          and lower(coalesce(account_status, 'approved')) in ('approved', 'active')
      );
$$;

-- Log action to audit_logs
create or replace function public.log_audit_event(
  p_target_id uuid,
  p_action_type text,
  p_prev_value jsonb default null,
  p_new_value jsonb default null
) returns public.audit_logs
language plpgsql security definer set search_path = public as $$
declare result public.audit_logs;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  insert into public.audit_logs (admin_id, target_user_id, action_type, previous_value, new_value, timestamp)
  values (auth.uid(), p_target_id, p_action_type, p_prev_value, p_new_value, now())
  returning * into result;

  -- Also write to admin_logs for legacy queries
  insert into public.admin_logs (admin_id, target_user_id, action, metadata)
  values (auth.uid(), p_target_id, p_action_type, jsonb_build_object('prev', p_prev_value, 'new', p_new_value));

  return result;
end;
$$;

-- 1. Add / Deduct Balance (Admin only) with transaction record & audit log
create or replace function public.admin_adjust_balance(
  target_id uuid,
  currency_code text,
  delta numeric,
  reason_text text default 'Administrative adjustment'
) returns public.profiles
language plpgsql security definer set search_path = public as $$
declare result public.profiles;
declare normalized text := upper(currency_code);
declare prev_bal numeric;
declare new_bal numeric;
declare tx_type text;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  if normalized not in ('USD','EUR','GBP','NGN','BTC','ETH') then raise exception 'Unsupported currency'; end if;
  if delta = 0 then raise exception 'Balance adjustment cannot be zero'; end if;

  select coalesce((balances ->> normalized)::numeric, 0) into prev_bal
  from public.profiles where id = target_id;
  
  if prev_bal is null then raise exception 'Target user profile not found'; end if;

  new_bal := prev_bal + delta;
  if new_bal < 0 then raise exception 'Resulting balance cannot be negative'; end if;

  update public.profiles
  set balances = jsonb_set(
    balances,
    array[normalized],
    to_jsonb(new_bal),
    true
  )
  where id = target_id
  returning * into result;

  tx_type := case when delta > 0 then 'ADD' else 'DEDUCT' end;

  -- Create balance transaction record
  insert into public.balance_transactions (
    user_id, admin_id, transaction_type, currency, amount, previous_balance, new_balance, reason, timestamp
  ) values (
    target_id, auth.uid(), tx_type, normalized, abs(delta), prev_bal, new_bal, reason_text, now()
  );

  -- Log to audit_logs
  perform public.log_audit_event(
    target_id,
    case when delta > 0 then 'add_balance' else 'deduct_balance' end,
    jsonb_build_object('currency', normalized, 'balance', prev_bal),
    jsonb_build_object('currency', normalized, 'balance', new_bal, 'delta', delta, 'reason', reason_text)
  );

  return result;
end;
$$;

-- 2. Approve Users (Admin only)
create or replace function public.admin_approve_account(target_id uuid)
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare result public.profiles;
declare prev_status text;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  select account_status into prev_status from public.profiles where id = target_id;
  if prev_status is null then raise exception 'User not found'; end if;

  update public.profiles
  set account_status = 'approved', verified = true
  where id = target_id
  returning * into result;

  perform public.log_audit_event(
    target_id,
    'approve_account',
    jsonb_build_object('account_status', prev_status, 'verified', false),
    jsonb_build_object('account_status', 'approved', 'verified', true)
  );
  return result;
end;
$$;

-- 3. Reject Account (Admin only)
create or replace function public.admin_reject_account(target_id uuid, reason text default '')
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare result public.profiles;
declare prev_status text;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  select account_status into prev_status from public.profiles where id = target_id;
  if prev_status is null then raise exception 'User not found'; end if;

  update public.profiles
  set account_status = 'suspended', verified = false
  where id = target_id
  returning * into result;

  perform public.log_audit_event(
    target_id,
    'reject_account',
    jsonb_build_object('account_status', prev_status),
    jsonb_build_object('account_status', 'suspended', 'reason', reason)
  );
  return result;
end;
$$;

-- 4. Suspend Account (Admin only)
create or replace function public.admin_suspend_account(target_id uuid, reason text default '')
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare result public.profiles;
declare prev_status text;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  select account_status into prev_status from public.profiles where id = target_id;
  if prev_status is null then raise exception 'User not found'; end if;

  update public.profiles
  set account_status = 'suspended'
  where id = target_id
  returning * into result;

  perform public.log_audit_event(
    target_id,
    'suspend_account',
    jsonb_build_object('account_status', prev_status),
    jsonb_build_object('account_status', 'suspended', 'reason', reason)
  );
  return result;
end;
$$;

-- 5. Place Account On Hold (Admin only)
create or replace function public.admin_hold_account(target_id uuid, reason text default '')
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare result public.profiles;
declare prev_status text;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  select account_status into prev_status from public.profiles where id = target_id;
  if prev_status is null then raise exception 'User not found'; end if;

  update public.profiles
  set account_status = 'on_hold'
  where id = target_id
  returning * into result;

  perform public.log_audit_event(
    target_id,
    'place_on_hold',
    jsonb_build_object('account_status', prev_status),
    jsonb_build_object('account_status', 'on_hold', 'reason', reason)
  );
  return result;
end;
$$;

-- 6. Remove Hold (Admin only)
create or replace function public.admin_remove_hold(target_id uuid)
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare result public.profiles;
declare prev_status text;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  select account_status into prev_status from public.profiles where id = target_id;
  if prev_status is null then raise exception 'User not found'; end if;

  update public.profiles
  set account_status = 'approved'
  where id = target_id
  returning * into result;

  perform public.log_audit_event(
    target_id,
    'remove_hold',
    jsonb_build_object('account_status', prev_status),
    jsonb_build_object('account_status', 'approved')
  );
  return result;
end;
$$;

-- General Account Status Update (Admin only)
create or replace function public.admin_set_account_status(target_id uuid, next_status text)
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare result public.profiles;
declare prev_status text;
declare normalized_status text := lower(next_status);
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  if normalized_status not in ('pending', 'approved', 'suspended', 'on_hold', 'active', 'restricted', 'closed') then
    raise exception 'Invalid account status';
  end if;

  select account_status into prev_status from public.profiles where id = target_id;
  if prev_status is null then raise exception 'User not found'; end if;

  update public.profiles set account_status = normalized_status where id = target_id returning * into result;

  perform public.log_audit_event(
    target_id,
    'account_status_changed',
    jsonb_build_object('account_status', prev_status),
    jsonb_build_object('account_status', normalized_status)
  );
  return result;
end;
$$;

-- Verification Toggle (Admin only)
create or replace function public.admin_set_verified(target_id uuid, next_verified boolean)
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare result public.profiles;
declare prev_verified boolean;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  select verified into prev_verified from public.profiles where id = target_id;
  if prev_verified is null then raise exception 'User not found'; end if;

  update public.profiles set verified = next_verified where id = target_id returning * into result;

  perform public.log_audit_event(
    target_id,
    'verification_changed',
    jsonb_build_object('verified', prev_verified),
    jsonb_build_object('verified', next_verified)
  );
  return result;
end;
$$;

-- Change WhatsApp number (Admin only)
create or replace function public.admin_set_whatsapp_number(new_number text)
returns text
language plpgsql security definer set search_path = public as $$
declare prev_number text;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  
  select value into prev_number from public.app_settings where key = 'whatsapp_number';

  -- Update app_settings
  insert into public.app_settings (key, value, updated_at, updated_by)
  values ('whatsapp_number', new_number, now(), auth.uid())
  on conflict (key) do update set
    value = excluded.value,
    updated_at = now(),
    updated_by = auth.uid();

  -- Sync platform_settings
  insert into public.platform_settings (key, value, updated_at, updated_by)
  values ('whatsapp_number', new_number, now(), auth.uid())
  on conflict (key) do update set
    value = excluded.value,
    updated_at = now(),
    updated_by = auth.uid();

  perform public.log_audit_event(
    null,
    'change_whatsapp_number',
    jsonb_build_object('whatsapp_number', prev_number),
    jsonb_build_object('whatsapp_number', new_number)
  );
  return new_number;
end;
$$;

-- Edit Investment Plans (Admin only)
create or replace function public.admin_upsert_investment_plan(
  plan_id text,
  plan_name text,
  plan_amount numeric,
  plan_features jsonb default '[]'::jsonb,
  is_recommended boolean default false,
  sort_order int default 0
) returns public.investment_plans
language plpgsql security definer set search_path = public as $$
declare result public.investment_plans;
declare prev_plan jsonb;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;

  select to_jsonb(p) into prev_plan from public.investment_plans p where id = plan_id;

  insert into public.investment_plans (id, name, amount, features, recommended, display_order, updated_at)
  values (plan_id, plan_name, plan_amount, plan_features, is_recommended, sort_order, now())
  on conflict (id) do update set
    name = excluded.name,
    amount = excluded.amount,
    features = excluded.features,
    recommended = excluded.recommended,
    display_order = excluded.display_order,
    updated_at = now()
  returning * into result;

  perform public.log_audit_event(
    null,
    'edit_investment_plan',
    prev_plan,
    to_jsonb(result)
  );
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

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.audit_logs enable row level security;
alter table public.admin_logs enable row level security;
alter table public.balance_transactions enable row level security;
alter table public.app_settings enable row level security;
alter table public.platform_settings enable row level security;
alter table public.investment_plans enable row level security;

-- PROFILES:
-- Regular users have strictly READ-ONLY access to their own account data
drop policy if exists "users read own profile" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;
drop policy if exists "admins read all profiles" on public.profiles;
drop policy if exists "admins manage all profiles" on public.profiles;

create policy "users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "admins manage all profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- USER ROLES:
drop policy if exists "users read own role" on public.user_roles;
create policy "users read own role"
  on public.user_roles for select
  using (auth.uid() = user_id);

drop policy if exists "admins manage user roles" on public.user_roles;
create policy "admins manage user roles"
  on public.user_roles for all
  using (public.is_admin())
  with check (public.is_admin());

-- AUDIT LOGS:
drop policy if exists "admins read audit_logs" on public.audit_logs;
create policy "admins read audit_logs"
  on public.audit_logs for select
  using (public.is_admin());

drop policy if exists "admins read logs" on public.admin_logs;
create policy "admins read logs"
  on public.admin_logs for select
  using (public.is_admin());

-- BALANCE TRANSACTIONS:
drop policy if exists "users read own balance_transactions" on public.balance_transactions;
create policy "users read own balance_transactions"
  on public.balance_transactions for select
  using (auth.uid() = user_id);

drop policy if exists "admins read all balance_transactions" on public.balance_transactions;
create policy "admins read all balance_transactions"
  on public.balance_transactions for select
  using (public.is_admin());

-- APP SETTINGS (WhatsApp Number, etc.):
-- Anyone (users, guests) can read WhatsApp number for the investment plans and contact
drop policy if exists "anyone can view app_settings" on public.app_settings;
create policy "anyone can view app_settings"
  on public.app_settings for select
  using (true);

drop policy if exists "only admins can modify app_settings" on public.app_settings;
create policy "only admins can modify app_settings"
  on public.app_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- PLATFORM SETTINGS:
drop policy if exists "anyone can view platform_settings" on public.platform_settings;
create policy "anyone can view platform_settings"
  on public.platform_settings for select
  using (true);

drop policy if exists "only admins can modify platform_settings" on public.platform_settings;
create policy "only admins can modify platform_settings"
  on public.platform_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- INVESTMENT PLANS:
drop policy if exists "anyone can view investment_plans" on public.investment_plans;
create policy "anyone can view investment_plans"
  on public.investment_plans for select
  using (true);

drop policy if exists "only admins can modify investment_plans" on public.investment_plans;
create policy "only admins can modify investment_plans"
  on public.investment_plans for all
  using (public.is_admin())
  with check (public.is_admin());

-- REVOKE AND GRANT RPC PERMISSIONS
revoke all on function public.admin_adjust_balance(uuid, text, numeric, text) from public, anon;
revoke all on function public.admin_approve_account(uuid) from public, anon;
revoke all on function public.admin_reject_account(uuid, text) from public, anon;
revoke all on function public.admin_suspend_account(uuid, text) from public, anon;
revoke all on function public.admin_hold_account(uuid, text) from public, anon;
revoke all on function public.admin_remove_hold(uuid) from public, anon;
revoke all on function public.admin_set_account_status(uuid, text) from public, anon;
revoke all on function public.admin_set_verified(uuid, boolean) from public, anon;
revoke all on function public.admin_set_whatsapp_number(text) from public, anon;
revoke all on function public.admin_upsert_investment_plan(text, text, numeric, jsonb, boolean, int) from public, anon;
revoke all on function public.admin_list_users() from public, anon;

grant execute on function public.admin_adjust_balance(uuid, text, numeric, text) to authenticated;
grant execute on function public.admin_approve_account(uuid) to authenticated;
grant execute on function public.admin_reject_account(uuid, text) to authenticated;
grant execute on function public.admin_suspend_account(uuid, text) to authenticated;
grant execute on function public.admin_hold_account(uuid, text) to authenticated;
grant execute on function public.admin_remove_hold(uuid) to authenticated;
grant execute on function public.admin_set_account_status(uuid, text) to authenticated;
grant execute on function public.admin_set_verified(uuid, boolean) to authenticated;
grant execute on function public.admin_set_whatsapp_number(text) to authenticated;
grant execute on function public.admin_upsert_investment_plan(text, text, numeric, jsonb, boolean, int) to authenticated;
grant execute on function public.admin_list_users() to authenticated;
