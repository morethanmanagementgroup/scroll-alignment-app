-- ============================================================
-- SCROLL ALIGNMENT — Phase 0: protect payment fields
--
-- Run supabase/inspect-current-setup.sql first and review it.
-- This migration is ADDITIVE and preserves all user data:
--   • no rows are deleted or rewritten
--   • no existing policy is dropped
--   • it can be run more than once safely
--
-- What it does
--   1. Adds a trigger so browsers (anon / authenticated roles) cannot
--      change server-owned keys inside user_profiles.profile:
--        isPaid, plan, stripeSessionId, referralBalance, referralCount,
--        birthChart, aiReportLog, emailSendLog
--      and can set referralCode only when none exists yet.
--      Server routes use the service role and are unaffected.
--   2. Turns on row-level security for user_profiles and admin_themes
--      and adds owner-only policies for user_profiles IF no policy with
--      the same name exists. If RLS is already on with your own
--      policies, those stay as they are.
--   3. Leaves admin_themes with no browser policies: only server
--      routes (service role) read or write it — which is what the app
--      already does.
--
-- If step 3 of the inspection showed a policy that lets anon or
-- authenticated users read OTHER people's profiles (e.g. USING (true)),
-- remove it by hand after review — this migration does not drop policies.
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
alter table public.user_profiles enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public'
                 and tablename = 'user_profiles' and policyname = 'scroll_profiles_select_own') then
    create policy scroll_profiles_select_own on public.user_profiles
      for select to authenticated using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public'
                 and tablename = 'user_profiles' and policyname = 'scroll_profiles_insert_own') then
    create policy scroll_profiles_insert_own on public.user_profiles
      for insert to authenticated with check (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public'
                 and tablename = 'user_profiles' and policyname = 'scroll_profiles_update_own') then
    create policy scroll_profiles_update_own on public.user_profiles
      for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
  end if;
end $$;

-- ── 3. admin_themes: server-only ─────────────────────────────
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema = 'public' and table_name = 'admin_themes') then
    execute 'alter table public.admin_themes enable row level security';
  end if;
end $$;

commit;

-- ── Verify (optional) ────────────────────────────────────────
-- select tablename, policyname, roles, cmd from pg_policies
--  where schemaname = 'public' and tablename in ('user_profiles','admin_themes');
