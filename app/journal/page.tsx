'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { storage, getTodayString, formatDate } from '@/lib/storage'
import type { DailyJournal, JournalSession, User } from '@/lib/types'

// ── Session definitions ───────────────────────────────────────────
type SessionKey = 'morning' | 'afternoon' | 'evening'

const SESSIONS: {
  key: SessionKey
  label: string
  icon: string
  timeGuide: string
  prompt: string
  placeholder: string
}[] = [
  {
    key: 'morning',
    label: 'Morning',
    icon: '◈',
    timeGuide: 'Before the day begins',
    prompt: 'What are you stepping into today with intention? What energy are you choosing — and what are you leaving at the door?',
    placeholder: 'Write freely. There is no right answer here...',
  },
  {
    key: 'afternoon',
    label: 'Afternoon',
    icon: '◉',
    timeGuide: 'Midday recalibration',
    prompt: 'Where are you in your work right now? What\'s actually moving — and what\'s stalled or avoiding your attention?',
    placeholder: 'Be honest. This is only for you...',
  },
  {
    key: 'evening',
    label: 'Evening',
    icon: '✦',
    timeGuide: 'Close of day',
    prompt: 'What was this day actually about? Where were you in alignment — and where did you drift from yourself?',
    placeholder: 'Let the day land before you name it...',
  },
]

const ENERGY_LABELS: Record<number, string> = {
  1: 'Depleted',
  2: 'Low',
  3: 'Steady',
  4: 'Energized',
  5: 'Aligned',
}

