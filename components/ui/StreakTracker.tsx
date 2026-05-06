'use client'
import { useMemo } from 'react'
import { storage } from '@/lib/storage'

interface StreakData {
  date: string
  score: number
  aligned: boolean
}

function getDateString(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function computeStreakData(days = 30): StreakData[] {
  return Array.from({ length: days }, (_, i) => {
    const date = getDateString(days - 1 - i)
    const scroll = storage.getDailyScroll(date)
    const routine = storage.getRoutine(date)
    const journals = storage.getJournalEntries()
    const hasJournal = journals.some(j => j.date === date)
    const morningDone = !!routine?.morningCompleted
    const eveningDone = !!routine?.eveningCompleted
    const mainDone = (scroll?.completionScore ?? 0) >= 50
    const score = [morningDone, mainDone, hasJournal, eveningDone].filter(Boolean).length * 25
    return { date, score, aligned: score >= 25 }
  })
}

function computeCurrentStreak(data: StreakData[]): number {
  let streak = 0
  // Walk backwards from yesterday (index data.length-2) so today (incomplete) doesn't break streak
  for (let i = data.length - 2; i >= 0; i--) {
    if (data[i].aligned) streak++
    else break
  }
  // Also count today if aligned
  if (data[data.length - 1]?.aligned) streak++
  return streak
}

function computeLongestStreak(data: StreakData[]): number {
  let longest = 0
  let current = 0
  for (const d of data) {
    if (d.aligned) { current++; longest = Math.max(longest, current) }
    else current = 0
  }
  return longest
}

export default function StreakTracker() {
  const data = useMemo(() => computeStreakData(30), [])
  const currentStreak = useMemo(() => computeCurrentStreak(data), [data])
  const longestStreak = useMemo(() => computeLongestStreak(data), [data])
  const totalAligned  = useMemo(() => data.filter(d => d.aligned).length, [data])

  const today = getDateString(0)
  const todayData = data[data.length - 1]

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className="scroll-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-scroll-gold/60 text-xs tracking-widest uppercase">Alignment Streak</p>
          <p className="text-scroll-bone-dim text-xs mt-0.5">Last 30 days</p>
        </div>
        <div className="flex gap-4 text-center">
          <div>
            <p className="font-serif text-2xl text-scroll-gold">{currentStreak}</p>
            <p className="text-scroll-bone-dim/60 text-[10px] uppercase tracking-wider">Current</p>
          </div>
          <div className="w-px bg-scroll-border" />
          <div>
            <p className="font-serif text-2xl text-scroll-bone">{longestStreak}</p>
            <p className="text-scroll-bone-dim/60 text-[10px] uppercase tracking-wider">Best</p>
          </div>
          <div className="w-px bg-scroll-border" />
          <div>
            <p className="font-serif text-2xl text-scroll-bone">{totalAligned}</p>
            <p className="text-scroll-bone-dim/60 text-[10px] uppercase tracking-wider">Total</p>
          </div>
        </div>
      </div>

      {/* Dot grid — 6 weeks × 5 rows roughly */}
      <div className="flex flex-wrap gap-1.5">
        {data.map((day, i) => {
          const isToday = day.date === today
          const opacity =
            day.score === 100 ? 'opacity-100' :
            day.score >= 75   ? 'opacity-75'  :
            day.score >= 50   ? 'opacity-50'  :
            day.score >= 25   ? 'opacity-30'  : 'opacity-0'

          return (
            <div key={day.date} className="relative group">
              <div
                className={`w-5 h-5 rounded-sm transition-all ${
                  isToday
                    ? 'ring-1 ring-scroll-gold ring-offset-1 ring-offset-scroll-card'
                    : ''
                } ${
                  day.aligned
                    ? `bg-scroll-gold ${opacity}`
                    : 'bg-scroll-border'
                }`}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-scroll-charcoal border border-scroll-border rounded text-[10px] text-scroll-bone whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {day.date} · {day.score}%
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-scroll-border">
        <p className="text-scroll-bone-dim/40 text-[10px] uppercase tracking-wider">Score</p>
        <div className="flex items-center gap-1.5">
          {[
            { label: '0%',   cls: 'bg-scroll-border' },
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
        {currentStreak >= 3 && (
          <div className="ml-auto flex items-center gap-1">
            <span className="text-scroll-gold text-xs">✦</span>
            <span className="text-scroll-gold text-[10px]">{currentStreak}-day streak</span>
          </div>
        )}
      </div>
    </div>
  )
}
