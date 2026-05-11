'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { storage } from '@/lib/storage'
import { getStoredReferralCode, clearReferralCode } from '@/lib/referral'
import type { User } from '@/lib/types'

export default function UnlockPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<'reading' | 'annual' | null>(null)
  const [referralCode, setReferralCode] = useState<string | null>(null)

  useEffect(() => {
    const u = storage.getUser()
    if (!u) { router.push('/onboarding'); return }
    if (u.isPaid) { router.push('/report'); return }
    setUser(u)
    setReferralCode(getStoredReferralCode())
  }, [router])

  const handleCheckout = async (plan: 'reading' | 'annual') => {
    if (!user) return
    setLoading(plan)
    const referralCode = getStoredReferralCode()
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, userId: user.id, plan, referralCode: referralCode || undefined }),
      })
      const data = await res.json()
      if (data.url) {
        // Clear referral code — it's been applied to this checkout
        if (referralCode) clearReferralCode()
        window.location.href = data.url
      } else {
        alert('Something went wrong. Please try again.')
        setLoading(null)
      }
    } catch {
      alert('Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  if (!user) return null

  return (
    <div className="bg-scroll-black min-h-screen">
      <Header />
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-20">

        {/* Header */}
        <div className="text-center mb-14 animate-fade-in">
          <p className="text-scroll-gold/60 tracking-widest text-xs uppercase mb-3">Your Scroll is waiting</p>
          <h1 className="font-serif text-4xl mb-4">
            Choose your <span className="gold-text">alignment.</span>
          </h1>
          <p className="text-scroll-bone-dim text-base max-w-md mx-auto">
            One reading. Or a full year of daily guidance. Both built from your birth code.
          </p>
          {referralCode && (
            <div className="inline-flex items-center gap-2 mt-5 bg-scroll-gold/10 border border-scroll-gold/30 rounded-full px-5 py-2">
              <span className="text-scroll-gold text-xs">◆</span>
              <span className="text-scroll-gold text-sm font-medium">10% referral discount applied at checkout</span>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12 animate-slide-up">

          {/* $3.33 One-Time Reading */}
          <div className="scroll-card border border-scroll-border rounded-2xl p-8 flex flex-col">
            <p className="text-scroll-gold/60 text-xs tracking-wider uppercase mb-4">Full Reading</p>
            <div className="mb-6">
              <p className="font-serif text-5xl text-scroll-gold mb-1">$3.33</p>
              <p className="text-scroll-bone-dim/50 text-xs">One time · Yours permanently</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                'Complete 18-section Scroll Report',
                'Full Birth Code Breakdown',
                'Life Path Deep Analysis',
                'Business & Money Patterns',
                'Shadow Pattern Deep Dive',
                '30-Day Alignment Plan',
              ].map(f => (
                <li key={f} className="flex items-start gap-3">
                  <span className="text-scroll-gold text-xs mt-0.5 flex-shrink-0">◆</span>
                  <span className="text-scroll-bone-dim text-sm">{f}</span>
                </li>
              ))}
            </ul>
            <Button
              variant="ghost"
              className="w-full border border-scroll-gold/30 hover:border-scroll-gold"
              loading={loading === 'reading'}
              disabled={loading === 'annual'}
              onClick={() => handleCheckout('reading')}
            >
              Get My Full Reading — $3.33
            </Button>
            <p className="text-scroll-bone-dim/30 text-xs text-center mt-3">
              Apple Pay, Google Pay, or card accepted
            </p>
          </div>

          {/* $33/year Annual */}
          <div className="relative scroll-card-gold border border-scroll-gold/40 rounded-2xl p-8 flex flex-col">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-scroll-gold text-scroll-black text-xs font-bold px-4 py-1 rounded-full tracking-wide">
                MOST ALIGNED
              </span>
            </div>
            <p className="text-scroll-gold/80 text-xs tracking-wider uppercase mb-4 mt-2">Annual Access</p>
            <div className="mb-6">
              <p className="font-serif text-5xl text-scroll-gold mb-1">$33<span className="text-2xl">/yr</span></p>
              <p className="text-scroll-bone-dim/50 text-xs">$2.75/month · Cancel anytime</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                'Everything in Full Reading',
                'Daily & Weekly Scroll Check-ins',
                'All 13 Focus Areas unlocked',
                'Shadow Work & Depth Sessions',
                'Saved Scroll History',
                'Priority access to new features',
              ].map(f => (
                <li key={f} className="flex items-start gap-3">
                  <span className="text-scroll-gold text-xs mt-0.5 flex-shrink-0">◆</span>
                  <span className="text-scroll-bone text-sm">{f}</span>
                </li>
              ))}
            </ul>
            <Button
              variant="gold"
              className="w-full text-base"
              loading={loading === 'annual'}
              disabled={loading === 'reading'}
              onClick={() => handleCheckout('annual')}
            >
              Get Annual Access — $33/yr
            </Button>
            <p className="text-scroll-bone-dim/30 text-xs text-center mt-3">
              Apple Pay, Google Pay, or card accepted
            </p>
          </div>
        </div>

        {/* Testimonials */}
        <div className="space-y-4 animate-slide-up">
          <p className="text-scroll-bone-dim/50 text-xs text-center tracking-widest uppercase mb-6">What readers say</p>
          {[
            { quote: 'The business pattern section alone was worth it. I have been building from the wrong model for two years. Now I know why.', name: 'Life Path 8, Ox' },
            { quote: 'The shadow section said the thing I have been circling around for five years without being able to name it.', name: 'Life Path 7, Snake' },
            { quote: 'I read it three times. Each time something different lands. This is not content — it is a mirror.', name: 'Life Path 3, Dragon' },
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
