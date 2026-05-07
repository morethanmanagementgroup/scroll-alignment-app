'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// ── Life path calculation ─────────────────────────────────────────
function calcLifePath(dateStr: string): number {
  const digits = dateStr.replace(/-/g, '').split('').map(Number)
  let sum = digits.reduce((a, b) => a + b, 0)
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split('').map(Number).reduce((a, b) => a + b, 0)
  }
  return sum
}

// ── Chinese zodiac ────────────────────────────────────────────────
const ZODIAC_CYCLE = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig']
const ELEMENTS = ['Wood','Fire','Earth','Metal','Water']
function calcZodiac(year: number): { animal: string; element: string } {
  const animal = ZODIAC_CYCLE[((year - 1900) % 12 + 12) % 12]
  const stem   = ((year - 1900) % 10 + 10) % 10
  const element = ELEMENTS[Math.floor(stem / 2) % 5]
  return { animal, element }
}

// ── Archetype data ────────────────────────────────────────────────
const ARCHETYPES: Record<number, { name: string; title: string; strength: string; shadow: string }> = {
  1:  { name: 'The Pioneer',       title: 'Original Force',                    strength: 'Original vision — you see what is possible before others realize it is missing.',                                                     shadow: 'Waiting for permission from rooms that were never meant to give it.' },
  2:  { name: 'The Diplomat',      title: 'Sacred Bridge',                     strength: 'Emotional intelligence — you read rooms, people, and dynamics with rare precision.',                                                    shadow: 'Making yourself invisible to preserve other people\'s comfort.' },
  3:  { name: 'The Creator',       title: 'Living Expression',                 strength: 'Making the invisible visible — through words, ideas, and creative expression.',                                                         shadow: 'Perfectionism that functions as procrastination.' },
  4:  { name: 'The Builder',       title: 'Foundation Keeper',                 strength: 'Unmatched capacity for disciplined, consistent execution — you build what others only imagine.',                                        shadow: 'Holding the original plan past its usefulness.' },
  5:  { name: 'The Explorer',      title: 'Freedom Current',                   strength: 'Adaptive intelligence — you pivot, read conditions, and find opportunity where others see disruption.',                                 shadow: 'Beginning more than completing, using movement to avoid depth.' },
  6:  { name: 'The Nurturer',      title: 'Sacred Keeper',                     strength: 'Holding others with both love and clarity — care that builds environments where people thrive.',                                        shadow: 'Giving past your own capacity until devotion becomes depletion.' },
  7:  { name: 'The Seeker',        title: 'Inner Oracle',                      strength: 'Rare depth of insight — synthesizing complex information into truth others cannot reach at the surface.',                              shadow: 'The withdrawal reflex — using depth as protection from being seen.' },
  8:  { name: 'The Authority',     title: 'Power in Form',                     strength: 'Strategic authority — understanding how power moves and directing it toward lasting impact.',                                           shadow: 'The confusion of worth with achievement.' },
  9:  { name: 'The Humanitarian',  title: 'Sage of the Age',                   strength: 'The capacity to hold human complexity without being destroyed by it — compassion as a strategic instrument.',                          shadow: 'Loving humanity while struggling with the particular work of specific relationships.' },
  11: { name: 'The Illuminator',   title: 'Master of Light ✦',                 strength: 'Master intuition — receiving and transmitting insight that operates beyond the analytical level.',                                     shadow: 'Absorbing collective energy as personal burden without the grounding infrastructure to process it.' },
  22: { name: 'The Master Builder',title: 'Architecture of the Possible ✦',   strength: 'Large-scale architectural vision combined with the discipline to actually build it — the rarest combination in the room.',             shadow: 'Using the size of the vision as a reason to delay beginning, disguised as preparation.' },
  33: { name: 'The Master Teacher',title: 'Embodied Wisdom ✦',                 strength: 'Transforming others through presence and lived example rather than mere instruction.',                                                  shadow: 'Self-sacrifice disguised as spiritual attainment.' },
}

type Stage = 'form' | 'result'

