-- ============================================================
-- SCROLL ALIGNMENT — Inspect the live database (READ-ONLY)
-- Run this FIRST in Supabase → SQL Editor and share the results
-- before applying any migration. It changes nothing and returns
-- no user records — only structure, policies and counts.
-- ============================================================

-- 1. Tables in the public schema, and whether row-level security is on
select c.relname                as table_name,
       c.relrowsecurity         as rls_enabled,
       c.relforcerowsecurity    as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by 1;

-- 2. Columns of the tables the app uses
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('user_profiles', 'admin_themes', 'referrals', 'pending_payments')
order by table_name, ordinal_position;

-- 3. Every RLS policy in public, with who it applies to and its rule
select tablename, policyname, permissive, roles, cmd,
       qual       as using_expression,
       with_check as with_check_expression
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 4. Triggers on the app's tables
select event_object_table as table_name, trigger_name, action_timing, event_manipulation, action_statement
from information_schema.triggers
where event_object_schema = 'public'
order by 1, 2;

-- 5. Table-level grants to the browser roles
select table_name, grantee, string_agg(privilege_type, ', ' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public' and grantee in ('anon', 'authenticated')
group by table_name, grantee
order by 1, 2;

-- 6. Counts only (no personal data): how many profiles claim to be paid,
--    and how many of those have no Stripe session on record.
select count(*)                                                        as profiles,
       count(*) filter (where profile->>'isPaid' = 'true')             as paid_flag_true,
       count(*) filter (where profile->>'isPaid' = 'true'
                          and coalesce(profile->>'stripeSessionId','') = '') as paid_without_stripe_session
from public.user_profiles;
