'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { storage, getTodayString, formatDate } from '@/lib/storage'
import type { AdminDailyTheme, User } from '@/lib/types'

const ADMIN_PASSWORD = 'scroll-admin-2024'

function AdminGate({ onUnlock }: { onUnlock: () => void }) {
  const [pass, setPass] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = () => {
    const stored = localStorage.getItem('sa_admin_pass') ?? ADMIN_PASSWORD
    if (pass === stored) {
      sessionStorage.setItem('sa_admin_unlocked', '1')
      onUnlock()
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div className="bg-scroll-black min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-2 text-center">Admin Access</p>
        <h1 className="font-serif text-3xl text-center mb-8">Scroll Portal</h1>
        <input
          type="password"
          className="w-full bg-scroll-card border border-scroll-border rounded-lg px-4 py-3 text-scroll-bone text-sm outline-none focus:border-scroll-gold mb-3"
          placeholder="Admin password"
          value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
        {error && <p className="text-red-400/70 text-xs text-center mb-3">Incorrect password.</p>}
        <Button variant="gold" className="w-full" onClick={handleSubmit}>Enter</Button>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [unlocked, setUnlocked] = useState(false)
  const [tab, setTab] = useState<'theme' | 'users' | 'settings'>('theme')
  const [saved, setSaved] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [newPass, setNewPass] = useState('')
  const [newAccessCode, setNewAccessCode] = useState('')
  const [savedSettings, setSavedSettings] = useState(false)

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

  useEffect(() => {
    if (sessionStorage.getItem('sa_admin_unlocked') === '1') {
      setUnlocked(true)
    }
  }, [])

  useEffect(() => {
    if (!unlocked) return
    // Load users (in MVP this is just the one local user)
    const u = storage.getUser()
    if (u) setUsers([u])
    // Load existing theme for selected date
    loadThemeForDate(getTodayString())
    // Load current access code
    const code = localStorage.getItem('sa_access_code') ?? 'SCROLL33'
    setNewAccessCode(code)
  }, [unlocked])

  const loadThemeForDate = (date: string) => {
    const existing = storage.getAdminThemeForDate(date)
    if (existing) {
      setTheme(existing)
    } else {
      setTheme(t => ({ ...t, date }))
    }
  }

  const updateTheme = (k: string, v: string) => setTheme(t => ({ ...t, [k]: v }))

  const handleSaveTheme = () => {
    if (!theme.date || !theme.collectiveTheme) {
      alert('Date and Collective Theme are required.')
      return
    }
    const fullTheme: AdminDailyTheme = {
      date: theme.date!,
      collectiveTheme: theme.collectiveTheme!,
      moonSeasonalNote: theme.moonSeasonalNote ?? '',
      spiritualMessage: theme.spiritualMessage ?? '',
      businessMessage: theme.businessMessage ?? '',
      bodyMessage: theme.bodyMessage ?? '',
      shadowOfDay: theme.shadowOfDay ?? '',
      powerMove: theme.powerMove ?? '',
      suggestedFrequency: theme.suggestedFrequency ?? '',
      journalPrompt: theme.journalPrompt ?? '',
      eveningReflection: theme.eveningReflection ?? '',
    }
    storage.saveAdminTheme(fullTheme)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleMarkPaid = (userId: string) => {
    const u = storage.getUser()
    if (!u || u.id !== userId) return
    const updated = { ...u, isPaid: true }
    storage.saveUser(updated)
    setUsers([updated])
  }

  const handleMarkUnpaid = (userId: string) => {
    const u = storage.getUser()
    if (!u || u.id !== userId) return
    const updated = { ...u, isPaid: false }
    storage.saveUser(updated)
    setUsers([updated])
  }

  const handleSaveSettings = () => {
    if (newPass.trim()) {
      localStorage.setItem('sa_admin_pass', newPass.trim())
    }
    if (newAccessCode.trim()) {
      localStorage.setItem('sa_access_code', newAccessCode.trim().toUpperCase())
    }
    setSavedSettings(true)
    setTimeout(() => setSavedSettings(false), 3000)
  }

  const THEME_FIELDS = [
    { key: 'collectiveTheme',    label: 'Collective Theme *',        placeholder: 'e.g. The Pivot Point — when stillness becomes the strategy' },
    { key: 'moonSeasonalNote',   label: 'Moon / Seasonal Note',      placeholder: 'e.g. Waxing Gibbous in Capricorn — crystallize intentions' },
    { key: 'spiritualMessage',   label: 'Spiritual Message',         placeholder: 'What spiritual assignment applies to everyone today?' },
    { key: 'businessMessage',    label: 'Business / Execution Message', placeholder: 'What business move should people make today?' },
    { key: 'bodyMessage',        label: 'Body Message',              placeholder: 'Body care, movement, or somatic instruction for today' },
    { key: 'shadowOfDay',        label: 'Shadow of the Day',         placeholder: 'The collective blind spot or fear to watch for' },
    { key: 'powerMove',          label: 'Power Move',                placeholder: 'The one action that shifts everything today' },
    { key: 'suggestedFrequency', label: 'Suggested Frequency',       placeholder: 'e.g. 528 Hz — transformation and DNA repair' },
    { key: 'journalPrompt',      label: 'Journal Prompt',            placeholder: "The question that opens the day's reflection" },
    { key: 'eveningReflection',  label: 'Evening Reflection',        placeholder: 'Close the day. What should they sit with tonight?' },
  ]

  if (!unlocked) {
    return <AdminGate onUnlock={() => setUnlocked(true)} />
  }

  return (
    <div className="bg-scroll-black min-h-screen">
      <div className="border-b border-scroll-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="font-serif text-scroll-gold text-lg">✦ Scroll Admin</p>
          <span className="text-scroll-bone-dim/40 text-xs">Portal</span>
        </div>
        <button onClick={() => router.push('/dashboard')} className="text-scroll-bone-dim/50 text-sm hover:text-scroll-bone transition-colors">
          ← Return to App
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { key: 'theme',    label: 'Daily Theme Builder' },
            { key: 'users',    label: 'User Management' },
            { key: 'settings', label: 'Admin Settings' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className={`px-5 py-2 rounded-lg text-sm transition-all ${
                tab === t.key ? 'bg-scroll-gold text-scroll-black font-semibold' : 'scroll-card text-scroll-bone-dim'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

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
                  onChange={e => { updateTheme('date', e.target.value); loadThemeForDate(e.target.value) }}
                />
              </div>
              <div className="text-right">
                {storage.getAdminThemeForDate(theme.date ?? '') ? (
                  <span className="text-scroll-gold/60 text-xs">✦ Theme exists for this date</span>
                ) : (
                  <span className="text-scroll-bone-dim/40 text-xs">No theme set for this date</span>
                )}
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
              {saved ? '✓ Theme Saved — Users will see admin-curated scroll for this date' : `Save Daily Theme for ${theme.date ? formatDate(theme.date) : '—'}`}
            </Button>

            <p className="text-scroll-bone-dim/40 text-xs text-center">
              When a user visits the Dashboard on this date, their scroll will be generated using this theme and marked as "Admin-Curated." Empty fields fall back to template content.
            </p>
          </div>
        )}

        {/* ── USER MANAGEMENT ── */}
        {tab === 'users' && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-scroll-bone-dim/60 text-xs mb-4">MVP: Shows the local browser user. In production, this panel will connect to Supabase to show all registered users.</p>
            {users.length === 0 ? (
              <p className="text-center text-scroll-bone-dim py-12">No users found in local storage.</p>
            ) : users.map(u => (
              <Card key={u.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-scroll-bone font-medium">{u.firstName}</p>
                    <p className="text-scroll-bone-dim/60 text-xs mt-0.5">{u.email}</p>
                    <div className="flex gap-4 mt-3 text-xs text-scroll-bone-dim/50">
                      <span>LP: <span className="text-scroll-gold">{u.lifePathNumber}</span></span>
                      <span>Zodiac: <span className="text-scroll-gold">{u.chineseZodiac}</span></span>
                      <span>Element: <span className="text-scroll-gold">{u.chineseElement}</span></span>
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-scroll-bone-dim/50">
                      <span>Focus: {u.currentFocus}</span>
                      <span>DOB: {u.birthDate}</span>
                    </div>
                    {u.currentIntention && (
                      <p className="text-scroll-bone-dim/40 text-xs mt-2 italic line-clamp-2">"{u.currentIntention}"</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full ${u.isPaid ? 'bg-scroll-gold/20 text-scroll-gold' : 'bg-scroll-border text-scroll-bone-dim/50'}`}>
                      {u.isPaid ? '✦ Paid' : 'Free'}
                    </span>
                    {u.isPaid ? (
                      <button onClick={() => handleMarkUnpaid(u.id)}
                        className="text-xs text-scroll-bone-dim/40 hover:text-red-400 transition-colors">
                        Revoke Access
                      </button>
                    ) : (
                      <button onClick={() => handleMarkPaid(u.id)}
                        className="text-xs text-scroll-gold/70 hover:text-scroll-gold transition-colors">
                        Mark as Paid →
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ── ADMIN SETTINGS ── */}
        {tab === 'settings' && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <p className="text-scroll-bone text-sm font-medium mb-1">Access Code</p>
              <p className="text-scroll-bone-dim/60 text-xs mb-4">The code users enter on the Unlock page to manually mark themselves as paid. Share this with your buyers.</p>
              <div className="flex gap-3">
                <input
                  className="flex-1 bg-scroll-deep border border-scroll-border rounded-lg px-4 py-3 text-scroll-bone text-sm outline-none focus:border-scroll-gold uppercase"
                  value={newAccessCode}
                  onChange={e => setNewAccessCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SCROLL33"
                />
              </div>
            </Card>

            <Card>
              <p className="text-scroll-bone text-sm font-medium mb-1">Admin Password</p>
              <p className="text-scroll-bone-dim/60 text-xs mb-4">Change the password required to access this admin portal. Default: scroll-admin-2024</p>
              <input
                type="password"
                className="w-full bg-scroll-deep border border-scroll-border rounded-lg px-4 py-3 text-scroll-bone text-sm outline-none focus:border-scroll-gold"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="New admin password (leave blank to keep current)"
              />
            </Card>

            <Button variant="gold" className="w-full" onClick={handleSaveSettings}>
              {savedSettings ? '✓ Settings Saved' : 'Save Admin Settings'}
            </Button>

            <Card variant="dark">
              <p className="text-scroll-bone-dim/50 text-xs uppercase tracking-wider mb-3">Production Upgrade Checklist</p>
              <div className="space-y-2 text-xs text-scroll-bone-dim/50">
                {[
                  'Connect Stripe → remove access code system',
                  'Add Supabase → replace localStorage adapter',
                  'Add Claude API key → enable AI generation mode',
                  'Secure admin route with server-side auth',
                  'Add multi-user admin panel (see all subscribers)',
                  'Add email sequences (Day 0, Day 3, Day 7)',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-scroll-gold/30 mt-0.5">◦</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
