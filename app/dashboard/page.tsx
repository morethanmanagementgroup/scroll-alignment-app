'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { storage, getTodayString, formatDate } from '@/lib/storage'
import { generateDailyScroll } from '@/lib/scrollEngine'
import type { User, DailyScroll } from '@/lib/types'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [scroll, setScroll] = useState<DailyScroll | null>(null)
  const [completions, setCompletions] = useState({ morning: false, main: false, journal: false, evening: false })
  const [loading, setLoading] = useState(true)

  const today = getTodayString()

  useEffect(() => {
    const u = storage.getUser()
    if (!u) { router.push('/onboarding'); return }
    if (!u.isPaid) { router.push('/unlock'); return }
    setUser(u)

    let ds = storage.getDailyScroll(today)
    if (!ds) {
      const adminTheme = storage.getAdminThemeForDate(today)
      ds = generateDailyScroll(u, today, adminTheme, adminTheme ? 'admin-curated' : 'template')
      storage.saveDailyScroll(ds)
    }
    setScroll(ds)
    setCompletions({
      morning: !!storage.getRoutine(today)?.morningCompleted,
      main:    (ds.completionScore ?? 0) >= 50,
      journal: !!storage.getJournalEntries().find(j => j.date === today),
      evening: !!storage.getRoutine(today)?.eveningCompleted,
    })
    setLoading(false)
  }, [router, today])

  const score = [completions.morning, completions.main, completions.journal, completions.evening]
    .filter(Boolean).length * 25

  if (loading || !user || !scroll) return <LoadingDashboard />

  return (
    <div className="bg-scroll-black min-h-screen flex">
      <Sidebar isPaid />
      <div className="flex-1">
        <Header isPaid />
        <main className="max-w-4xl mx-auto px-6 py-10">

          {/* Date & Score */}
          <div className="flex items-start justify-between mb-8 animate-fade-in">
            <div>
              <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-1">Daily Scroll</p>
              <h1 className="font-serif text-3xl">{formatDate(today)}</h1>
              <p className="text-scroll-bone-dim text-sm mt-1">{scroll.theme}</p>
              {scroll.generationMode === 'admin-curated' && (
                <span className="inline-block mt-2 text-xs text-scroll-gold/50 border border-scroll-gold/20 px-2 py-0.5 rounded">
                  ✦ Admin-Curated
                </span>
              )}
            </div>
            <div className="text-center scroll-card-gold px-6 py-4">
              <p className="font-serif text-3xl text-scroll-gold">{score}</p>
              <p className="text-scroll-bone-dim/60 text-xs">Alignment Score</p>
              <div className="mt-2 flex gap-1 justify-center">
                {[completions.morning, completions.main, completions.journal, completions.evening].map((c, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${c ? 'bg-scroll-gold' : 'bg-scroll-border'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Energy */}
          <div className="scroll-card-gold p-6 mb-6 animate-slide-up">
            <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-2">Today's Energy</p>
            <p className="text-scroll-bone leading-relaxed">{scroll.energy}</p>
          </div>

          {/* Main Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-6 animate-slide-up">
            <ScrollBlock label="Spiritual Assignment" content={scroll.spiritualAssignment} icon="◉" />
            <ScrollBlock label="Business Assignment"  content={scroll.businessAssignment}  icon="◆" />
            <ScrollBlock label="Body Assignment"      content={scroll.bodyAssignment}       icon="○" />
            <ScrollBlock label="Emotional Check-In"   content={scroll.emotionalCheckIn}     icon="◇" />
          </div>

          {/* Shadow & Power Move */}
          <div className="grid md:grid-cols-2 gap-4 mb-6 animate-slide-up">
            <Card variant="dark" className="border-red-900/20">
              <p className="text-red-400/60 text-xs tracking-widest uppercase mb-2">Shadow to Watch</p>
              <p className="text-scroll-bone-dim text-sm leading-relaxed">{scroll.shadowToWatch}</p>
            </Card>
            <Card variant="dark" className="border-scroll-gold/20">
              <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-2">Power Move</p>
              <p className="text-scroll-bone text-sm leading-relaxed font-medium">{scroll.powerMove}</p>
            </Card>
          </div>

          {/* Affirmation */}
          <div className="scroll-card text-center p-8 mb-6 animate-slide-up">
            <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-3">Today's Affirmation</p>
            <p className="font-serif text-xl text-scroll-bone italic">"{scroll.affirmation}"</p>
          </div>

          {/* Frequency & Action Window */}
          <div className="grid md:grid-cols-2 gap-4 mb-6 animate-slide-up">
            <Card>
              <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-2">Frequency</p>
              <p className="text-scroll-bone-dim text-sm">{scroll.frequency}</p>
            </Card>
            <Card>
              <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-2">Recommended Action Window</p>
              <p className="text-scroll-bone-dim text-sm">{scroll.actionWindow}</p>
            </Card>
          </div>

          {/* Journal Prompt */}
          <Card variant="gold" className="mb-6 animate-slide-up">
            <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-3">Journal Prompt</p>
            <p className="text-scroll-bone leading-relaxed mb-4">"{scroll.journalPrompt}"</p>
            <Button variant="ghost" size="sm" onClick={() => router.push('/journal')}>Open Journal →</Button>
          </Card>

          {/* Evening Reflection */}
          <Card className="mb-10 animate-slide-up">
            <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-2">Evening Reflection</p>
            <p className="text-scroll-bone-dim text-sm leading-relaxed">{scroll.eveningReflection}</p>
          </Card>

          {/* Completion Checklist */}
          <div className="scroll-card p-6 animate-slide-up">
            <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-4">Today's Completion</p>
            <div className="space-y-3">
              {[
                { key: 'morning', label: 'Morning Routine', link: '/routine' },
                { key: 'main',    label: 'Main Action Completed', link: null },
                { key: 'journal', label: 'Journal Entry', link: '/journal' },
                { key: 'evening', label: 'Evening Reflection', link: '/routine' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (item.key === 'main') {
                          setCompletions(c => ({ ...c, main: !c.main }))
                        }
                      }}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        completions[item.key as keyof typeof completions]
                          ? 'bg-scroll-gold border-scroll-gold text-scroll-black'
                          : 'border-scroll-border'
                      }`}
                    >
                      {completions[item.key as keyof typeof completions] && '✓'}
                    </button>
                    <span className="text-scroll-bone-dim text-sm">{item.label}</span>
                  </div>
                  {item.link && (
                    <button onClick={() => router.push(item.link!)}
                      className="text-scroll-gold/60 text-xs hover:text-scroll-gold">→</button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}

function ScrollBlock({ label, content, icon }: { label: string; content: string; icon: string }) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-scroll-gold">{icon}</span>
        <p className="text-scroll-gold/60 text-xs tracking-widest uppercase">{label}</p>
      </div>
      <p className="text-scroll-bone-dim text-sm leading-relaxed">{content}</p>
    </Card>
  )
}

function LoadingDashboard() {
  return (
    <div className="bg-scroll-black min-h-screen flex items-center justify-center">
      <div className="text-center animate-pulse">
        <p className="font-serif text-scroll-gold text-xl">Preparing your daily scroll.</p>
        <p className="text-scroll-bone-dim text-sm mt-2">A moment of stillness.</p>
      </div>
    </div>
  )
}
