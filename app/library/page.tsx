'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Card from '@/components/ui/Card'
import { storage, formatDate, formatDateShort } from '@/lib/storage'
import type { DailyScroll, JournalEntry } from '@/lib/types'

export default function LibraryPage() {
  const router = useRouter()
  const [isPaid, setIsPaid] = useState(false)
  const [tab, setTab] = useState<'scrolls' | 'journals' | 'report'>('scrolls')
  const [scrolls, setScrolls] = useState<DailyScroll[]>([])
  const [journals, setJournals] = useState<JournalEntry[]>([])

  useEffect(() => {
    const u = storage.getUser()
    if (!u) { router.push('/onboarding'); return }
    if (!u.isPaid) { router.push('/unlock'); return }
    setIsPaid(true)

    // Gather all saved scrolls
    const rawScrolls = localStorage.getItem('sa_daily_scrolls')
    if (rawScrolls) {
      const parsed: Record<string, DailyScroll> = JSON.parse(rawScrolls)
      setScrolls(Object.values(parsed).sort((a, b) => b.date.localeCompare(a.date)))
    }
    setJournals(storage.getJournalEntries())
  }, [router])

  if (!isPaid) return null

  return (
    <div className="bg-scroll-black min-h-screen flex">
      <Sidebar isPaid />
      <div className="flex-1">
        <Header isPaid />
        <main className="max-w-3xl mx-auto px-6 py-10">
          <div className="mb-8">
            <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-1">Library</p>
            <h1 className="font-serif text-3xl">Your Archive</h1>
          </div>

          <div className="flex gap-2 mb-8">
            {[
              { key: 'scrolls',  label: 'Daily Scrolls' },
              { key: 'journals', label: 'Journal Entries' },
              { key: 'report',   label: 'Full Report' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
                className={`px-5 py-2 rounded-lg text-sm transition-all ${
                  tab === t.key ? 'bg-scroll-gold text-scroll-black font-semibold' : 'scroll-card text-scroll-bone-dim'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'scrolls' && (
            <div className="space-y-4 animate-fade-in">
              {scrolls.length === 0 ? (
                <p className="text-center text-scroll-bone-dim py-12">Your daily scrolls will appear here as they are generated.</p>
              ) : scrolls.map(s => (
                <Card key={s.date}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-scroll-bone text-sm font-medium">{formatDate(s.date)}</p>
                      <p className="text-scroll-bone-dim/50 text-xs mt-0.5">{s.theme}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-scroll-gold text-sm">{s.completionScore}%</p>
                      <p className="text-scroll-bone-dim/40 text-xs">aligned</p>
                    </div>
                  </div>
                  <p className="text-scroll-bone-dim text-xs italic">"{s.affirmation}"</p>
                </Card>
              ))}
            </div>
          )}

          {tab === 'journals' && (
            <div className="space-y-4 animate-fade-in">
              {journals.length === 0 ? (
                <p className="text-center text-scroll-bone-dim py-12">Your journal entries will appear here.</p>
              ) : journals.map(j => (
                <Card key={j.id}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-scroll-bone text-sm">{formatDate(j.date)}</p>
                    <div className="flex items-center gap-3 text-xs text-scroll-bone-dim/50">
                      {j.mood && <span>{j.mood}</span>}
                      <span>Energy: {j.energyLevel}/10</span>
                    </div>
                  </div>
                  {j.learned && (
                    <p className="text-scroll-bone-dim text-xs line-clamp-2">{j.learned}</p>
                  )}
                  {j.tomorrowIntention && (
                    <p className="text-scroll-gold/60 text-xs mt-2 italic">Tomorrow: {j.tomorrowIntention}</p>
                  )}
                </Card>
              ))}
            </div>
          )}

          {tab === 'report' && (
            <div className="animate-fade-in">
              <Card variant="gold" className="text-center p-10">
                <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-4">Full Scroll Alignment</p>
                <p className="font-serif text-xl mb-4">Your complete report is permanently saved.</p>
                <Link href="/report"
                  className="inline-block bg-gold-gradient text-scroll-black px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                  View Full Report
                </Link>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
