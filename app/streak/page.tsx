'use client'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { storage, formatDateShort } from '@/lib/storage'
import type { User } from '@/lib/types'

interface DayData {
  date: string
  score: number
  aligned: boolean
  label: string   // short date label
  dayOfWeek: number
}

function getDateString(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function computeAllDays(days = 90): DayData[] {
  return Array.from({ length: days }, (_, i) => {
    const date = getDateString(days - 1 - i)
    const scroll   = storage.getDailyScroll(date)
    const routine  = storage.getRoutine(date)
    const journals = storage.getJournalEntries()
    const hasJournal   = journals.some(j => j.date === date)
    const morningDone  = !!routine?.morningCompleted
    const eveningDone  = !!routine?.eveningCompleted
    const mainDone     = (scroll?.completionScore ?? 0) >= 50
    const score = [morningDone, mainDone, hasJournal, eveningDone].filter(Boolean).length * 25
    const d = new Date(date + 'T12:00:00')
    return {
      date,
      score,
      aligned: score >= 25,
      label: formatDateShort(date),
      dayOfWeek: d.getDay(),
    }
  })
}

function computeCurrentStreak(data: DayData[]): number {
  let streak = 0
  for (let i = data.length - 2; i >= 0; i--) {
    if (data[i].aligned) streak++
    else break
  }
  if (data[data.length - 1]?.aligned) streak++
  return streak
}

function computeLongestStreak(data: DayData[]): number {
  let longest = 0, current = 0
  for (const d of data) {
    if (d.aligned) { current++; longest = Math.max(longest, current) }
    else current = 0
  }
  return longest
}

function computeAllStreaks(data: DayData[]): number[] {
  const streaks: number[] = []
  let current = 0
  for (const d of data) {
    if (d.aligned) current++
    else { if (current > 0) streaks.push(current); current = 0 }
  }
  if (current > 0) streaks.push(current)
  return streaks.sort((a, b) => b - a)
}

export default function StreakPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const u = storage.getUser()
    if (!u) { router.push('/onboarding'); return }
    if (!u.isPaid) { router.push('/unlock'); return }
    setUser(u)
    setLoading(false)
  }, [router])

  const data   = useMemo(() => computeAllDays(90), [])
  const today  = getDateString(0)

  const currentStreak = useMemo(() => computeCurrentStreak(data), [data])
  const longestStreak = useMemo(() => computeLongestStreak(data), [data])
  const totalAligned  = useMemo(() => data.filter(d => d.aligned).length, [data])
  const allStreaks     = useMemo(() => computeAllStreaks(data), [data])
  const avgScore      = useMemo(() => {
    const days = data.filter(d => d.score > 0)
    if (!days.length) return 0
    return Math.round(days.reduce((s, d) => s + d.score, 0) / days.length)
  }, [data])

  // Group into weeks for calendar grid
  const weeks = useMemo(() => {
    const result: DayData[][] = []
    let week: DayData[] = []
    // Pad beginning so first day starts on correct weekday
    const firstDay = data[0]
    for (let p = 0; p < firstDay.dayOfWeek; p++) {
      week.push({ date: '', score: 0, aligned: false, label: '', dayOfWeek: p })
    }
    for (const day of data) {
      week.push(day)
      if (week.length === 7) { result.push(week); week = [] }
    }
    if (week.length) {
      while (week.length < 7) week.push({ date: '', score: 0, aligned: false, label: '', dayOfWeek: week.length })
      result.push(week)
    }
    return result
  }, [data])

  if (loading || !user) return (
    <div className="bg-scroll-black min-h-screen flex items-center justify-center">
      <p className="font-serif text-scroll-gold animate-pulse">Loading your momentum...</p>
    </div>
  )

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="bg-scroll-black min-h-screen flex">
      <Sidebar isPaid />
      <div className="flex-1">
        <Header isPaid />
        <main className="max-w-4xl mx-auto px-6 py-10">

          {/* Header */}
          <div className="mb-10 animate-fade-in">
            <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-2">Your Momentum</p>
            <h1 className="font-serif text-4xl mb-2">Alignment Streak</h1>
            <p className="text-scroll-bone-dim text-sm">90-day view of your daily alignment practice</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
            {[
              { value: currentStreak, label: 'Current Streak', unit: 'days', highlight: true },
              { value: longestStreak, label: 'Longest Streak', unit: 'days', highlight: false },
              { value: totalAligned,  label: 'Days Aligned',   unit: `/ 90`, highlight: false },
              { value: avgScore,      label: 'Avg Daily Score', unit: '%',  highlight: false },
            ].map(stat => (
              <div
                key={stat.label}
                className={`p-5 rounded-xl text-center ${stat.highlight ? 'scroll-card-gold' : 'scroll-card'}`}
              >
                <p className={`font-serif text-4xl ${stat.highlight ? 'text-scroll-gold' : 'text-scroll-bone'}`}>
                  {stat.value}
                  <span className="text-lg ml-0.5">{stat.unit}</span>
                </p>
                <p className="text-scroll-bone-dim/60 text-xs mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Streak flame message */}
          {currentStreak >= 7 && (
            <div className="scroll-card-gold p-4 mb-6 flex items-center gap-3 animate-fade-in">
              <span className="text-2xl">✦</span>
              <div>
                <p className="text-scroll-gold font-semibold text-sm">
                  {currentStreak >= 30 ? 'Legendary.' : currentStreak >= 14 ? 'You\'re locked in.' : 'Strong momentum.'}
                </p>
                <p className="text-scroll-bone-dim text-xs">
                  {currentStreak} consecutive days of alignment. Keep the thread unbroken.
                </p>
              </div>
            </div>
          )}

          {/* Calendar heatmap */}
          <div className="scroll-card p-6 mb-6 animate-slide-up">
            <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-4">90-Day Calendar</p>

            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAY_LABELS.map(d => (
                <div key={d} className="text-center text-scroll-bone-dim/40 text-[9px] uppercase">{d}</div>
              ))}
            </div>

            {/* Weeks */}
            <div className="space-y-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1">
                  {week.map((day, di) => {
                    if (!day.date) return <div key={di} className="aspect-square" />
                    const isToday = day.date === today
                    const bgClass =
                      day.score === 100 ? 'bg-scroll-gold opacity-100' :
                      day.score >= 75   ? 'bg-scroll-gold opacity-75'  :
                      day.score >= 50   ? 'bg-scroll-gold opacity-50'  :
                      day.score >= 25   ? 'bg-scroll-gold opacity-30'  :
                      'bg-scroll-border opacity-60'

                    return (
                      <div key={day.date} className="relative group aspect-square">
                        <div
                          className={`w-full h-full rounded-sm transition-all ${bgClass} ${
                            isToday ? 'ring-1 ring-scroll-gold ring-offset-1 ring-offset-scroll-card' : ''
                          }`}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-scroll-charcoal border border-scroll-border rounded text-[9px] text-scroll-bone whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {day.label} · {day.score}%
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-scroll-border">
              <p className="text-scroll-bone-dim/40 text-[9px] uppercase tracking-wider">Score</p>
              {[
                { label: '0',    cls: 'bg-scroll-border opacity-60' },
                { label: '25%',  cls: 'bg-scroll-gold opacity-30' },
                { label: '50%',  cls: 'bg-scroll-gold opacity-50' },
                { label: '75%',  cls: 'bg-scroll-gold opacity-75' },
                { label: '100%', cls: 'bg-scroll-gold opacity-100' },
              ].map(({ label, cls }) => (
                <div key={label} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded-sm ${cls}`} />
                  <span className="text-scroll-bone-dim/40 text-[9px]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Streak history */}
          {allStreaks.length > 0 && (
            <div className="scroll-card p-6 mb-10 animate-slide-up">
              <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-4">Streak History</p>
              <div className="space-y-2">
                {allStreaks.slice(0, 5).map((streak, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-scroll-bone-dim/40 text-xs w-4">{i + 1}</span>
                    <div className="flex-1 h-2 bg-scroll-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-scroll-gold rounded-full transition-all"
                        style={{ width: `${Math.min(100, (streak / longestStreak) * 100)}%`,
                                 opacity: i === 0 ? 1 : 0.6 - i * 0.1 }}
                      />
                    </div>
                    <span className={`text-xs font-medium w-16 text-right ${i === 0 ? 'text-scroll-gold' : 'text-scroll-bone-dim'}`}>
                      {streak} {streak === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