export default function PreviewWidget() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('form')
  const [name, setName]   = useState('')
  const [date, setDate]   = useState('')
  const [result, setResult] = useState<{
    lifePathNumber: number
    archetype: { name: string; title: string; strength: string; shadow: string }
    zodiac: { animal: string; element: string }
    firstName: string
  } | null>(null)

  const canReveal = name.trim().length > 0 && date.length === 10

  const reveal = () => {
    if (!canReveal) return
    const lp      = calcLifePath(date)
    const year    = parseInt(date.split('-')[0])
    const zodiac  = calcZodiac(year)
    const arch    = ARCHETYPES[lp] ?? ARCHETYPES[1]
    setResult({ lifePathNumber: lp, archetype: arch, zodiac, firstName: name.trim().split(' ')[0] })
    setStage('result')
  }

  const handleCTA = () => {
    router.push('/onboarding')
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {stage === 'form' && (
        <div className="scroll-card p-8 md:p-10">
          <p className="text-scroll-gold/70 text-xs tracking-[0.3em] uppercase mb-6 text-center">
            Read your codes — free
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-scroll-bone-dim/60 uppercase tracking-widest mb-2">
                First Name
              </label>
              <input
                className="w-full bg-scroll-deep border border-scroll-border rounded-lg px-4 py-3 text-scroll-bone placeholder-scroll-bone-dim/40 focus:border-scroll-gold/50 focus:outline-none transition-colors"
                placeholder="Your first name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-scroll-bone-dim/60 uppercase tracking-widest mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                className="w-full bg-scroll-deep border border-scroll-border rounded-lg px-4 py-3 text-scroll-bone focus:border-scroll-gold/50 focus:outline-none transition-colors"
                value={date}
                onChange={e => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <button
              onClick={reveal}
              disabled={!canReveal}
              className={`w-full py-4 rounded-lg font-semibold text-sm transition-all mt-2 ${
                canReveal
                  ? 'bg-gold-gradient text-scroll-black gold-glow hover:opacity-90'
                  : 'bg-scroll-border text-scroll-bone-dim/40 cursor-not-allowed'
              }`}
            >
              Reveal My Codes →
            </button>
          </div>
          <p className="text-scroll-bone-dim/30 text-xs text-center mt-4">
            No account required · Instant · Free
          </p>
        </div>
      )}

      {stage === 'result' && result && (
        <div className="scroll-card-gold p-8 md:p-10 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b border-scroll-gold/20">
            <p className="text-scroll-gold/60 text-xs tracking-[0.3em] uppercase mb-3">
              {result.firstName}'s Scroll Codes
            </p>
            <p className="font-serif text-2xl text-scroll-bone mb-1">
              Life Path {result.lifePathNumber} · {result.archetype.name}
            </p>
            <p className="text-scroll-gold/70 text-sm tracking-wider">
              {result.zodiac.element} {result.zodiac.animal}
            </p>
          </div>

          {/* Archetype */}
          <div className="mb-6">
            <p className="text-scroll-gold/50 text-xs tracking-widest uppercase mb-2">Your Archetype</p>
            <p className="text-scroll-bone font-serif text-lg leading-snug">
              {result.archetype.title}
            </p>
          </div>

          {/* Strength — full */}
          <div className="mb-6">
            <p className="text-scroll-gold/50 text-xs tracking-widest uppercase mb-2">Primary Strength</p>
            <p className="text-scroll-bone-dim text-sm leading-relaxed">
              {result.archetype.strength}
            </p>
          </div>

          {/* Shadow — teaser only */}
          <div className="mb-8 relative">
            <p className="text-scroll-gold/50 text-xs tracking-widest uppercase mb-2">Primary Shadow</p>
            <div className="relative overflow-hidden">
              <p className="text-scroll-bone-dim text-sm leading-relaxed blur-[3px] select-none">
                {result.archetype.shadow}
              </p>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-scroll-gold/60 text-xs tracking-widest uppercase bg-scroll-black/80 px-3 py-1 rounded-full">
                  Unlocked in full Scroll
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleCTA}
            className="w-full bg-gold-gradient text-scroll-black font-bold py-4 rounded-lg text-sm gold-glow hover:opacity-90 transition-opacity"
          >
            Build My Full Scroll →
          </button>
          <p className="text-scroll-bone-dim/40 text-xs text-center mt-3">
            Free snapshot · Unlock full reading for $33
          </p>

          {/* Reset */}
          <button
            onClick={() => { setStage('form'); setResult(null) }}
            className="block mx-auto mt-4 text-scroll-bone-dim/30 text-xs hover:text-scroll-bone-dim/60 transition-colors"
          >
            Try a different date
          </button>
        </div>
      )}
    </div>
  )
}
