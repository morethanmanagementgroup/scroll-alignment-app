'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { storage, getTodayString } from '@/lib/storage'
import { DAY_THEMES, MONTHLY_THEMES } from '@/lib/templates'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function CalendarPage() {
  const router = useRouter()
  const [isPaid, setIsPaid] = useState(false)
  const today = getTodayString()
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  useEffect(() => {
    const u = storage.getUser()
    if (!u) { router.push('/onboarding'); return }
    if (!u.isPaid) { router.push('/unlock'); return }
    setIsPaid(true)
  }, [router])

  if (!isPaid) return null

  const { year, month } = currentMonth
  const monthTheme = MONTHLY_THEMES[month + 1]
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const journals = storage.getJournalEntries()
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' })

  const getDayData = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayOfWeek = new Date(dateStr + 'T12:00:00').getDay()
    const dayTheme = DAY_THEMES[dayOfWeek]
    const journalEntry = journals.find(j => j.date === dateStr)
    const routine = storage.getRoutine(dateStr)
    const dailyScroll = storage.getDailyScroll(dateStr)

    let score = 0
    if (routine?.morningCompleted) score += 25
    if (routine?.eveningCompleted) score += 25
    if (journalEntry) score += 25
    if ((dailyScroll?.completionScore ?? 0) >= 50) score += 25

    return { dateStr, dayTheme, journalEntry, routine, score }
  }

  return (
    <div className="bg-scroll-black min-h-screen flex">
      <Sidebar isPaid />
      <div className="flex-1">
        <Header isPaid />
        <main className="max-w-4xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-1">Calendar</p>
              <h1 className="font-serif text-3xl">{monthName} {year}</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCurrentMonth(m => {
                const d = new Date(m.year, m.month - 1)
                return { year: d.getFullYear(), month: d.getMonth() }
              })} className="scroll-card px-4 py-2 text-scroll-bone-dim hover:text-scroll-bone text-sm">←</button>
              <button onClick={() => setCurrentMonth(m => {
                const d = new Date(m.year, m.month + 1)
                return { year: d.getFullYear(), month: d.getMonth() }
              })} className="scroll-card px-4 py-2 text-scroll-bone-dim hover:text-scroll-bone text-sm">→</button>
            </div>
          </div>

          {/* Month Theme */}
          <div className="scroll-card-gold px-6 py-4 mb-6 text-sm">
            <span className="text-scroll-gold font-medium">{monthTheme.theme}</span>
            <span className="text-scroll-bone-dim ml-3">{monthTheme.message}</span>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-scroll-bone-dim/40 text-xs py-2">{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const { dateStr, dayTheme, journalEntry, routine, score } = getDayData(day)
              const isToday = dateStr === today
              const isFuture = dateStr > today

              return (
                <button
                  key={day}
                  onClick={() => !isFuture && router.push('/dashboard')}
                  className={`aspect-square p-2 rounded-lg text-left transition-all flex flex-col ${
                    isToday ? 'scroll-card-gold gold-glow' : 'scroll-card hover:border-scroll-gold/20'
                  } ${isFuture ? 'opacity-30 cursor-default' : 'cursor-pointer'}`}
                >
                  <span className={`text-sm font-medium ${isToday ? 'text-scroll-gold' : 'text-scroll-bone-dim'}`}>{day}</span>
                  {!isFuture && (
                    <div className="mt-auto flex gap-0.5 flex-wrap">
                      {score > 0 && (
                        <div className="h-1 bg-scroll-gold rounded-full" style={{ width: `${score}%`, maxWidth: '100%' }} title={`${score}% aligned`} />
                      )}
                    </div>
                  )}
                  {!isFuture && (
                    <div className="flex gap-0.5 mt-1">
                      {journalEntry && <span className="text-scroll-gold/60 text-xs" title="Journal">✦</span>}
                      {routine?.morningCompleted && <span className="text-scroll-bone-dim/60 text-xs" title="Morning">○</span>}
                      {routine?.eveningCompleted && <span className="text-scroll-bone-dim/60 text-xs" title="Evening">●</span>}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-6 mt-6 text-xs text-scroll-bone-dim/50">
            <span><span className="text-scroll-gold mr-1">✦</span>Journal</span>
            <span><span className="mr-1">○</span>Morning routine</span>
            <span><span className="mr-1">●</span>Evening routine</span>
            <span>Gold bar = alignment score</span>
          </div>
        </main>
      </div>
    </div>
  )
}
