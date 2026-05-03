'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { storage, getTodayString, generateId, formatDate } from '@/lib/storage'
import type { JournalEntry } from '@/lib/types'

const MOODS = ['Aligned', 'Focused', 'Reflective', 'Heavy', 'Uncertain', 'Expansive', 'Tired', 'Grateful', 'Tense', 'Clear']

export default function JournalPage() {
  const router = useRouter()
  const [isPaid, setIsPaid] = useState(false)
  const [today] = useState(getTodayString())
  const [entry, setEntry] = useState<Partial<JournalEntry>>({
    date: getTodayString(), mood: '', energyLevel: 5,
    learned: '', avoided: '', grateful: '', tomorrowIntention: '', freeWrite: '',
  })
  const [pastEntries, setPastEntries] = useState<JournalEntry[]>([])
  const [saved, setSaved] = useState(false)
  const [view, setView] = useState<'write' | 'history'>('write')

  useEffect(() => {
    const u = storage.getUser()
    if (!u) { router.push('/onboarding'); return }
    if (!u.isPaid) { router.push('/unlock'); return }
    setIsPaid(true)
    const entries = storage.getJournalEntries()
    setPastEntries(entries)
    const existing = entries.find(e => e.date === today)
    if (existing) setEntry(existing)
  }, [router, today])

  const update = (k: string, v: string | number) => setEntry(e => ({ ...e, [k]: v }))

  const handleSave = () => {
    const u = storage.getUser()
    if (!u) return
    const full: JournalEntry = {
      id: (entry as JournalEntry).id ?? generateId(),
      userId: u.id,
      date: today,
      mood: entry.mood ?? '',
      energyLevel: entry.energyLevel ?? 5,
      learned: entry.learned ?? '',
      avoided: entry.avoided ?? '',
      grateful: entry.grateful ?? '',
      tomorrowIntention: entry.tomorrowIntention ?? '',
      freeWrite: entry.freeWrite ?? '',
      createdAt: new Date().toISOString(),
    }
    storage.saveJournalEntry(full)
    setPastEntries(storage.getJournalEntries())
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!isPaid) return null

  return (
    <div className="bg-scroll-black min-h-screen flex">
      <Sidebar isPaid />
      <div className="flex-1">
        <Header isPaid />
        <main className="max-w-3xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-1">Daily Journal</p>
              <h1 className="font-serif text-3xl">{formatDate(today)}</h1>
            </div>
            <div className="flex gap-2">
              <Button variant={view === 'write' ? 'gold' : 'ghost'} size="sm" onClick={() => setView('write')}>Write</Button>
              <Button variant={view === 'history' ? 'gold' : 'ghost'} size="sm" onClick={() => setView('history')}>History</Button>
            </div>
          </div>

          {view === 'write' ? (
            <div className="space-y-6 animate-fade-in">
              {/* Mood */}
              <div>
                <p className="text-scroll-bone-dim text-sm mb-3">How are you feeling today?</p>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map(m => (
                    <button key={m} onClick={() => update('mood', m)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        entry.mood === m ? 'bg-scroll-gold text-scroll-black' : 'scroll-card text-scroll-bone-dim hover:border-scroll-gold/30'
                      }`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy */}
              <div>
                <p className="text-scroll-bone-dim text-sm mb-2">Energy level: <span className="text-scroll-gold">{entry.energyLevel}/10</span></p>
                <input type="range" min="1" max="10" value={entry.energyLevel}
                  onChange={e => update('energyLevel', Number(e.target.value))}
                  className="w-full accent-scroll-gold" />
              </div>

              {[
                { key: 'learned',           label: 'What did I learn today?',           placeholder: 'One insight, one lesson, one realization...' },
                { key: 'avoided',           label: 'What did I avoid today?',            placeholder: 'Be honest. The avoided thing is usually where the work is.' },
                { key: 'grateful',          label: 'What am I grateful for?',            placeholder: 'Name it specifically. Gratitude is most useful when it is particular.' },
                { key: 'tomorrowIntention', label: "What is tomorrow's intention?",      placeholder: 'One sentence. Clear. Actionable.' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-scroll-bone-dim text-sm mb-2">{field.label}</label>
                  <textarea
                    className="w-full bg-scroll-card border border-scroll-border rounded-lg px-4 py-3 text-scroll-bone text-sm resize-none h-24 outline-none focus:border-scroll-gold"
                    placeholder={field.placeholder}
                    value={(entry as Record<string, string>)[field.key] ?? ''}
                    onChange={e => update(field.key, e.target.value)}
                  />
                </div>
              ))}

              <div>
                <label className="block text-scroll-bone-dim text-sm mb-2">Free write — no prompts, no agenda.</label>
                <textarea
                  className="w-full bg-scroll-card border border-scroll-border rounded-lg px-4 py-3 text-scroll-bone text-sm resize-none h-48 outline-none focus:border-scroll-gold"
                  placeholder="Whatever needs to be said. This space is yours."
                  value={entry.freeWrite ?? ''}
                  onChange={e => update('freeWrite', e.target.value)}
                />
              </div>

              <Button variant="gold" className="w-full" onClick={handleSave}>
                {saved ? '✓ Saved' : 'Save Entry'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {pastEntries.length === 0 ? (
                <p className="text-center text-scroll-bone-dim py-12">No journal entries yet. Your first entry will appear here.</p>
              ) : pastEntries.map(e => (
                <Card key={e.id} onClick={() => { setEntry(e); setView('write') }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-scroll-bone text-sm font-medium">{formatDate(e.date)}</p>
                    <div className="flex items-center gap-3">
                      {e.mood && <span className="text-scroll-gold/60 text-xs">{e.mood}</span>}
                      <span className="text-scroll-bone-dim/40 text-xs">Energy: {e.energyLevel}/10</span>
                    </div>
                  </div>
                  {e.learned && <p className="text-scroll-bone-dim text-xs line-clamp-2">{e.learned}</p>}
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
