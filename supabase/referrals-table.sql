-- ============================================================
-- SCROLL ALIGNMENT — Referrals Table
-- Run this once in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- Create the referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_code     text        NOT NULL,
  referrer_user_id  uuid        REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  referred_email    text        NOT NULL DEFAULT '',
  stripe_session_id text        NOT NULL UNIQUE,   -- prevents double-recording
  amount_earned     numeric(10, 2) NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup by referrer
CREATE INDEX IF NOT EXISTS referrals_referrer_user_id_idx ON public.referrals (referrer_user_id);
CREATE INDEX IF NOT EXISTS referrals_referrer_code_idx   ON public.referrals (referrer_code);

-- Enable Row Level Security
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Service role (used by record-referral API) can do everything
CREATE POLICY "Service role full access"
  ON public.referrals
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read their own referrals
CREATE POLICY "Users can read own referrals"
  ON public.referrals
  FOR SELECT
  TO authenticated
  USING (referrer_user_id = auth.uid());

-- ============================================================
-- Done. The /api/record-referral endpoint will write here.
-- ============================================================
