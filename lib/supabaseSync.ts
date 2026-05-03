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
        profile: user,
        snapshot,
        report,
        journals,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
  } catch {
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

    if (data.profile) storage.saveUser(data.profile)
    if (data.snapshot) storage.saveSnapshot(data.snapshot)
    if (data.report) storage.saveFullReport(data.report)

    if (Array.isArray(data.journals)) {
      ;(data.journals as JournalEntry[]).forEach(j => storage.saveJournalEntry(j))
    }

    if (data.daily_scrolls && typeof data.daily_scrolls === 'object') {
      Object.values(data.daily_scrolls as Record<string, DailyScroll>).forEach(s =>
        storage.saveDailyScroll(s)
      )
    }

    if (data.routines && typeof data.routines === 'object') {
      Object.values(data.routines as Record<string, Routine>).forEach(r =>
        storage.saveRoutine(r)
      )
    }

    return true
  } catch {
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
        profile: updatedUser,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
  } catch {
    // Silent fail
  }
}

// ─── Get current Supabase session user ID ─────────────────────
export async function getCloudUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.user?.id ?? null
}