// ── Component ─────────────────────────────────────────────────────
export default function JournalPage() {
  const router = useRouter()
  const [user, setUser]           = useState<User | null>(null)
  const [today]                   = useState(getTodayString())
  const [journal, setJournal]     = useState<DailyJournal>({ date: today })
  const [activeSession, setActiveSession] = useState<SessionKey | null>(null)
  const [draft, setDraft]         = useState<{ energyRating: number; response: string }>({ energyRating: 3, response: '' })
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [view, setView]           = useState<'today' | 'history'>('today')
  const [history, setHistory]     = useState<DailyJournal[]>([])

  useEffect(() => {
    const u = storage.getUser()
    if (!u) { router.push('/onboarding'); return }
    if (!u.isPaid) { router.push('/unlock'); return }
    setUser(u)

    // Load today's journal
    const j = (storage as any).getDailyJournal(today)
    if (j) setJournal(j)

    // Load history
    const all = (storage as any).getAllDailyJournals() as DailyJournal[]
    setHistory(all.filter(j => j.date !== today))
  }, [router, today])

  const openSession = (key: SessionKey) => {
    const existing = journal[key]
    setDraft({
      energyRating: existing?.energyRating ?? 3,
      response: existing?.response ?? '',
    })
    setActiveSession(key)
    setSaved(false)
  }

  const handleSave = () => {
    if (!activeSession) return
    setSaving(true)
    const session: JournalSession = {
      energyRating: draft.energyRating,
      response: draft.response.trim(),
      completedAt: new Date().toISOString(),
    }
    const updated: DailyJournal = { ...journal, [activeSession]: session }
    setJournal(updated)
    ;(storage as any).saveDailyJournal(updated)
    setSaving(false)
    setSaved(true)
    setTimeout(() => {
      setActiveSession(null)
      setSaved(false)
    }, 1200)
  }

  const completedCount = SESSIONS.filter(s => journal[s.key]?.completedAt).length
  const sessionDef = SESSIONS.find(s => s.key === activeSession)

  return (
    <div className="bg-scroll-black min-h-screen flex">
      {user && <Sidebar isPaid={user.isPaid} />}

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 max-w-2xl mx-auto w-full px-6 pt-24 pb-20">

          {/* ── Page header ─────────────────────────────────── */}
          <div className="mb-8">
            <p className="text-scroll-gold/50 tracking-[0.3em] text-xs uppercase mb-2">Daily Journal</p>
            <h1 className="font-serif text-3xl mb-1">{formatDate(today)}</h1>
            <p className="text-scroll-bone-dim/60 text-sm">
              {completedCount === 0 && 'Begin your first session when ready.'}
              {completedCount === 1 && 'One session complete. Two remain.'}
              {completedCount === 2 && 'Two sessions complete. One remains.'}
              {completedCount === 3 && 'All three sessions complete. ✦'}
            </p>
          </div>

          {/* ── Tab nav ─────────────────────────────────────── */}
          <div className="flex gap-1 mb-8 bg-scroll-deep rounded-lg p-1">
            {(['today', 'history'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setView(tab)}
                className={`flex-1 py-2 rounded-md text-sm transition-all capitalize ${
                  view === tab
                    ? 'bg-scroll-card text-scroll-bone font-medium'
                    : 'text-scroll-bone-dim hover:text-scroll-bone'
                }`}
              >
                {tab === 'today' ? 'Today' : `History (${history.length})`}
              </button>
            ))}
          </div>

          {/* ── TODAY view ──────────────────────────────────── */}
          {view === 'today' && (
            <div className="space-y-4">
              {SESSIONS.map(session => {
                const completed = journal[session.key]
                const isActive  = activeSession === session.key

                return (
                  <div key={session.key} className={`scroll-card transition-all ${isActive ? 'border-scroll-gold/40' : ''}`}>

                    {/* Session header */}
                    <div
                      className="flex items-center justify-between p-6 cursor-pointer"
                      onClick={() => isActive ? setActiveSession(null) : openSession(session.key)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border transition-all ${
                          completed ? 'border-scroll-gold/50 bg-scroll-gold/10 text-scroll-gold' : 'border-scroll-border text-scroll-bone-dim'
                        }`}>
                          {completed ? '✓' : session.icon}
                        </div>
                        <div>
                          <p className="font-serif text-lg text-scroll-bone">{session.label}</p>
                          <p className="text-scroll-bone-dim/50 text-xs">{session.timeGuide}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {completed && (
                          <div className="flex items-center gap-1.5">
                            {[1,2,3,4,5].map(n => (
                              <div
                                key={n}
                                className={`w-1.5 h-1.5 rounded-full ${n <= completed.energyRating ? 'bg-scroll-gold' : 'bg-scroll-border'}`}
                              />
                            ))}
                          </div>
                        )}
                        <span className="text-scroll-bone-dim/40 text-xs">{isActive ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {/* Session form — expanded */}
                    {isActive && sessionDef && (
                      <div className="px-6 pb-6 border-t border-scroll-border/50 pt-6 animate-slide-up">

                        {/* Prompt */}
                        <div className="mb-6">
                          <p className="text-scroll-gold/50 text-xs tracking-widest uppercase mb-3">Prompt</p>
                          <p className="text-scroll-bone-dim leading-relaxed italic">
                            &ldquo;{sessionDef.prompt}&rdquo;
                          </p>
                        </div>

                        {/* Energy rating */}
                        <div className="mb-6">
                          <p className="text-scroll-gold/50 text-xs tracking-widest uppercase mb-3">
                            Energy Level — <span className="text-scroll-gold/80 normal-case not-italic">{ENERGY_LABELS[draft.energyRating]}</span>
                          </p>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(n => (
                              <button
                                key={n}
                                onClick={() => setDraft(d => ({ ...d, energyRating: n }))}
                                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                                  n === draft.energyRating
                                    ? 'bg-scroll-gold/20 border border-scroll-gold/50 text-scroll-gold'
                                    : 'bg-scroll-deep border border-scroll-border text-scroll-bone-dim hover:border-scroll-gold/30'
                                }`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                          <div className="flex justify-between text-scroll-bone-dim/30 text-xs mt-1.5 px-1">
                            <span>Depleted</span>
                            <span>Aligned</span>
                          </div>
                        </div>

                        {/* Free write */}
                        <div className="mb-6">
                          <p className="text-scroll-gold/50 text-xs tracking-widest uppercase mb-3">Your Response</p>
                          <textarea
                            className="w-full bg-scroll-deep border border-scroll-border rounded-lg px-4 py-3 text-scroll-bone placeholder-scroll-bone-dim/40 focus:border-scroll-gold/40 focus:outline-none transition-colors resize-none text-sm leading-relaxed"
                            rows={5}
                            placeholder={sessionDef.placeholder}
                            value={draft.response}
                            onChange={e => setDraft(d => ({ ...d, response: e.target.value }))}
                          />
                        </div>

                        {/* Save */}
                        <button
                          onClick={handleSave}
                          disabled={saving || saved}
                          className={`w-full py-3 rounded-lg text-sm font-semibold transition-all ${
                            saved
                              ? 'bg-scroll-gold/20 text-scroll-gold border border-scroll-gold/30'
                              : 'bg-gold-gradient text-scroll-black hover:opacity-90'
                          }`}
                        >
                          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Complete Session'}
                        </button>
                      </div>
                    )}

                    {/* Completed preview — collapsed */}
                    {!isActive && completed && completed.response && (
                      <div className="px-6 pb-4 border-t border-scroll-border/30 pt-4">
                        <p className="text-scroll-bone-dim/50 text-xs leading-relaxed line-clamp-2">
                          {completed.response}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── HISTORY view ────────────────────────────────── */}
          {view === 'history' && (
            <div className="space-y-4">
              {history.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-scroll-bone-dim/40 text-sm">No past entries yet.</p>
                  <p className="text-scroll-bone-dim/30 text-xs mt-2">Complete today's sessions to start building your journal.</p>
                </div>
              )}
              {history.map(entry => {
                const count = SESSIONS.filter(s => entry[s.key]?.completedAt).length
                const avgEnergy = SESSIONS.reduce((sum, s) => {
                  const session = entry[s.key]
                  return session ? sum + session.energyRating : sum
                }, 0) / (count || 1)

                return (
                  <div key={entry.date} className="scroll-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-serif text-lg text-scroll-bone">{formatDate(entry.date)}</p>
                        <p className="text-scroll-bone-dim/50 text-xs mt-0.5">
                          {count === 3 ? 'All sessions complete' : `${count} of 3 sessions`}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex gap-1.5 justify-end mb-1">
                          {SESSIONS.map(s => (
                            <div
                              key={s.key}
                              className={`w-2 h-2 rounded-full ${entry[s.key]?.completedAt ? 'bg-scroll-gold' : 'bg-scroll-border'}`}
                            />
                          ))}
                        </div>
                        {count > 0 && (
                          <p className="text-scroll-bone-dim/40 text-xs">
                            Avg energy: {avgEnergy.toFixed(1)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Session previews */}
                    <div className="space-y-3">
                      {SESSIONS.map(s => {
                        const session = entry[s.key]
                        if (!session || !session.response) return null
                        return (
                          <div key={s.key} className="border-t border-scroll-border/40 pt-3">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-scroll-gold/40 text-xs">{s.icon}</span>
                              <p className="text-scroll-gold/60 text-xs tracking-widest uppercase">{s.label}</p>
                              <div className="flex gap-0.5 ml-auto">
                                {[1,2,3,4,5].map(n => (
                                  <div key={n} className={`w-1 h-1 rounded-full ${n <= session.energyRating ? 'bg-scroll-gold/60' : 'bg-scroll-border'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-scroll-bone-dim/60 text-xs leading-relaxed line-clamp-2">
                              {session.response}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
