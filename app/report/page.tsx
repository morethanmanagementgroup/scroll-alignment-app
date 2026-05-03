'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Card from '@/components/ui/Card'
import { storage, formatDate } from '@/lib/storage'
import { generateFullReport } from '@/lib/scrollEngine'
import { getLifePathLabel } from '@/lib/numerology'
import type { User, FullScrollReport } from '@/lib/types'

export default function ReportPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [report, setReport] = useState<FullScrollReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const u = storage.getUser()
    if (!u) { router.push('/onboarding'); return }
    if (!u.isPaid) { router.push('/unlock'); return }
    setUser(u)
    let r = storage.getFullReport()
    if (!r) { r = generateFullReport(u); storage.saveFullReport(r) }
    setReport(r)
    setLoading(false)
  }, [router])

  if (loading || !user || !report) return <LoadingScreen />

  return (
    <div className="bg-scroll-black min-h-screen flex">
      <Sidebar isPaid />
      <div className="flex-1">
        <Header isPaid />
        <main className="max-w-3xl mx-auto px-6 py-10">
          {/* Cover */}
          <div className="text-center mb-12 py-12 border-b border-scroll-border animate-fade-in">
            <p className="text-scroll-gold/60 tracking-widest text-xs uppercase mb-4">Full Scroll Alignment</p>
            <h1 className="font-serif text-5xl mb-2 gold-text">{user.firstName}'s Scroll</h1>
            <p className="text-scroll-bone-dim">{formatDate(new Date().toISOString().split('T')[0])}</p>
            <p className="text-scroll-gold/40 text-xs mt-4 tracking-widest">{report.birthCodeSummary}</p>
          </div>

          <div className="space-y-8 animate-slide-up">
            <Section title="Opening Scroll Message">
              <p className="font-serif text-lg text-scroll-bone leading-relaxed italic">{report.openingMessage}</p>
            </Section>

            <Section title="Birth Code Summary">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {report.birthCodeSummary.split(' · ').map(item => (
                  <div key={item} className="scroll-card p-3 text-center">
                    <p className="text-scroll-gold text-xs">{item}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title={`Life Path ${user.lifePathNumber} — ${getLifePathLabel(user.lifePathNumber).split('—')[1]?.trim()}`}>
              <p className="text-scroll-bone-dim leading-relaxed whitespace-pre-line">{report.lifePathBreakdown}</p>
            </Section>

            <Section title={`${user.chineseZodiac} — ${user.chineseElement} Energy`}>
              <p className="text-scroll-bone-dim leading-relaxed">{report.chineseZodiacBreakdown}</p>
            </Section>

            <Section title="Core Archetype">
              <div className="scroll-card-gold p-6">
                <p className="font-serif text-xl text-scroll-gold mb-3">{report.coreArchetype}</p>
              </div>
            </Section>

            {[
              { title: 'Strength Pattern', content: report.strengthPattern },
              { title: 'Shadow Pattern', content: report.shadowPattern },
              { title: 'Business & Execution Pattern', content: report.businessPattern },
              { title: 'Money & Abundance Pattern', content: report.moneyPattern },
              { title: 'Relationship Pattern', content: report.relationshipPattern },
              { title: 'Body & Discipline Pattern', content: report.bodyDisciplinePattern },
              { title: 'Spiritual Assignment', content: report.spiritualAssignment },
              { title: 'Current Season of Growth', content: report.currentSeason },
            ].map(s => (
              <Section key={s.title} title={s.title}>
                <p className="text-scroll-bone-dim leading-relaxed">{s.content}</p>
              </Section>
            ))}

            <Section title="Recommended Colors">
              <div className="flex flex-wrap gap-3">
                {report.recommendedColors.map(c => (
                  <span key={c} className="px-4 py-2 scroll-card border-scroll-gold/20 text-scroll-gold text-sm rounded-full">{c}</span>
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
                    <span className="text-scroll-gold text-sm mt-0.5 flex-shrink-0">{i + 1}.</span>
                    <span className="text-scroll-bone-dim text-sm">{item}</span>
                  </li>
                ))}
              </ol>
            </Section>

            <Section title="Personalized Evening Routine">
              <ol className="space-y-3">
                {report.eveningRoutine.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-scroll-gold text-sm mt-0.5 flex-shrink-0">{i + 1}.</span>
                    <span className="text-scroll-bone-dim text-sm">{item}</span>
                  </li>
                ))}
              </ol>
            </Section>

            <Section title="30-Day Alignment Plan">
              <div className="space-y-4">
                {report.thirtyDayPlan.map(entry => (
                  <div key={entry.week} className="scroll-card p-5">
                    <p className="text-scroll-gold text-xs uppercase tracking-wider mb-1">Week {entry.week}</p>
                    <p className="font-serif text-lg mb-2">{entry.theme}</p>
                    <p className="text-scroll-bone-dim text-sm mb-2">{entry.focus}</p>
                    <p className="text-scroll-bone-dim/60 text-xs italic">{entry.practice}</p>
                  </div>
                ))}
              </div>
            </Section>

            <div className="text-center py-12 border-t border-scroll-border">
              <p className="font-serif text-xl text-scroll-gold italic mb-2">
                "{report.closingAffirmation}"
              </p>
              <p className="text-scroll-bone-dim/40 text-xs mt-6">
                This is your scroll, as it reads today. Return to it when you forget.
              </p>
              <p className="text-scroll-gold/30 text-xs mt-2">— Scroll</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-scroll-border pb-8">
      <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-4">{title}</p>
      {children}
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="bg-scroll-black min-h-screen flex items-center justify-center">
      <div className="text-center animate-pulse">
        <p className="font-serif text-scroll-gold text-2xl mb-3">Generating your Full Scroll.</p>
        <p className="text-scroll-bone-dim">This takes just a moment.</p>
      </div>
    </div>
  )
}
