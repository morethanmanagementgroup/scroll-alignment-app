-- ============================================================
-- SCROLL ALIGNMENT — Phase 0: protect payment fields
--
-- Run supabase/inspect-current-setup.sql first and review it.
-- This migration is ADDITIVE and preserves all user data:
--   • no rows are deleted or rewritten
--   • the only policy removed is admin_themes "Public read" (unused by the app)
--   • it can be run more than once safely
--
-- What it does
--   1. Adds a trigger so browsers (anon / authenticated roles) cannot
--      change server-owned keys inside user_profiles.profile:
--        isPaid, plan, stripeSessionId, referralBalance, referralCount,
--        birthChart, aiReportLog, emailSendLog
--      and can set referralCode only when none exists yet.
--      Server routes use the service role and are unaffected.
--   2. Keeps row-level security on user_profiles, adding an owner-only
--      policy only for a command that has none (your existing policies
--      already cover select / insert / update, so none are added).
--   3. Removes admin_themes "Public read": only server routes (service
--      role) read or write that table.
--   4. Revokes TRUNCATE from the browser roles.
-- ============================================================

begin;

-- ── 0. Preconditions ─────────────────────────────────────────
do $$
declare t text;
begin
  select data_type into t from information_schema.columns
   where table_schema = 'public' and table_name = 'user_profiles' and column_name = 'profile';
  if t is null then
    raise exception 'public.user_profiles.profile not found — stop and review the inspection output';
  end if;
  if t <> 'jsonb' then
    raise exception 'user_profiles.profile is %, expected jsonb — stop and review', t;
  end if;
end $$;

-- ── 1. Protect server-owned profile keys ─────────────────────
create or replace function public.scroll_protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  claims  text := nullif(current_setting('request.jwt.claims', true), '');
  req_role text := coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    case when claims is not null then claims::jsonb ->> 'role' end
  );
  k text;
  protected_keys text[] := array[
    'isPaid', 'plan', 'stripeSessionId', 'referralBalance', 'referralCount',
    'birthChart', 'aiReportLog', 'emailSendLog'
  ];
begin
  -- service_role, postgres and dashboard sessions are trusted.
  if req_role is null or req_role not in ('anon', 'authenticated') then
    return new;
  end if;
  if new.profile is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- A browser creating its own profile always starts unpaid.
    foreach k in array protected_keys loop
      new.profile := new.profile - k;
    end loop;
    new.profile := new.profile || jsonb_build_object(
      'isPaid', false, 'plan', 'free', 'referralBalance', 0, 'referralCount', 0);
    return new;
  end if;

  -- UPDATE (including the UPDATE half of an upsert): keep the stored values.
  foreach k in array protected_keys loop
    if old.profile is not null and old.profile ? k then
      new.profile := jsonb_set(new.profile, array[k], old.profile -> k, true);
    else
      new.profile := new.profile - k;
    end if;
  end loop;
  -- referralCode: may be set once (the app back-fills it), never changed.
  if old.profile is not null and coalesce(old.profile ->> 'referralCode', '') <> '' then
    new.profile := jsonb_set(new.profile, array['referralCode'], old.profile -> 'referralCode', true);
  end if;
  return new;
end $$;

drop trigger if exists scroll_protect_profile_fields on public.user_profiles;
create trigger scroll_protect_profile_fields
  before insert or update on public.user_profiles
  for each row execute function public.scroll_protect_profile_fields();

-- ── 2. Row-level security on user_profiles ───────────────────
-- Inspected 30 Oct 2026: RLS already on, with owner-only policies
-- "Users can view/insert/update own profile". A policy is added here
-- only for a command that has no policy at all, so nothing is duplicated.
alter table public.user_profiles enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public'
                 and tablename = 'user_profiles' and cmd in ('SELECT', 'ALL')) then
    create policy scroll_profiles_select_own on public.user_profiles
      for select to authenticated using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public'
                 and tablename = 'user_profiles' and cmd in ('INSERT', 'ALL')) then
    create policy scroll_profiles_insert_own on public.user_profiles
      for insert to authenticated with check (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public'
                 and tablename = 'user_profiles' and cmd in ('UPDATE', 'ALL')) then
    create policy scroll_profiles_update_own on public.user_profiles
      for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
  end if;
end $$;

-- ── 3. admin_themes: server-only ─────────────────────────────
-- Inspected 30 Oct 2026: a "Public read" policy let anyone read every
-- curated theme, including future dates. The app reads this table only
-- from server routes (service role), so the policy is removed.
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema = 'public' and table_name = 'admin_themes') then
    execute 'alter table public.admin_themes enable row level security';
    if exists (select 1 from pg_policies where schemaname = 'public'
               and tablename = 'admin_themes' and policyname = 'Public read') then
      execute 'drop policy "Public read" on public.admin_themes';
    end if;
  end if;
end $$;

-- ── 4. Hardening: TRUNCATE ignores row-level security ────────
-- The browser API cannot issue TRUNCATE, but the grant is unnecessary.
do $$
declare t text;
begin
  foreach t in array array['user_profiles', 'admin_themes', 'referrals', 'astro_natal_cache'] loop
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = t) then
      execute format('revoke truncate on public.%I from anon, authenticated', t);
    end if;
  end loop;
end $$;

commit;

-- ── Verify (optional) ────────────────────────────────────────
-- select tablename, policyname, roles, cmd from pg_policies
--  where schemaname = 'public' and tablename in ('user_profiles','admin_themes');
