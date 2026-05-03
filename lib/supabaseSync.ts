// ============================================================
// SCROLL ALIGNMENT — Supabase Sync Layer
// Bridges the synchronous localStorage adapter with Supabase.
// All functions are async and non-blocking (fire-and-forget safe).
// ============================================================

import { supabase } from './supabase'
import { storage } from './storage'
import type { JournalEntry, DailyScroll, Routine } from './types'

// ─── Save all local data to Supabase ─────────────────────────
export async function saveToCloud(userId: string): Promise<void> {
  try {
    const user = storage.getUser()
    const snapshot = storage.getSnapshot()
    const report = storage.getFullReport()
    const journals = storage.getJournalEntries()

    await supabase.from('user_profiles').upsert(
      {
        id: userId,
        email: user?.email ?? '',
        profile: user as unknown,
        snapshot: snapshot as unknown,
        report: report as unknown,
        journals: journals as unknown,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
  } catch (_e) {
    // Never block the UI — silently fail
  }
}

// ─── Restore localStorage from Supabase on sign-in ───────────
export async function restoreFromCloud(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) return false

    // Cast to any for flexible property access (no typed schema)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = data as any

    if (row.profile) storage.saveUser(row.profile)
    if (row.snapshot) storage.saveSnapshot(row.snapshot)
    if (row.report) storage.saveFullReport(row.report)

    if (Array.isArray(row.journals)) {
      const journals = row.journals as JournalEntry[]
      journals.forEach(j => storage.saveJournalEntry(j))
    }

    if (row.daily_scrolls && typeof row.daily_scrolls === 'object') {
      const scrolls = row.daily_scrolls as Record<string, DailyScroll>
      Object.values(scrolls).forEach(s => storage.saveDailyScroll(s))
    }

    if (row.routines && typeof row.routines === 'object') {
      const routines = row.routines as Record<string, Routine>
      Object.values(routines).forEach(r => storage.saveRoutine(r))
    }

    return true
  } catch (_e) {
    return false
  }
}

// ─── Update payment status only ───────────────────────────────
export async function syncPaymentToCloud(
  userId: string,
  plan: string,
  stripeSessionId: string
): Promise<void> {
  try {
    const user = storage.getUser()
    if (!user) return

    const updatedUser = { ...user, isPaid: true, plan, stripeSessionId }
    await supabase.from('user_profiles').upsert(
      {
        id: userId,
        email: updatedUser.email,
        profile: updatedUser as unknown,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
  } catch (_e) {
    // Silent fail
  }
}

// ─── Get current Supabase session user ID ─────────────────────
export async function getCloudUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.user?.id ?? null
}
