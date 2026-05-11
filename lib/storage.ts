// ============================================================
// SCROLL ALIGNMENT — Storage Adapter
// MVP: localStorage. Future: swap for Supabase client.
// Interface is intentionally Supabase-compatible.
// ============================================================

import type {
  User, ScrollSnapshot, FullScrollReport,
  DailyScroll, JournalEntry, Routine,
  AdminDailyTheme, StorageAdapter, DailyJournal,
} from './types'

const KEYS = {
  user:         'sa_user',
  snapshot:     'sa_snapshot',
  report:       'sa_report',
  dailys:       'sa_daily_scrolls',
  journals:     'sa_journals',
  dailyJournal: 'sa_daily_journal',
  routines:     'sa_routines',
  adminThemes:  'sa_admin_themes',
} as const

function safeGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch { return null }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

// ─── localStorage Adapter ─────────────────────────────────────

export const storage: StorageAdapter = {
  // User
  getUser: ()          => safeGet<User>(KEYS.user),
  saveUser: (user)     => safeSet(KEYS.user, user),

  // Snapshot
  getSnapshot: ()          => safeGet<ScrollSnapshot>(KEYS.snapshot),
  saveSnapshot: (snap)     => safeSet(KEYS.snapshot, snap),

  // Full Report
  getFullReport: ()        => safeGet<FullScrollReport>(KEYS.report),
  saveFullReport: (report) => safeSet(KEYS.report, report),

  // Daily Scrolls
  getDailyScroll: (date) => {
    const all = safeGet<Record<string, DailyScroll>>(KEYS.dailys) ?? {}
    return all[date] ?? null
  },
  saveDailyScroll: (scroll) => {
    const all = safeGet<Record<string, DailyScroll>>(KEYS.dailys) ?? {}
    all[scroll.date] = scroll
    safeSet(KEYS.dailys, all)
  },

  // Journal
  getJournalEntries: () => safeGet<JournalEntry[]>(KEYS.journals) ?? [],
  saveJournalEntry: (entry) => {
    const all = safeGet<JournalEntry[]>(KEYS.journals) ?? []
    const idx = all.findIndex(e => e.id === entry.id)
    if (idx >= 0) all[idx] = entry
    else all.unshift(entry)
    safeSet(KEYS.journals, all)
  },

  // Daily Journal (three-session format)
  getDailyJournal: (date: string): DailyJournal | null => {
    const all = safeGet<Record<string, DailyJournal>>(KEYS.dailyJournal) ?? {}
    return all[date] ?? null
  },
  saveDailyJournal: (journal: DailyJournal): void => {
    const all = safeGet<Record<string, DailyJournal>>(KEYS.dailyJournal) ?? {}
    all[journal.date] = journal
    safeSet(KEYS.dailyJournal, all)
  },
  getAllDailyJournals: (): DailyJournal[] => {
    const all = safeGet<Record<string, DailyJournal>>(KEYS.dailyJournal) ?? {}
    return Object.values(all).sort((a, b) => b.date.localeCompare(a.date))
  },

  // Routines
  getRoutine: (date) => {
    const all = safeGet<Record<string, Routine>>(KEYS.routines) ?? {}
    return all[date] ?? null
  },
  saveRoutine: (routine) => {
    const all = safeGet<Record<string, Routine>>(KEYS.routines) ?? {}
    all[routine.date] = routine
    safeSet(KEYS.routines, all)
  },

  // Admin Themes
  getAdminThemes: () => safeGet<AdminDailyTheme[]>(KEYS.adminThemes) ?? [],
  saveAdminTheme: (theme) => {
    const all = safeGet<AdminDailyTheme[]>(KEYS.adminThemes) ?? []
    const idx = all.findIndex(t => t.date === theme.date)
    if (idx >= 0) all[idx] = theme
    else all.unshift(theme)
    safeSet(KEYS.adminThemes, all)
  },
  getAdminThemeForDate: (date) => {
    const all = safeGet<AdminDailyTheme[]>(KEYS.adminThemes) ?? []
    return all.find(t => t.date === date) ?? null
  },

  clearAll: () => {
    if (typeof window === 'undefined') return
    Object.values(KEYS).forEach(k => localStorage.removeItem(k))
  },
}

// ─── Helpers ──────────────────────────────────────────────────

export function getTodayString(): string {
  const now = new Date()
  const year  = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day   = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/*
 * ──────────────────────────────────────────────────────────────
 * SUPABASE UPGRADE PATH
 * ──────────────────────────────────────────────────────────────
 * When you are ready to upgrade from localStorage to Supabase:
 *
 * 1. npm install @supabase/supabase-js
 * 2. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local
 * 3. Create tables matching the types in lib/types.ts
 * 4. Replace the storage object above with the Supabase adapter:
 *
 * import { createClient } from '@supabase/supabase-js'
 * const supabase = createClient(url, key)
 *
 * export const storage: StorageAdapter = {
 *   getUser: async () => {
 *     const { data } = await supabase.from('users').select().single()
 *     return data
 *   },
 *   saveUser: async (user) => {
 *     await supabase.from('users').upsert(user)
 *   },
 *   // ... etc.
 * }
 *
 * Note: Supabase methods are async — update all call sites to await them.
 * ──────────────────────────────────────────────────────────────
 */
