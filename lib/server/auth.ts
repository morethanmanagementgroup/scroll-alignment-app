// ============================================================
// SCROLL ALIGNMENT — Server-side identity and entitlement checks
// Use these in every API route that returns paid content or costs
// money. Never trust isPaid/plan sent from the browser.
//
// Entitlement is read from user_profiles.profile with the service
// role. The protect_profile_fields trigger (supabase/migrations/
// 20261022_phase0_access_control.sql) stops browsers from changing
// isPaid / plan / stripeSessionId / birthChart, so this value is
// only trustworthy once that migration has been applied.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? 'morethanmanagementgroup@gmail.com').toLowerCase()

let adminClient: SupabaseClient | null = null

/** Service-role client. Bypasses RLS — server use only. */
export function getAdminClient(): SupabaseClient {
  if (adminClient) return adminClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase server credentials are not configured')
  adminClient = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  return adminClient
}

export interface AuthUser { id: string; email: string }

export interface Entitlement {
  isPaid: boolean
  plan: 'free' | 'reading' | 'annual'
  isAdmin: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ProfileJson = Record<string, any>

function bearer(req: NextRequest): string | null {
  const h = req.headers.get('authorization') ?? ''
  return h.startsWith('Bearer ') ? h.slice(7).trim() || null : null
}

/** The signed-in Supabase user behind the request's bearer token, or null. */
export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const token = bearer(req)
  if (!token) return null
  try {
    const { data, error } = await getAdminClient().auth.getUser(token)
    if (error || !data.user) return null
    return { id: data.user.id, email: (data.user.email ?? '').toLowerCase() }
  } catch {
    return null
  }
}

export async function getProfile(userId: string): Promise<ProfileJson | null> {
  const { data, error } = await getAdminClient()
    .from('user_profiles').select('profile').eq('id', userId).maybeSingle()
  if (error || !data) return null
  return (data.profile ?? null) as ProfileJson | null
}

export function entitlementOf(profile: ProfileJson | null, email: string): Entitlement {
  const isAdmin = email === ADMIN_EMAIL
  const plan = profile?.plan === 'annual' || profile?.plan === 'reading' ? profile.plan : 'free'
  return { isPaid: isAdmin || profile?.isPaid === true, plan, isAdmin }
}

type Fail = { ok: false; response: NextResponse }

export async function requireUser(req: NextRequest): Promise<{ ok: true; user: AuthUser } | Fail> {
  const user = await getAuthUser(req)
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Sign in required' }, { status: 401 }) }
  }
  return { ok: true, user }
}

export async function requirePaidUser(req: NextRequest): Promise<
  { ok: true; user: AuthUser; profile: ProfileJson | null; entitlement: Entitlement } | Fail
> {
  const auth = await requireUser(req)
  if (!auth.ok) return auth
  const profile = await getProfile(auth.user.id)
  const entitlement = entitlementOf(profile, auth.user.email)
  if (!entitlement.isPaid) {
    return { ok: false, response: NextResponse.json({ error: 'Membership required' }, { status: 403 }) }
  }
  return { ok: true, user: auth.user, profile, entitlement }
}

/**
 * Write server-owned keys into a profile (service role). Merges into
 * the existing JSON so client-owned keys are left untouched.
 */
export async function updateServerFields(userId: string, fields: ProfileJson): Promise<ProfileJson> {
  const db = getAdminClient()
  const current = (await getProfile(userId)) ?? {}
  const profile = { ...current, ...fields }
  const { error } = await db.from('user_profiles')
    .update({ profile, updated_at: new Date().toISOString() }).eq('id', userId)
  if (error) throw new Error(`Profile update failed: ${error.message}`)
  return profile
}
