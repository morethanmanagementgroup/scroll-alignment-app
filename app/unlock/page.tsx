'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { storage } from '@/lib/storage'
import type { User } from '@/lib/types'

// ─────────────────────────────────────────────────────────────
// PAYMENT PLACEHOLDER
// Replace PAYMENT_LINK with your Stripe, Gumroad, or Stan Store URL.
// To manually mark as paid: see /admin page.
// ─────────────────────────────────────────────────────────────
const PAYMENT_LINK = '#payment-placeholder'

const INCLUDED = [
  'Opening Scroll Message', 'Full Birth Code Breakdown', 'Life Path Deep Breakdown',
  'Chinese Zodiac Breakdown', 'Core Archetype Profile', 'Strength Pattern Analysis',
  'Shadow Pattern Analysis', 'Business & Execution Pattern', 'Money & Abundance Pattern',
  'Relationship Pattern', 'Body & Discipline Pattern', 'Spiritual Assignment',
  'Current Season of Growth', 'Recommended Colors & Frequencies',
  'Personalized Morning Routine', 'Personalized Evening Routine',
  '30-Day Alignment Plan', 'Daily Scroll Access',
]

export default function UnlockPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const u = storage.getUser()
    if (!u) { router.push('/onboarding'); return }
    if (u.isPaid) { router.push('/dashboard'); return }
    setUser(u)
  }, [router])

  const handlePayment = () => {
    // Replace with actual payment link
    if (PAYMENT_LINK === '#payment-placeholder') {
      alert('Payment link not yet configured. Go to the admin page to manually mark as paid, or update PAYMENT_LINK in app/unlock/page.tsx.')
      return
    }
    window.location.href = PAYMENT_LINK
  }

  if (!user) return null

  return (
    <div className="bg-scroll-black min-h-screen">
      <Header />
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-20">

        <div className="text-center mb-12 animate-fade-in">
          <p className="text-scroll-gold/60 tracking-widest text-xs uppercase mb-3">Full Scroll Alignment</p>
          <h1 className="font-serif text-5xl mb-4">
            <span className="gold-text">One reading.<br />One life path. $33.</span>
          </h1>
          <p className="text-scroll-bone-dim text-lg max-w-xl mx-auto">
            A complete, personalized Scroll Alignment — built from your birth code, your current season,
            and your stated intention — plus daily access to keep you calibrated.
          </p>
        </div>

        {/* Included Features */}
        <div className="scroll-card-gold p-8 mb-8 animate-slide-up">
          <h2 className="font-serif text-xl mb-6 text-center">Everything included in your Full Scroll</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {INCLUDED.map(item => (
              <div key={item} className="flex items-center gap-3">
                <span className="text-scroll-gold text-sm flex-shrink-0">◆</span>
                <span className="text-scroll-bone-dim text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <Card variant="dark" className="mb-8 text-center border-scroll-gold/20 animate-slide-up">
          <p className="text-scroll-bone-dim text-sm mb-2">Complete Scroll Alignment Report</p>
          <p className="font-serif text-6xl text-scroll-gold mb-2">$33</p>
          <p className="text-scroll-bone-dim/50 text-xs">One-time · Yours permanently · No subscription</p>
        </Card>

        {/* CTA */}
        <div className="text-center animate-slide-up">
          <Button variant="gold" size="lg" className="w-full max-w-sm mx-auto text-xl py-5" onClick={handlePayment}>
            Unlock My Full Scroll — $33
          </Button>
          <p className="text-scroll-bone-dim/40 text-xs mt-4">
            After payment, return here and enter your access code, or ask the admin to mark your account as paid.
          </p>
        </div>

        {/* Manual access code field */}
        <div className="mt-10 p-6 border border-scroll-border rounded-xl">
          <p className="text-scroll-bone-dim text-sm mb-4 text-center">Already paid? Enter your access code:</p>
          <AccessCodeField user={user} onUnlock={() => router.push('/report')} />
        </div>

        {/* What readers say */}
        <div className="mt-12 space-y-4">
          <h3 className="font-serif text-lg text-center mb-6">What readers say</h3>
          {[
            { quote: 'I have read it three times. Each time something different lands. This is not content — it is a mirror.', name: 'Life Path 3, Dragon' },
            { quote: 'The business pattern section alone was worth it. I have been building from the wrong model for two years. Now I know why.', name: 'Life Path 8, Ox' },
            { quote: 'The shadow section said the thing I have been circling around for five years without being able to name it.', name: 'Life Path 7, Snake' },
          ].map(t => (
            <Card key={t.name} variant="dark" className="border-scroll-border/50">
              <p className="text-scroll-bone-dim italic text-sm leading-relaxed mb-3">"{t.quote}"</p>
              <p className="text-scroll-gold/50 text-xs">— {t.name}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function AccessCodeField({ user, onUnlock }: { user: User; onUnlock: () => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  // Simple admin-set access code stored in localStorage
  const handleSubmit = () => {
    const adminCode = localStorage.getItem('sa_access_code') ?? 'SCROLL33'
    if (code.trim().toUpperCase() === adminCode.toUpperCase()) {
      const updated = { ...user, isPaid: true }
      storage.saveUser(updated)
      onUnlock()
    } else {
      setError('Access code not recognized. Contact support.')
    }
  }

  return (
    <div className="flex gap-3">
      <input
        className="flex-1 bg-scroll-card border border-scroll-border rounded-lg px-4 py-3 text-scroll-bone text-sm outline-none focus:border-scroll-gold"
        placeholder="Enter access code..."
        value={code}
        onChange={e => { setCode(e.target.value); setError('') }}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
      />
      <Button variant="ghost" onClick={handleSubmit}>Unlock</Button>
      {error && <p className="text-red-400 text-xs mt-2 absolute">{error}</p>}
    </div>
  )
}
