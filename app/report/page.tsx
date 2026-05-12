'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Card from '@/components/ui/Card'
import { storage, formatDate, getTodayString } from '@/lib/storage'
import { generateFullReport } from '@/lib/scrollEngine'
import { getLifePathLabel } from '@/lib/numerology'
import { saveToCloud, getCloudUserId } from '@/lib/supabaseSync'
import type { User, FullScrollReport } from '@/lib/types'

// ── Cinematic loading stages ──────────────────────────────────
const LOADING_STAGES = [
  { message: 'Reading your birth code…',        sub: 'Life path · Chinese zodiac · Personal year' },
  { message: 'Mapping your life path…',          sub: `Calculating your core frequency` },
  { message: 'Cross-referencing your season…',  sub: 'Personal year against current focus' },
  { message: 'Decoding your archetype…',         sub: 'The pattern your numbers reveal' },
  { message: 'Writing your shadow work…',        sub: 'The patterns that cost you the most' },
  { message: 'Building your 30-day plan…',       sub: 'Four weeks. Four movements.' },
  { message: 'Finalizing your scroll…',          sub: 'Almost there' },
]

// ── Loading screen ────────────────────────────────────────────
function GeneratingScreen({ stage }: { stage: number }) {
  const current = LOADING_STAGES[Math.min(stage, LOADING_STAGES.length - 1)]
  return (
    <div className="bg-scroll-black min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        {/* Orb animation */}
        <div className="relative w-20 h-20 mx-auto mb-10">
          <div className="absolute inset-0 rounded-full bg-scroll-gold/10 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-scroll-gold/20 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-scroll-gold/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-scroll-gold text-2xl">✦</span>
          </div>
        </div>

        {/* Stage message */}
        <p className="font-serif text-scroll-gold text-2xl mb-2 transition-all duration-500">
          {current.message}
        </p>
        <p className="text-scroll-bone-dim/50 text-sm mb-10">{current.sub}</p>

        {/* Stage dots */}
        <div className="flex justify-center gap-2">
          {LOADING_STAGES.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i <= stage
                  ? 'w-2 h-2 bg-scroll-gold'
                  : 'w-1.5 h-1.5 bg-scroll-border'
              }`}
            />
          ))}
        </div>

        <p className="text-scroll-bone-dim/30 text-xs mt-8">
          Your reading is being written for you. This takes about 20 seconds.
        </p>
      </div>
    </div>
  )
}

// ── Error screen ──────────────────────────────────────────────
function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-scroll-black min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="font-serif text-scroll-gold text-2xl mb-3">Generation failed.</p>
        <p className="text-scroll-bone-dim text-sm mb-6 leading-relaxed">
          Something went wrong building your scroll. This is usually a temporary issue.
          Your payment is safe — click below to try again.
        </p>
        <button
          onClick={onRetry}
          className="bg-gold-gradient text-scroll-black font-semibold px-8 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
        >
          Retry Generation →
        </button>
      </div>
    </div>
  )
}

// ── Main report page ──────────────────────────────────────────
export default function ReportPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [report, setReport] = useState<FullScrollReport | null>(null)
  const [status, setStatus] = useState<'loading' | 'generating' | 'ready' | 'error'>('loading')
  const [stage, setStage] = useState(0)

  const generateWithAI = async (u: User) => {
    setStatus('generating')
    setStage(0)

    // Advance loading stages while waiting
    const interval = setInterval(() => {
      setStage(prev => Math.min(prev + 1, LOADING_STAGES.length - 1))
    }, 2800)

    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: u }),
      })

      clearInterval(interval)

      if (!res.ok) {
        console.error('[report] generation failed', await res.text())
        // Fall back to template
        const fallback = generateFullReport(u)
        storage.saveFullReport(fallback)
        setReport(fallback)
        setStatus('ready')
        return
      }

      const { report: aiReport } = await res.json()
      storage.saveFullReport(aiReport)
      setReport(aiReport)

      // Sync to cloud
      const cloudId = await getCloudUserId()
      if (cloudId) saveToCloud(cloudId).catch(() => {})

      setStatus('ready')
    } catch (err) {
      clearInterval(interval)
      console.error('[report] fetch error', err)
      // Fall back to template silently
      const fallback = generateFullReport(u)
      storage.saveFullReport(fallback)
      setReport(fallback)
      setStatus('ready')
    }
  }

  const init = async () => {
    setStatus('loading')
    const u = storage.getUser()
    if (!u) { router.push('/onboarding'); return }
    if (!u.isPaid) { router.push('/unlock'); return }
    setUser(u)

    const existing = storage.getFullReport()
    if (existing) {
      setReport(existing)
      setStatus('ready')
      return
    }

    // No report yet — generate with AI
    await generateWithAI(u)
  }

  useEffect(() => { init() }, [router])

  if (status === 'loading') return (
    <div className="bg-scroll-black min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-scroll-gold/40 text-sm">Loading…</div>
    </div>
  )

  if (status === 'generating') return <GeneratingScreen stage={stage} />
  if (status === 'error') return <ErrorScreen onRetry={() => user && generateWithAI(user)} />
  if (!user || !report) return null

  return (
    <div className="bg-scroll-black min-h-screen flex">
      <Sidebar isPaid />
      <div className="flex-1">
        <Header isPaid />
        <main className="max-w-3xl mx-auto px-6 py-10">

          {/* Cover */}
          <div className="text-center mb-16 py-14 border-b border-scroll-border animate-fade-in relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-96 h-96 rounded-full bg-scroll-gold/5 blur-3xl" />
            </div>
            <p className="text-scroll-gold/50 tracking-[0.4em] text-xs uppercase mb-5 relative z-10">
              Full Scroll Alignment Reading
            </p>
            <h1 className="font-serif text-5xl md:text-6xl mb-3 gold-text relative z-10">
              {user.firstName}&apos;s Scroll
            </h1>
            <p className="text-scroll-bone-dim text-sm relative z-10">{formatDate(getTodayString())}</p>
            <p className="text-scroll-gold/30 text-xs mt-4 tracking-wider relative z-10">
              {report.birthCodeSummary}
            </p>

            {/* Regenerate button */}
            <button
              onClick={() => user && generateWithAI(user)}
              className="mt-6 text-scroll-bone-dim/30 hover:text-scroll-bone-dim/60 text-xs underline transition-colors relative z-10"
            >
              ↺ Regenerate with AI
            </button>
          </div>

          {/* Report sections */}
          <div className="space-y-10 animate-slide-up">

            <Section title="Opening Message">
              <p className="font-serif text-xl text-scroll-bone leading-relaxed italic">
                {report.openingMessage}
              </p>
            </Section>

            <Section title={`Life Path ${user.lifePathNumber} — ${getLifePathLabel(user.lifePathNumber).split('—')[1]?.trim() ?? ''}`}>
              <p className="text-scroll-bone-dim leading-relaxed whitespace-pre-line">
                {report.lifePathBreakdown}
              </p>
            </Section>

            <Section title={`${user.chineseZodiac} · ${user.chineseElement} Energy`}>
              <p className="text-scroll-bone-dim leading-relaxed">
                {report.chineseZodiacBreakdown}
              </p>
            </Section>

            <Section title="Core Archetype">
              <div className="scroll-card-gold p-7 text-center">
                <p className="font-serif text-2xl text-scroll-gold leading-snug">
                  {report.coreArchetype}
                </p>
              </div>
            </Section>

            {[
              { title: 'Strength Pattern',              content: report.strengthPattern },
              { title: 'Shadow Pattern',                content: report.shadowPattern },
              { title: 'Business & Execution Pattern',  content: report.businessPattern },
              { title: 'Money & Abundance Pattern',     content: report.moneyPattern },
              { title: 'Relationship Pattern',          content: report.relationshipPattern },
              { title: 'Body & Discipline Pattern',     content: report.bodyDisciplinePattern },
              { title: 'Spiritual Assignment',          content: report.spiritualAssignment },
              { title: 'Current Season',                content: report.currentSeason },
            ].map(s => (
              <Section key={s.title} title={s.title}>
                <p className="text-scroll-bone-dim leading-relaxed whitespace-pre-line">{s.content}</p>
              </Section>
            ))}

            <Section title="Recommended Colors">
              <div className="flex flex-wrap gap-3">
                {report.recommendedColors.map(c => (
                  <span key={c} className="px-4 py-2 scroll-card border border-scroll-gold/20 text-scroll-gold text-sm rounded-full">
                    {c}
                  </span>
                ))}
              </div>
            </Section>

            <Section title="Recommended Frequency">
              <p className="text-scroll-bone-dim">{report.recommendedFrequency}</p>
            </Section>

            <Section title="Personalized Morning Routine">
              <ol className="space-y-3">
                {report.morningRoutine.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-scroll-gold text-sm mt-0.5 flex-shrink-0 w-5">{i + 1}.</span>
                    <span className="text-scroll-bone-dim text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ol>
            </Section>

            <Section title="Personalized Evening Routine">
              <ol className="space-y-3">
                {report.eveningRoutine.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-scroll-gold text-sm mt-0.5 flex-shrink-0 w-5">{i + 1}.</span>
                    <span className="text-scroll-bone-dim text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ol>
            </Section>

            <Section title="30-Day Alignment Plan">
              <div className="space-y-4">
                {report.thirtyDayPlan.map(entry => (
                  <div key={entry.week} className="scroll-card p-6 border-l-2 border-scroll-gold/30">
                    <p className="text-scroll-gold text-xs uppercase tracking-widest mb-2">
                      Week {entry.week}
                    </p>
                    <p className="font-serif text-xl mb-2 text-scroll-bone">{entry.theme}</p>
                    <p className="text-scroll-bone-dim text-sm leading-relaxed mb-2">{entry.focus}</p>
                    <p className="text-scroll-bone-dim/50 text-xs italic">{entry.practice}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Closing */}
            <div className="text-center py-16 border-t border-scroll-border">
              <p className="text-scroll-gold/30 text-xs tracking-widest uppercase mb-6">
                Closing Affirmation
              </p>
              <p className="font-serif text-2xl text-scroll-gold italic leading-relaxed max-w-lg mx-auto">
                &ldquo;{report.closingAffirmation}&rdquo;
              </p>
              <p className="text-scroll-bone-dim/30 text-xs mt-8">
                This is your scroll, as it reads today. Return to it when you forget.
              </p>
              <p className="text-scroll-gold/20 text-xs mt-2">— Scroll Alignment</p>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-scroll-border pb-10">
      <p className="text-scroll-gold/50 text-xs tracking-[0.25em] uppercase mb-5">{title}</p>
      {children}
    </div>
  )
}
