'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { storage } from '@/lib/storage'
import { generateScrollSnapshot } from '@/lib/scrollEngine'
import { getLifePathLabel } from '@/lib/numerology'
import type { User, ScrollSnapshot } from '@/lib/types'

export default function SnapshotPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [snapshot, setSnapshot] = useState<ScrollSnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const u = storage.getUser()
    if (!u) { router.push('/onboarding'); return }
    setUser(u)
    let snap = storage.getSnapshot()
    if (!snap) {
      snap = generateScrollSnapshot(u)
      storage.saveSnapshot(snap)
    }
    setSnapshot(snap)
    setLoading(false)
  }, [router])

  if (loading || !user || !snapshot) {
    return (
      <div className="bg-scroll-black min-h-screen flex items-center justify-center">
        <div className="text-center animate-pulse">
          <p className="font-serif text-scroll-gold text-xl mb-2">Preparing your Scroll.</p>
          <p className="text-scroll-bone-dim text-sm">Gathering what is already there.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-scroll-black min-h-screen">
      <Header isPaid={user.isPaid} />
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-20">

        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <p className="text-scroll-gold/60 tracking-widest text-xs uppercase mb-3">Free Scroll Snapshot</p>
          <h1 className="font-serif text-4xl mb-2">{user.firstName}'s Scroll</h1>
          <p className="text-scroll-bone-dim">Your birth code, decoded. Your current season, reflected.</p>
        </div>

        {/* Birth Code Row */}
        <div className="grid grid-cols-2 gap-3 mb-6 animate-slide-up">
          <Card variant="gold">
            <p className="text-scroll-gold/60 text-xs tracking-wider uppercase mb-1">Life Path</p>
            <p className="font-serif text-2xl text-scroll-gold">{snapshot.lifePathNumber}</p>
            <p className="text-scroll-bone-dim text-xs mt-1">{getLifePathLabel(snapshot.lifePathNumber).split('—')[1]?.trim()}</p>
          </Card>
          <Card variant="gold">
            <p className="text-scroll-gold/60 text-xs tracking-wider uppercase mb-1">Chinese Zodiac</p>
            <p className="font-serif text-2xl text-scroll-gold">{snapshot.chineseZodiac}</p>
            <p className="text-scroll-bone-dim text-xs mt-1">{user.chineseElement} Element</p>
          </Card>
        </div>

        {/* Core Archetype */}
        <Card variant="dark" className="mb-6 border-scroll-purple/20 animate-slide-up">
          <p className="text-scroll-gold/60 text-xs tracking-wider uppercase mb-2">Core Archetype</p>
          <p className="font-serif text-xl text-scroll-bone mb-3">{snapshot.coreArchetype}</p>
        </Card>

        {/* Strength & Shadow */}
        <div className="grid md:grid-cols-2 gap-4 mb-6 animate-slide-up">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-scroll-gold text-sm">◆</span>
              <p className="text-scroll-gold/60 text-xs tracking-wider uppercase">Primary Strength</p>
            </div>
            <p className="text-scroll-bone-dim text-sm leading-relaxed">{snapshot.strength}</p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-scroll-bone-dim text-sm">◇</span>
              <p className="text-scroll-bone-dim/60 text-xs tracking-wider uppercase">Shadow to Watch</p>
            </div>
            <p className="text-scroll-bone-dim text-sm leading-relaxed">{snapshot.shadow}</p>
          </Card>
        </div>

        {/* Focus Message */}
        <Card variant="gold" className="mb-6 animate-slide-up">
          <p className="text-scroll-gold/60 text-xs tracking-wider uppercase mb-3">
            Current Focus: {user.currentFocus}
          </p>
          <p className="text-scroll-bone leading-relaxed">{snapshot.focusMessage}</p>
        </Card>

        {/* Affirmation */}
        <Card variant="dark" className="mb-6 text-center animate-slide-up">
          <p className="text-scroll-gold/60 text-xs tracking-wider uppercase mb-3">Your Affirmation</p>
          <p className="font-serif text-lg text-scroll-bone italic">"{snapshot.affirmation}"</p>
        </Card>

        {/* Action Step */}
        <Card className="mb-10 animate-slide-up">
          <p className="text-scroll-gold/60 text-xs tracking-wider uppercase mb-3">Today's Action Step</p>
          <p className="text-scroll-bone-dim leading-relaxed">{snapshot.actionStep}</p>
        </Card>

        {/* ── LOCKED SECTION ── */}
        <div className="relative animate-slide-up">
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-scroll-black/80 backdrop-blur-sm rounded-xl border border-scroll-gold/20 p-8 text-center">
            <p className="text-scroll-gold text-2xl mb-2">✦</p>
            <h2 className="font-serif text-2xl mb-2 text-scroll-gold">Your Full Scroll is waiting.</h2>
            <p className="text-scroll-bone-dim text-sm mb-1">
              18 sections built from your birth code and current season.
            </p>
            <p className="text-scroll-gold/60 text-xs mb-6">Starting at <span className="text-scroll-gold font-semibold">$3.33</span></p>
            <Link href="/unlock">
              <Button variant="gold" size="lg">See Plans</Button>
            </Link>
            <p className="text-scroll-bone-dim/40 text-xs mt-3">Apple Pay · Card · $3.33 or $33/yr</p>
          </div>

          {/* Blurred preview */}
          <div className="locked-blur space-y-3 p-6 border border-scroll-border rounded-xl">
            {[
              'Full Birth Code Breakdown', 'Business Pattern Analysis',
              'Relationship Pattern', 'Shadow Pattern Deep Dive',
              'Money & Abundance Pattern', 'Body & Discipline Pattern',
              '30-Day Alignment Plan', 'Daily Scroll Access',
            ].map(item => (
              <div key={item} className="flex items-center gap-3 py-2 border-b border-scroll-border">
                <span className="text-scroll-gold">◆</span>
                <span className="text-scroll-bone-dim text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
