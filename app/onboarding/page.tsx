'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import { storage, generateId } from '@/lib/storage'
import { enrichUserProfile } from '@/lib/scrollEngine'
import { supabase } from '@/lib/supabase'
import { saveToCloud } from '@/lib/supabaseSync'
import type { User, FocusArea } from '@/lib/types'

const FOCUS_OPTIONS: FocusArea[] = [
  'Purpose', 'Business', 'Love', 'Healing', 'Discipline',
  'Fitness', 'Money', 'Creativity', 'Spiritual Growth',
  'Shadow Work', 'Leadership', 'Family', 'Career Transition',
]

const STEPS = ['About You', 'Birth Details', 'Your Season']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [form, setForm] = useState({
    firstName: '', email: '', password: '',
    birthDate: '', birthTime: '',
    birthCity: '', birthRegion: '', birthCountry: 'United States',
    currentFocus: 'Purpose' as FocusArea,
    currentIntention: '',
  })

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleNext = async () => {
    if (step === 0 && form.firstName && form.email) {
      captureLeadEmail(form.firstName, form.email)
    }
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else handleSubmit()
  }

  const captureLeadEmail = async (firstName: string, email: string) => {
    try {
      await fetch('/api/capture-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName, email,
          source: 'Scroll Alignment Onboarding',
          step: 'Email Captured — Not Yet Paid',
          timestamp: new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.href : '',
        }),
      })
    } catch {}
  }

  const handleSubmit = async () => {
    setLoading(true)
    setAuthError('')

    const { lifePathNumber, chineseZodiac, chineseElement } = enrichUserProfile({ birthDate: form.birthDate })

    // Try to create Supabase auth account
    let supabaseUserId: string | null = null

    if (form.password.length >= 6) {
      // Attempt sign up
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { firstName: form.firstName } },
      })

      if (signUpErr) {
        // Email already in use — try signing in instead
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })

        if (signInErr) {
          // Wrong password for existing account
          setAuthError('An account with this email already exists. Please use a different email or go to Sign In.')
          setLoading(false)
          return
        }
        supabaseUserId = signInData.user?.id ?? null
      } else {
        supabaseUserId = signUpData.user?.id ?? null
      }
    }

    const user: User = {
      id: supabaseUserId ?? generateId(),
      firstName: form.firstName,
      email: form.email,
      birthDate: form.birthDate,
      birthTime: form.birthTime || undefined,
      birthCity: form.birthCity,
      birthRegion: form.birthRegion,
      birthCountry: form.birthCountry,
      currentFocus: form.currentFocus,
      currentIntention: form.currentIntention,
      lifePathNumber,
      chineseZodiac,
      chineseElement,
      isPaid: false,
      plan: 'free' as const,
      createdAt: new Date().toISOString(),
    }

    // Check for a pending payment (from success page before account existed)
    let finalUser = user
    const pendingRaw = localStorage.getItem('scroll_pending_payment')
    if (pendingRaw) {
      try {
        const pending = JSON.parse(pendingRaw)
        finalUser = { ...user, isPaid: true, plan: pending.plan || 'reading', stripeSessionId: pending.sessionId }
        localStorage.removeItem('scroll_pending_payment')
      } catch { /* ignore */ }
    }

    storage.saveUser(finalUser)

    // Background sync to Supabase (non-blocking)
    if (supabaseUserId) {
      saveToCloud(supabaseUserId).catch(() => {})
    }

    router.push(finalUser.isPaid ? '/report' : '/snapshot')
  }

  const canNext = [
    form.firstName && form.email && form.password.length >= 6,
    form.birthDate && form.birthCity && form.birthRegion,
    form.currentFocus && form.currentIntention.length > 3,
  ][step]

  return (
    <div className="bg-scroll-black min-h-screen">
      <Header />
      <div className="max-w-xl mx-auto px-6 pt-28 pb-20">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border transition-all ${
                i <= step ? 'bg-scroll-gold border-scroll-gold text-scroll-black font-bold' : 'border-scroll-border text-scroll-bone-dim'
              }`}>{i + 1}</div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-8 ${i < step ? 'bg-scroll-gold' : 'bg-scroll-border'}`} />
              )}
            </div>
          ))}
          <span className="ml-3 text-scroll-bone-dim text-sm">{STEPS[step]}</span>
        </div>

        <div className="animate-slide-up">
          {step === 0 && (
            <div className="space-y-6">
              <div className="mb-8">
                <h1 className="font-serif text-3xl mb-2">Begin your Scroll.</h1>
                <p className="text-scroll-bone-dim">Answer carefully. There is no right version of you to present here.</p>
              </div>
              <Field label="First Name" required>
                <input className="scroll-input" placeholder="Your first name" value={form.firstName}
                  onChange={e => update('firstName', e.target.value)} />
              </Field>
              <Field label="Email Address" required>
                <input type="email" className="scroll-input" placeholder="you@example.com" value={form.email}
                  onChange={e => update('email', e.target.value)} />
              </Field>
              <Field label="Create a Password" hint="Min. 6 characters — saves your Scroll to any device" required>
                <input type="password" className="scroll-input" placeholder="Create a password (min. 6 characters)" value={form.password}
                  onChange={e => update('password', e.target.value)} />
              </Field>

              {authError && (
                <p className="text-red-400/80 text-sm bg-red-900/10 border border-red-900/30 rounded-lg px-4 py-3">
                  {authError}
                </p>
              )}

              <p className="text-scroll-bone-dim/40 text-xs">
                Already have a Scroll?{' '}
                <a href="/signin" className="text-scroll-gold/60 hover:text-scroll-gold underline">Sign in here</a>
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="mb-8">
                <h1 className="font-serif text-3xl mb-2">Your birth code.</h1>
                <p className="text-scroll-bone-dim">This is where your alignment begins. Your life path and zodiac are calculated from this data.</p>
              </div>
              <Field label="Date of Birth" required>
                <input type="date" className="scroll-input" value={form.birthDate}
                  onChange={e => update('birthDate', e.target.value)} />
              </Field>
              <Field label="Birth Time" hint="Optional — used for advanced readings">
                <input type="time" className="scroll-input" value={form.birthTime}
                  onChange={e => update('birthTime', e.target.value)} />
              </Field>
              <Field label="Birth City" required>
                <input className="scroll-input" placeholder="City where you were born" value={form.birthCity}
                  onChange={e => update('birthCity', e.target.value)} />
              </Field>
              <Field label="State / Province" required>
                <input className="scroll-input" placeholder="State or province" value={form.birthRegion}
                  onChange={e => update('birthRegion', e.target.value)} />
              </Field>
              <Field label="Country" required>
                <input className="scroll-input" placeholder="Country" value={form.birthCountry}
                  onChange={e => update('birthCountry', e.target.value)} />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="mb-8">
                <h1 className="font-serif text-3xl mb-2">Your current season.</h1>
                <p className="text-scroll-bone-dim">What is alive for you right now — not what should be, what actually is.</p>
              </div>
              <Field label="Primary Focus Area" required>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {FOCUS_OPTIONS.map(f => (
                    <button key={f} onClick={() => update('currentFocus', f)}
                      className={`px-3 py-2 rounded-lg text-sm text-left transition-all ${
                        form.currentFocus === f
                          ? 'scroll-card-gold text-scroll-gold border-scroll-gold/50'
                          : 'scroll-card text-scroll-bone-dim hover:text-scroll-bone'
                      }`}>
                      {f}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Current Intention" hint="In a sentence: what are you committed to this season?" required>
                <textarea className="scroll-input h-24 resize-none"
                  placeholder="e.g., Building a business that reflects my full vision without compromise..."
                  value={form.currentIntention}
                  onChange={e => update('currentIntention', e.target.value)} />
              </Field>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-10">
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep(s => s - 1)}>
              Back
            </Button>
          )}
          <Button
            variant="gold"
            className="flex-1"
            disabled={!canNext}
            loading={loading}
            onClick={handleNext}
          >
            {step < STEPS.length - 1 ? 'Continue' : 'Generate My Scroll'}
          </Button>
        </div>
      </div>

      <style jsx global>{`
        .scroll-input {
          width: 100%;
          background: #161624;
          border: 1px solid #232338;
          border-radius: 8px;
          color: #F0EBE1;
          padding: 12px 16px;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
        }
        .scroll-input:focus { border-color: #C9A96E; }
        .scroll-input::placeholder { color: #B8B0A4; }
      `}</style>
    </div>
  )
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm text-scroll-bone-dim mb-2">
        {label} {required && <span className="text-scroll-gold">*</span>}
        {hint && <span className="text-scroll-bone-dim/50 ml-2 text-xs">({hint})</span>}
      </label>
      {children}
    </div>
  )
}
