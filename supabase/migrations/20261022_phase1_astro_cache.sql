-- ============================================================
-- SCROLL ALIGNMENT — Phase 1: My Map calculation cache
-- Additive. Server-only table (no browser policies): the map API
-- reads and writes it with the service role.
--
-- cache_key = sha256 of the complete calculation inputs: user id,
-- resolved birth instant, place, time accuracy and choice, tz database
-- version, calculation conventions, geometry version and engine
-- name + version. Any change produces a new key, so stale results
-- are never served; old rows can be pruned freely.
-- ============================================================

begin;

create table if not exists public.astro_natal_cache (
  user_id        uuid        not null,
  cache_key      text        not null,
  inputs         jsonb       not null,
  conventions    jsonb       not null,
  engine         text        not null,
  engine_version text        not null,
  result         jsonb       not null,
  created_at     timestamptz not null default now(),
  primary key (user_id, cache_key)
);

create index if not exists astro_natal_cache_created_idx on public.astro_natal_cache (created_at);

alter table public.astro_natal_cache enable row level security;
-- No policies: anon/authenticated have no access; the service role bypasses RLS.

commit;
