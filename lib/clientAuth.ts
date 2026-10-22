// ============================================================
// SCROLL ALIGNMENT — Browser helpers for authenticated API calls
// ============================================================

import { supabase } from './supabase'

export async function getAccessToken(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  } catch {
    return null
  }
}

/** fetch() with the signed-in user's Supabase token attached. */
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken()
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  return fetch(input, { ...init, headers })
}

export interface ServerEntitlement {
  authenticated: boolean
  isPaid: boolean
  plan: 'free' | 'reading' | 'annual'
  isAdmin: boolean
}

/** Ask the server whether the signed-in user is a paid member. */
export async function fetchEntitlement(): Promise<ServerEntitlement> {
  const res = await authFetch('/api/me/entitlement')
  if (!res.ok) return { authenticated: false, isPaid: false, plan: 'free', isAdmin: false }
  return res.json()
}
