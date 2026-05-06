'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { getTodayString } from '@/lib/storage'
import type { AdminDailyTheme } from '@/lib/types'

const ADMIN_EMAIL = 'morethanmanagementgroup@gmail.com'

// ─── Types ────────────────────────────────────────────────────
interface UserRow {
  firstName: string
  email: string
  isPaid: boolean
  plan: string
  dailyEmail: boolean
  lifePathNumber: number | string
  chineseZodiac: string
  currentFocus: string
  createdAt: string
}

interface Stats {
  total: number
  paid: number
  emailOptIn: number
  users: UserRow[]
}

// ─── Main Page ────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [tab, setTab] = useState<'overview' | 'theme' | 'users' | 'blast'>('overview')

  // Stats
  const [stats, setStats] = useState<Stats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  // Daily theme
  const [saved, setSaved] = useState(false)
  const [themeLoading, setThemeLoading] = useState(false)
  const [theme, setTheme] = useState<Partial<AdminDailyTheme>>({
    date: getTodayString(),
    collectiveTheme: '',
    moonSeasonalNote: '',
    spiritualMessage: '',
    businessMessage: '',
    bodyMessage: '',
    shadowOfDay: '',
    powerMove: '',
    suggestedFrequency: '',
    journalPrompt: '',
    eveningReflection: '',
  })

  // Blast
  const [blasting, setBlasting] = useState(false)
  const [blastResult, setBlastResult] = useState<string | null>(null)

  // ── Auth guard ────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || session.user.email !== ADMIN_EMAIL) {
        router.push('/dashboard')
        return
      }
      setToken(session.access_token)
      setReady(true)
    })
  }, [router])

  // ── Fetch stats ───────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    if (!token) return
    setStatsLoading(true)
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) setStats(await res.json())
    } finally {
      setStatsLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (ready) fetchStats()
  }, [ready, fetchStats])

  // ── Load theme for a date ─────────────────────────────────
  const loadTheme = useCallback(async (date: string) => {
    if (!token) return
    setThemeLoading(true)
    try {
      const res = await fetch(`/api/admin/theme?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const { theme: t } = await res.json()
        if (t) {
          setTheme(t)
        } else {
          setTheme(prev => ({
            date,
            collectiveTheme: '',
            moonSeasonalNote: '',
            spiritualMessage: '',
            businessMessage: '',
            bodyMessage: '',
            shadowOfDay: '',
            powerMove: '',
            suggestedFrequency: '',
            journalPrompt: '',
            eveningReflection: '',
          }))
        }
      }
    } finally {
      setThemeLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (ready && tab === 'theme') loadTheme(theme.date ?? getTodayString())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, tab])

  const updateTheme = (k: string, v: string) => setTheme(t => ({ ...t, [k]: v }))

  const handleSaveTheme = async () => {
    if (!token || !theme.date || !theme.collectiveTheme) {
      alert('Date and Collective Theme are required.')
      return
    }
    const full: AdminDailyTheme = {
      date:               theme.date!,
      collectiveTheme:    theme.collectiveTheme!,
      moonSeasonalNote:   theme.moonSeasonalNote  ?? '',
      spiritualMessage:   theme.spiritualMessage  ?? '',
      businessMessage:    theme.businessMessage   ?? '',
      bodyMessage:        theme.bodyMessage       ?? '',
      shadowOfDay:        theme.shadowOfDay       ?? '',
      powerMove:          theme.powerMove         ?? '',
      suggestedFrequency: theme.suggestedFrequency ?? '',
      journalPrompt:      theme.journalPrompt     ?? '',
      eveningReflection:  theme.eveningReflection ?? '',
    }
    const res = await fetch('/api/admin/theme', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ theme: full }),
    })
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      alert('Save failed. Make sure the admin_themes table exists in Supabase.')
    }
  }

  // ── Manual blast ──────────────────────────────────────────
  const handleBlast = async () => {
    if (!token) return
    if (!confirm('Send the daily scroll email to all opted-in paid users NOW?')) return
    setBlasting(true)
    setBlastResult(null)
    try {
      const res = await fetch('/api/admin/blast-now', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      const r = data.result
      setBlastResult(r ? `✦ Blast sent — ${r.sent} delivered, ${r.skipped} skipped, ${r.failed} failed` : '✦ Blast triggered.')
    } catch {
      setBlastResult('Error triggering blast.')
    } finally {
      setBlasting(false)
    }
  }

  const THEME_FIELDS = [
    { key: 'collectiveTheme',    label: 'Collective Theme *',           placeholder: 'e.g. The Pivot Point — when stillness becomes the strategy' },
    { key: 'moonSeasonalNote',   label: 'Moon / Seasonal Note',         placeholder: 'e.g. Waxing Gibbous in Capricorn — crystallize intentions' },
    { key: 'spiritualMessage',   label: 'Spiritual Message',            placeholder: 'What spiritual assignment applies to everyone today?' },
    { key: 'businessMessage',    label: 'Business / Execution Message', placeholder: 'What business move should people make today?' },
    { key: 'bodyMessage',        label: 'Body Message',                 placeholder: 'Body care, movement, or somatic instruction' },
    { key: 'shadowOfDay',        label: 'Shadow of the Day',            placeholder: 'The collective blind spot or fear to watch for' },
    { key: 'powerMove',          label: 'Power Move',                   placeholder: 'The one action that shifts everything today' },
    { key: 'suggestedFrequency', label: 'Suggested Frequency',          placeholder: 'e.g. 528 Hz — transformation and DNA repair' },
    { key: 'journalPrompt',      label: 'Journal Prompt',               placeholder: "The question that opens the day's reflection" },
    { key: 'eveningReflection',  label: 'Evening Reflection',           placeholder: 'Close the day. What should they sit with tonight?' },
  ]

  if (!ready) return (
    <div className="bg-scroll-black min-h-screen flex items-center justify-center">
      <p className="text-scroll-gold/50 text-sm tracking-widest animate-pulse">Verifying access…</p>
    </div>
  )

  return (
    <div className="bg-scroll-black min-h-screen">

      {/* Top bar */}
      <div className="border-b border-scroll-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-serif text-scroll-gold text-lg">✦ Scroll Admin</span>
          <span className="text-scroll-bone-dim/30 text-xs">Master Portal</span>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-scroll-bone-dim/50 text-sm hover:text-scroll-bone transition-colors"
        >
          ← Return to App
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { key: 'overview', label: '◈ Overview' },
            { key: 'theme',    label: '✦ Daily Theme' },
            { key: 'users',    label: '◇ Users' },
            { key: 'blast',    label: '◆ Email Blast' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className={`px-5 py-2 rounded-lg text-sm transition-all ${
                tab === t.key
                  ? 'bg-scroll-gold text-scroll-black font-semibold'
                  : 'scroll-card text-scroll-bone-dim hover:text-scroll-bone'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="animate-fade-in space-y-6">
            {statsLoading ? (
              <p className="text-scroll-bone-dim/40 text-sm text-center py-10">Loading stats…</p>
            ) : stats ? (
              <>
                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-4">
                  <Card variant="dark" className="text-center">
                    <p className="font-serif text-4xl text-scroll-bone mb-1">{stats.total}</p>
                    <p className="text-scroll-bone-dim/50 text-xs uppercase tracking-wider">Total Users</p>
                  </Card>
                  <Card className="text-center scroll-card-gold">
                    <p className="font-serif text-4xl text-scroll-gold mb-1">{stats.paid}</p>
                    <p className="text-scroll-bone-dim/50 text-xs uppercase tracking-wider">Paid Members</p>
                  </Card>
                  <Card variant="dark" className="text-center">
                    <p className="font-serif text-4xl text-scroll-bone mb-1">{stats.emailOptIn}</p>
                    <p className="text-scroll-bone-dim/50 text-xs uppercase tracking-wider">Daily Email On</p>
                  </Card>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <p className="text-scroll-bone text-sm font-medium mb-1">Today's Theme</p>
                    <p className="text-scroll-bone-dim/50 text-xs mb-3">Write the admin-curated daily scroll for all members.</p>
                    <Button variant="ghost" onClick={() => setTab('theme')}>Open Theme Builder →</Button>
                  </Card>
                  <Card>
                    <p className="text-scroll-bone text-sm font-medium mb-1">Manual Blast</p>
                    <p className="text-scroll-bone-dim/50 text-xs mb-3">Send today's scroll email immediately to all opted-in members.</p>
                    <Button variant="ghost" onClick={() => setTab('blast')}>Go to Blast →</Button>
                  </Card>
                </div>

                <Card variant="dark">
                  <p className="text-scroll-bone-dim/50 text-xs uppercase tracking-wider mb-1">Conversion Rate</p>
                  <p className="font-serif text-2xl text-scroll-gold">
                    {stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0}%
                  </p>
                  <p className="text-scroll-bone-dim/40 text-xs mt-1">Free → Paid</p>
                </Card>
              </>
            ) : (
              <p className="text-scroll-bone-dim/40 text-sm text-center py-10">Could not load stats. Check that SUPABASE_SERVICE_ROLE_KEY is set in Vercel.</p>
            )}
          </div>
        )}

        {/* ── DAILY THEME BUILDER ── */}
        {tab === 'theme' && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-end gap-4 mb-2">
              <div className="flex-1">
                <label className="block text-scroll-bone-dim text-xs mb-2 uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  className="w-full bg-scroll-card border border-scroll-border rounded-lg px-4 py-3 text-scroll-bone text-sm outline-none focus:border-scroll-gold"
                  value={theme.date}
                  onChange={e => { updateTheme('date', e.target.value); loadTheme(e.target.value) }}
                />
              </div>
              <div className="text-right pb-3">
                {themeLoading
                  ? <span className="text-scroll-bone-dim/30 text-xs">Loading…</span>
                  : theme.collectiveTheme
                    ? <span className="text-scroll-gold/60 text-xs">✦ Theme loaded</span>
                    : <span className="text-scroll-bone-dim/40 text-xs">No theme set for this date</span>
                }
              </div>
            </div>

            {THEME_FIELDS.map(f => (
              <div key={f.key}>
                <label className="block text-scroll-bone-dim text-xs mb-2 uppercase tracking-wider">{f.label}</label>
                <textarea
                  className="w-full bg-scroll-card border border-scroll-border rounded-lg px-4 py-3 text-scroll-bone text-sm resize-none h-20 outline-none focus:border-scroll-gold"
                  placeholder={f.placeholder}
                  value={(theme as Record<string, string>)[f.key] ?? ''}
                  onChange={e => updateTheme(f.key, e.target.value)}
                />
              </div>
            ))}

            <Button variant="gold" className="w-full" onClick={handleSaveTheme}>
              {saved
                ? '✓ Theme Saved — All users will receive this curated scroll today'
                : `Save Theme for ${theme.date ?? '—'}`}
            </Button>

            <Card variant="dark">
              <p className="text-scroll-bone-dim/40 text-xs">
                When the daily email blast runs (or when a user visits the Dashboard) on this date, their scroll will use this admin-curated theme instead of the auto-generated template. Fields left blank fall back to template content.
              </p>
            </Card>
          </div>
        )}

        {/* ── USER LIST ── */}
        {tab === 'users' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <p className="text-scroll-bone-dim/60 text-xs">{stats?.total ?? '—'} registered users</p>
              <button onClick={fetchStats} className="text-scroll-gold/60 text-xs hover:text-scroll-gold transition-colors">↺ Refresh</button>
            </div>

            {statsLoading ? (
              <p className="text-scroll-bone-dim/40 text-sm text-center py-10">Loading users…</p>
            ) : (stats?.users ?? []).length === 0 ? (
              <p className="text-center text-scroll-bone-dim/40 py-12">No users yet.</p>
            ) : (stats?.users ?? []).map((u, i) => (
              <Card key={i}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-scroll-bone font-medium">{u.firstName}</p>
                      {u.isPaid && <span className="text-scroll-gold text-xs">✦</span>}
                      {u.dailyEmail && <span className="text-scroll-bone-dim/40 text-xs">✉</span>}
                    </div>
                    <p className="text-scroll-bone-dim/60 text-xs truncate">{u.email}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-scroll-bone-dim/40">
                      <span>LP {u.lifePathNumber}</span>
                      <span>{u.chineseZodiac}</span>
                      <span>{u.currentFocus}</span>
                      {u.createdAt !== '—' && (
                        <span>Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <span className={`flex-shrink-0 text-xs px-3 py-1 rounded-full ${
                    u.isPaid
                      ? 'bg-scroll-gold/15 text-scroll-gold'
                      : 'bg-scroll-border/50 text-scroll-bone-dim/40'
                  }`}>
                    {u.isPaid ? u.plan : 'Free'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ── EMAIL BLAST ── */}
        {tab === 'blast' && (
          <div className="space-y-5 animate-fade-in">
            <Card className="scroll-card-gold">
              <p className="text-scroll-gold text-sm font-medium mb-1">Manual Email Blast</p>
              <p className="text-scroll-bone-dim/60 text-xs mb-4">
                Sends the daily scroll email to all paid members who have opted in to daily emails. If you've set a theme for today, they'll receive the admin-curated version.
              </p>
              <div className="flex items-center gap-3 text-xs text-scroll-bone-dim/50 mb-5">
                <span>Recipients: <span className="text-scroll-gold font-medium">{stats?.emailOptIn ?? '—'}</span> opted-in members</span>
              </div>
              <Button
                variant="gold"
                className="w-full"
                onClick={handleBlast}
                disabled={blasting}
              >
                {blasting ? 'Sending…' : '✦ Send Blast Now'}
              </Button>
              {blastResult && (
                <p className="text-scroll-gold/70 text-xs text-center mt-3">{blastResult}</p>
              )}
            </Card>

            <Card variant="dark">
              <p className="text-scroll-bone-dim/50 text-xs uppercase tracking-wider mb-2">Automatic Schedule</p>
              <p className="text-scroll-bone text-sm">Daily at 11:00 UTC · 7:00am Eastern</p>
              <p className="text-scroll-bone-dim/40 text-xs mt-1">Runs automatically via Vercel Cron. This button lets you trigger it early or test it manually.</p>
            </Card>

            <Card variant="dark">
              <p className="text-scroll-bone-dim/50 text-xs uppercase tracking-wider mb-2">Sender</p>
              <p className="text-scroll-bone text-sm">Scroll Alignment &lt;onboarding@resend.dev&gt;</p>
              <p className="text-scroll-bone-dim/40 text-xs mt-1">Upgrade to a custom domain in Resend when you're ready.</p>
            </Card>
          </div>
        )}

      </div>
    </div>
  )
}
