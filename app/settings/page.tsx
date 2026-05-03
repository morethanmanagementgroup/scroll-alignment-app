'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { storage, getTodayString } from '@/lib/storage'
import { enrichUserProfile } from '@/lib/scrollEngine'
import { FOCUS_MESSAGES } from '@/lib/templates'
import type { User } from '@/lib/types'

const FOCUS_AREAS = Object.keys(FOCUS_MESSAGES) as (keyof typeof FOCUS_MESSAGES)[]

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [tab, setTab] = useState<'profile' | 'intention' | 'data'>('profile')
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    email: '',
    birthDate: '',
    birthTime: '',
    birthCity: '',
    birthRegion: '',
    birthCountry: '',
    currentFocus: '' as keyof typeof FOCUS_MESSAGES | '',
    currentIntention: '',
  })

  useEffect(() => {
    const u = storage.getUser()
    if (!u) { router.push('/onboarding'); return }
    if (!u.isPaid) { router.push('/unlock'); return }
    setUser(u)
    setForm({
      firstName: u.firstName,
      email: u.email,
      birthDate: u.birthDate,
      birthTime: u.birthTime ?? '',
      birthCity: u.birthCity,
      birthRegion: u.birthRegion,
      birthCountry: u.birthCountry,
      currentFocus: u.currentFocus,
      currentIntention: u.currentIntention,
    })
  }, [router])

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!user) return
    const updated: User = {
      ...user,
      firstName: form.firstName,
      email: form.email,
      birthDate: form.birthDate,
      birthTime: form.birthTime || undefined,
      birthCity: form.birthCity,
      birthRegion: form.birthRegion,
      birthCountry: form.birthCountry,
      currentFocus: form.currentFocus as keyof typeof FOCUS_MESSAGES,
      currentIntention: form.currentIntention,
      ...enrichUserProfile({
        ...user,
        birthDate: form.birthDate,
      }),
    }
    storage.saveUser(updated)
    setUser(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleExport = () => {
    const data = {
      user: storage.getUser(),
      snapshot: storage.getSnapshot(),
      report: storage.getFullReport(),
      journals: storage.getJournalEntries(),
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scroll-alignment-export-${getTodayString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClearData = () => {
    if (!confirm('This will permanently delete all your Scroll Alignment data. This cannot be undone. Are you sure?')) return
    localStorage.clear()
    router.push('/onboarding')
  }

  if (!user) return null

  return (
    <div className="bg-scroll-black min-h-screen flex">
      <Sidebar isPaid />
      <div className="flex-1">
        <Header isPaid />
        <main className="max-w-2xl mx-auto px-6 py-10">
          <div className="mb-8">
            <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-1">Settings</p>
            <h1 className="font-serif text-3xl">Your Profile</h1>
          </div>

          {/* Paid Status Banner */}
          <div className="scroll-card-gold px-6 py-4 mb-8 flex items-center justify-between">
            <div>
              <p className="text-scroll-gold text-sm font-medium">Full Scroll Access — Active</p>
              <p className="text-scroll-bone-dim/60 text-xs mt-0.5">Lifetime access + all Daily Alignments</p>
            </div>
            <span className="text-scroll-gold text-lg">✦</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {[
              { key: 'profile', label: 'Profile' },
              { key: 'intention', label: 'Intention & Focus' },
              { key: 'data', label: 'Data' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
                className={`px-5 py-2 rounded-lg text-sm transition-all ${
                  tab === t.key ? 'bg-scroll-gold text-scroll-black font-semibold' : 'scroll-card text-scroll-bone-dim'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'profile' && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-scroll-bone-dim text-xs mb-2 uppercase tracking-wider">First Name</label>
                  <input
                    className="w-full bg-scroll-card border border-scroll-border rounded-lg px-4 py-3 text-scroll-bone text-sm outline-none focus:border-scroll-gold"
                    value={form.firstName}
                    onChange={e => update('firstName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-scroll-bone-dim text-xs mb-2 uppercase tracking-wider">Email</label>
                  <input
                    className="w-full bg-scroll-card border border-scroll-border rounded-lg px-4 py-3 text-scroll-bone text-sm outline-none focus:border-scroll-gold"
                    type="email"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-scroll-bone-dim text-xs mb-2 uppercase tracking-wider">Birth Date</label>
                  <input
                    className="w-full bg-scroll-card border border-scroll-border rounded-lg px-4 py-3 text-scroll-bone text-sm outline-none focus:border-scroll-gold"
                    type="date"
                    value={form.birthDate}
                    onChange={e => update('birthDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-scroll-bone-dim text-xs mb-2 uppercase tracking-wider">Birth Time <span className="text-scroll-bone-dim/40">(optional)</span></label>
                  <input
                    className="w-full bg-scroll-card border border-scroll-border rounded-lg px-4 py-3 text-scroll-bone text-sm outline-none focus:border-scroll-gold"
                    type="time"
                    value={form.birthTime}
                    onChange={e => update('birthTime', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-scroll-bone-dim text-xs mb-2 uppercase tracking-wider">Birth City</label>
                <input
                  className="w-full bg-scroll-card border border-scroll-border rounded-lg px-4 py-3 text-scroll-bone text-sm outline-none focus:border-scroll-gold"
                  value={form.birthCity}
                  onChange={e => update('birthCity', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-scroll-bone-dim text-xs mb-2 uppercase tracking-wider">State / Region</label>
                  <input
                    className="w-full bg-scroll-card border border-scroll-border rounded-lg px-4 py-3 text-scroll-bone text-sm outline-none focus:border-scroll-gold"
                    value={form.birthRegion}
                    onChange={e => update('birthRegion', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-scroll-bone-dim text-xs mb-2 uppercase tracking-wider">Country</label>
                  <input
                    className="w-full bg-scroll-card border border-scroll-border rounded-lg px-4 py-3 text-scroll-bone text-sm outline-none focus:border-scroll-gold"
                    value={form.birthCountry}
                    onChange={e => update('birthCountry', e.target.value)}
                  />
                </div>
              </div>

              {/* Read-only numerology info */}
              <Card variant="dark" className="mt-2">
                <p className="text-scroll-bone-dim/50 text-xs uppercase tracking-wider mb-3">Your Codes (recalculated on save)</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-scroll-gold font-serif text-xl">{user.lifePathNumber}</p>
                    <p className="text-scroll-bone-dim/50 text-xs mt-1">Life Path</p>
                  </div>
                  <div>
                    <p className="text-scroll-gold font-serif text-lg">{user.chineseZodiac}</p>
                    <p className="text-scroll-bone-dim/50 text-xs mt-1">Zodiac</p>
                  </div>
                  <div>
                    <p className="text-scroll-gold font-serif text-lg">{user.chineseElement}</p>
                    <p className="text-scroll-bone-dim/50 text-xs mt-1">Element</p>
                  </div>
                </div>
              </Card>

              <Button variant="gold" className="w-full" onClick={handleSave}>
                {saved ? '✓ Profile Saved' : 'Save Changes'}
              </Button>
            </div>
          )}

          {tab === 'intention' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-scroll-bone-dim text-sm mb-4">Current Focus Area</label>
                <div className="grid grid-cols-2 gap-2">
                  {FOCUS_AREAS.map(area => (
                    <button key={area} onClick={() => update('currentFocus', area)}
                      className={`px-4 py-3 rounded-lg text-sm text-left transition-all ${
                        form.currentFocus === area
                          ? 'bg-scroll-gold text-scroll-black font-semibold'
                          : 'scroll-card text-scroll-bone-dim hover:border-scroll-gold/20'
                      }`}>
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-scroll-bone-dim text-sm mb-2">Current Intention</label>
                <p className="text-scroll-bone-dim/50 text-xs mb-3">What pattern are you working through right now? What do you want to embody?</p>
                <textarea
                  className="w-full bg-scroll-card border border-scroll-border rounded-lg px-4 py-3 text-scroll-bone text-sm resize-none h-36 outline-none focus:border-scroll-gold"
                  value={form.currentIntention}
                  onChange={e => update('currentIntention', e.target.value)}
                  placeholder="Name it with clarity. Your intention shapes your scroll."
                />
              </div>

              <Button variant="gold" className="w-full" onClick={handleSave}>
                {saved ? '✓ Saved' : 'Update Intention & Focus'}
              </Button>

              <p className="text-scroll-bone-dim/40 text-xs text-center">
                Updating your focus will influence your next Daily Scroll generation.
              </p>
            </div>
          )}

          {tab === 'data' && (
            <div className="space-y-5 animate-fade-in">
              <Card>
                <p className="text-scroll-bone text-sm font-medium mb-1">Export Your Data</p>
                <p className="text-scroll-bone-dim/60 text-xs mb-4">Download all your scroll data as a JSON file — your profile, readings, journals, and routines.</p>
                <Button variant="ghost" onClick={handleExport}>Export Data</Button>
              </Card>

              <Card variant="dark">
                <p className="text-scroll-bone text-sm font-medium mb-1">Cloud Sync</p>
                <p className="text-scroll-bone-dim/60 text-xs mb-1">Your Scroll is saved to the cloud. Sign in on any device to restore your data.</p>
                <p className="text-scroll-bone-dim/40 text-xs">Powered by Supabase. Data syncs automatically.</p>
              </Card>

              <Card variant="dark" className="border-red-900/30">
                <p className="text-red-400/80 text-sm font-medium mb-1">Reset All Data</p>
                <p className="text-scroll-bone-dim/60 text-xs mb-4">Permanently clears all your Scroll Alignment data. This cannot be undone.</p>
                <button
                  onClick={handleClearData}
                  className="px-4 py-2 rounded-lg border border-red-900/40 text-red-400/70 text-sm hover:border-red-400/60 hover:text-red-400 transition-colors">
                  Clear All Data
                </button>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
